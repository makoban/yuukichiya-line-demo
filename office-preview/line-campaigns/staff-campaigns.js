const $ = (id) => document.getElementById(id);
const previewStorageKey = "yuukichiya.campaign-admin-preview.v1";
const today = "2026-09-22";
const weekdayFormatter = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", weekday: "short" });
const weekdayKeyFormatter = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", weekday: "short" });
const weekdayIndexes = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const dateFormatter = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric", weekday: "short" });
const shortDateFormatter = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric" });
const schoolCounts = { "toyota-junior": 219, "josui-junior": 196, "umetsubo-elementary": 168, "takahashi-junior": 154, all: 980 };
const gradeFactors = { "junior-1": .72, "junior-2": .64, "junior-3": .61, "elementary-6": .66, all: 1 };
const reservationFactors = { none: .90, upcoming: .24, past: .58, all: 1 };
const registeredFactors = { "90": .24, "180": .42, "365": .71, all: 1 };
const measurementFactors = { none: .68, recent: .31, old: .22, all: 1 };
const conditionLabels = {
  school: "学校",
  grade: "学年",
  reservation: "予約状況",
  registered: "会員登録",
  measurement: "採寸履歴",
};
const defaultCampaigns = [
  { id: "campaign-1", title: "新入学準備フェア", body: "新入学に向けた制服・体操服の準備フェアをご案内します。", link: "https://www.yuukichi-ya.com/", date: "2026-09-22", time: "10:00", children: 142, households: 126, delivery: 118, cost: 0, condition: "豊田市立中学校・中学1年・予約なし", status: "queued" },
  { id: "campaign-2", title: "体操服キャンペーン", body: "冬の体操服・ジャージの早期購入をご案内します。", link: "https://www.yuukichi-ya.com/", date: "2026-09-24", time: "10:00", children: 116, households: 103, delivery: 96, cost: 0, condition: "豊田市立中学校・中学1年", status: "queued" },
  { id: "campaign-3", title: "採寸予約案内", body: "制服の採寸予約受付開始をご案内します。", link: "https://www.yuukichi-ya.com/", date: "2026-09-26", time: "14:00", children: 89, households: 78, delivery: 74, cost: 0, condition: "小学6年・予約なし", status: "queued" },
];

let campaigns = loadCampaigns();
let currentStep = 1;
let selectedCampaignId = campaigns[0]?.id || null;
let dialogCampaignId = null;
let weekStart = "2026-09-22";
let toastTimer = null;

function localDate(value) { return new Date(`${value}T00:00:00+09:00`); }
function isoDate(date) { return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(date); }
function addDays(value, amount) { const date = localDate(value); date.setDate(date.getDate() + amount); return isoDate(date); }
function mondayStart(value) { const date = localDate(value); const day = weekdayIndexes[weekdayKeyFormatter.format(date)]; date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)); return isoDate(date); }
function formatSchedule(date, time) { return `${dateFormatter.format(localDate(date))} ${time}`; }
function formatCost(value) { return `${new Intl.NumberFormat("ja-JP").format(value)}円`; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }

function loadCampaigns() {
  try {
    const stored = JSON.parse(localStorage.getItem(previewStorageKey));
    return Array.isArray(stored) && stored.length ? stored : clone(defaultCampaigns);
  } catch {
    return clone(defaultCampaigns);
  }
}

function saveCampaigns() { localStorage.setItem(previewStorageKey, JSON.stringify(campaigns)); }
function showToast(message) { clearTimeout(toastTimer); $("toast").textContent = message; $("toast").hidden = false; toastTimer = setTimeout(() => { $("toast").hidden = true; }, 3000); }
function selectedOptionsText(select) { return select.options[select.selectedIndex]?.textContent || "指定なし"; }

function activeConditions() {
  return [...document.querySelectorAll(".condition-row:not([hidden])")].map((row) => {
    const type = row.dataset.condition;
    const select = row.querySelector("select");
    return { type, value: select.value, text: selectedOptionsText(select) };
  });
}

function estimateAudience() {
  const values = Object.fromEntries(activeConditions().map((item) => [item.type, item.value]));
  let children = schoolCounts[values.school] || schoolCounts.all;
  children *= gradeFactors[values.grade] ?? 1;
  children *= reservationFactors[values.reservation] ?? 1;
  children *= registeredFactors[values.registered] ?? 1;
  children *= measurementFactors[values.measurement] ?? 1;
  children = Math.max(1, Math.round(children));
  const households = Math.max(1, Math.round(children * .887));
  const delivery = Math.max(1, Math.round(households * .937));
  const remaining = Math.max(0, Number($("remainingQuota").value) || 0);
  const unit = Math.max(0, Number($("unitCost").value) || 0);
  const paidMessages = Math.max(0, delivery - remaining);
  const cost = Math.ceil(paidMessages * unit);
  return { children, households, delivery, paidMessages, cost };
}

function renderEstimate() {
  const estimate = estimateAudience();
  $("childCount").textContent = `${estimate.children}人`;
  $("householdCount").textContent = `${estimate.households}世帯`;
  $("deliveryCount").textContent = `${estimate.delivery}通`;
  $("costEstimate").textContent = formatCost(estimate.cost);
  $("scheduleSummary").textContent = formatSchedule($("scheduledDate").value, $("scheduledTime").value);
  $("quotaState").classList.toggle("is-paid", estimate.cost > 0);
  $("quotaState").innerHTML = estimate.cost > 0
    ? `<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>無料枠超過 ${estimate.paidMessages}通`
    : `<i class="fa-solid fa-gift" aria-hidden="true"></i>月間無料枠内`;
  renderReview(estimate);
  return estimate;
}

function conditionSummary() { return activeConditions().map((item) => item.text).join("・") || "すべての会員"; }

function renderReview(estimate = estimateAudience()) {
  $("reviewTitle").textContent = $("campaignTitle").value || "未入力";
  $("reviewConditions").textContent = conditionSummary();
  $("reviewSchedule").textContent = formatSchedule($("scheduledDate").value, $("scheduledTime").value);
  $("reviewRecipients").textContent = `${estimate.households}世帯（配信見込み ${estimate.delivery}通）`;
  $("reviewCost").textContent = formatCost(estimate.cost);
  $("previewTitle").textContent = $("campaignTitle").value || "タイトル未入力";
  $("previewBody").textContent = $("messageBody").value || "本文未入力";
  $("previewLink").hidden = !$("messageLink").value;
}

function setStep(step) {
  currentStep = Math.max(1, Math.min(3, step));
  document.querySelectorAll(".step").forEach((button) => {
    const active = Number(button.dataset.step) === currentStep;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
  });
  document.querySelectorAll(".form-step").forEach((panel) => { panel.hidden = Number(panel.dataset.panel) !== currentStep; });
  const labels = { 1: "内容と日時へ", 2: "確認へ", 3: "配信予定を保存" };
  const icons = { 1: "fa-arrow-right", 2: "fa-check", 3: "fa-calendar-plus" };
  $("primaryActionButton").innerHTML = `<i class="fa-solid ${icons[currentStep]}" aria-hidden="true"></i><span>${labels[currentStep]}</span>`;
  $("backStepButton").hidden = currentStep === 1;
  renderEstimate();
}

function checkScheduleCollision() {
  const collision = campaigns.some((campaign) => campaign.status !== "sent" && campaign.date === $("scheduledDate").value && campaign.time === $("scheduledTime").value);
  $("scheduleHint").textContent = collision ? "同じ日時に別のLINE配信予定があります。時間をずらすことをおすすめします。" : "同じ日時の配信予定はありません。";
  $("scheduleHint").style.color = collision ? "var(--warning)" : "var(--deep)";
}

function saveCurrentCampaign() {
  if (!$("campaignTitle").value.trim() || !$("messageBody").value.trim()) {
    setStep(2);
    showToast("管理用タイトルとLINE本文を入力してください。");
    return;
  }
  const estimate = estimateAudience();
  const campaign = {
    id: crypto.randomUUID(),
    title: $("campaignTitle").value.trim(),
    body: $("messageBody").value.trim(),
    link: $("messageLink").value.trim(),
    date: $("scheduledDate").value,
    time: $("scheduledTime").value,
    children: estimate.children,
    households: estimate.households,
    delivery: estimate.delivery,
    cost: estimate.cost,
    condition: conditionSummary(),
    status: "queued",
  };
  campaigns.push(campaign);
  selectedCampaignId = campaign.id;
  weekStart = mondayStart(campaign.date);
  saveCampaigns();
  renderQueue();
  showToast("配信予定をキューへ保存しました。まだ送信されていません。");
}

function eventClass(campaign) {
  if (campaign.status === "draft") return "is-draft";
  if (campaign.status === "sent") return "is-sent";
  return "";
}

function statusLabel(campaign) {
  if (campaign.status === "sent") return "送信済み（確認用）";
  if (campaign.status === "draft") return "下書き";
  return "配信待ち";
}

function renderTimeline() {
  const timeline = $("timeline");
  timeline.replaceChildren();
  let visibleEvents = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    const day = document.createElement("section");
    day.className = `timeline-day${date === today ? " is-today" : ""}`;
    day.setAttribute("role", "listitem");
    const header = document.createElement("header");
    const label = document.createElement("strong");
    const note = document.createElement("span");
    label.textContent = `${shortDateFormatter.format(localDate(date))}（${weekdayFormatter.format(localDate(date))}）`;
    note.textContent = date === today ? "今日" : "";
    header.append(label, note);
    const events = document.createElement("div");
    events.className = "timeline-events";
    const dailyCampaigns = campaigns.filter((campaign) => campaign.date === date).sort((a, b) => a.time.localeCompare(b.time));
    for (const campaign of dailyCampaigns) {
      visibleEvents += 1;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `timeline-event ${eventClass(campaign)}${campaign.id === selectedCampaignId ? " is-selected" : ""}`.trim();
      button.dataset.campaignId = campaign.id;
      button.setAttribute("aria-pressed", String(campaign.id === selectedCampaignId));
      const time = document.createElement("time");
      const title = document.createElement("strong");
      time.textContent = campaign.time;
      title.textContent = campaign.title;
      button.append(time, title);
      button.addEventListener("click", () => { selectedCampaignId = campaign.id; renderQueue(); });
      events.append(button);
    }
    day.append(header, events);
    timeline.append(day);
  }
  $("emptyQueue").hidden = visibleEvents > 0;
}

function fact(label, value, className = "") {
  return `<div class="campaign-fact"><span>${label}</span><strong class="${className}">${value}</strong></div>`;
}

function renderSelectedCampaign() {
  const campaign = campaigns.find((item) => item.id === selectedCampaignId) || campaigns.find((item) => item.date >= weekStart && item.date <= addDays(weekStart, 6));
  if (!campaign) { $("selectedCampaign").hidden = true; return; }
  selectedCampaignId = campaign.id;
  $("selectedCampaign").hidden = false;
  $("selectedCampaign").innerHTML = `
    <div class="campaign-main"><strong>${escapeHtml(campaign.title)}</strong><span>${escapeHtml(campaign.condition)}</span></div>
    ${fact("送信予定日時", `${escapeHtml(campaign.date)}<br>${escapeHtml(campaign.time)}`)}
    ${fact("送信予定", `${escapeHtml(campaign.households)}世帯`)}
    ${fact("LINE費用（概算）", formatCost(campaign.cost))}
    ${fact("状態", statusLabel(campaign), `status-label ${campaign.status === "sent" ? "sent" : campaign.status === "draft" ? "draft" : ""}`)}
    <div class="campaign-actions">
      <button type="button" class="send-now" data-action="send" ${campaign.status === "sent" ? "disabled" : ""}><i class="fa-solid fa-paper-plane" aria-hidden="true"></i>今すぐ送る</button>
      <button type="button" class="copy-campaign" data-action="copy"><i class="fa-solid fa-copy" aria-hidden="true"></i>コピー</button>
      <button type="button" class="delete-campaign" data-action="delete"><i class="fa-solid fa-trash-can" aria-hidden="true"></i>削除</button>
    </div>`;
  $("selectedCampaign").querySelector('[data-action="send"]')?.addEventListener("click", () => openSendDialog(campaign.id));
  $("selectedCampaign").querySelector('[data-action="copy"]')?.addEventListener("click", () => copyCampaign(campaign.id));
  $("selectedCampaign").querySelector('[data-action="delete"]')?.addEventListener("click", () => openDeleteDialog(campaign.id));
}

function escapeHtml(value) { const node = document.createElement("span"); node.textContent = String(value ?? ""); return node.innerHTML; }

function renderQueue() {
  $("weekLabel").textContent = `${shortDateFormatter.format(localDate(weekStart))}〜${shortDateFormatter.format(localDate(addDays(weekStart, 6)))}`;
  renderTimeline();
  renderSelectedCampaign();
}

function copyCampaign(id) {
  const source = campaigns.find((campaign) => campaign.id === id);
  if (!source) return;
  const duplicate = { ...clone(source), id: crypto.randomUUID(), title: `${source.title}（コピー）`, date: addDays(source.date, 1), status: "draft" };
  campaigns.push(duplicate);
  selectedCampaignId = duplicate.id;
  weekStart = mondayStart(duplicate.date);
  saveCampaigns();
  renderQueue();
  showToast("配信予定を下書きとしてコピーしました。");
}

function openSendDialog(id) {
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) return;
  dialogCampaignId = id;
  $("sendConfirmation").checked = false;
  $("confirmSendButton").disabled = true;
  $("sendDialogSummary").innerHTML = `<strong>${escapeHtml(campaign.title)}</strong><br>${escapeHtml(campaign.condition)}<br>送信予定 ${escapeHtml(campaign.households)}世帯／概算 ${formatCost(campaign.cost)}`;
  $("sendDialog").showModal();
}

function openDeleteDialog(id) {
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) return;
  dialogCampaignId = id;
  $("deleteDialogSummary").innerHTML = `<strong>${escapeHtml(campaign.title)}</strong><br>${escapeHtml(formatSchedule(campaign.date, campaign.time))}`;
  $("deleteDialog").showModal();
}

document.querySelectorAll(".step").forEach((button) => button.addEventListener("click", () => setStep(Number(button.dataset.step))));
document.querySelectorAll("select, input, textarea").forEach((control) => control.addEventListener("input", () => { renderEstimate(); checkScheduleCollision(); }));
document.querySelectorAll("[data-remove-condition]").forEach((button) => button.addEventListener("click", () => {
  button.closest(".condition-row").hidden = true;
  renderEstimate();
  showToast(`${conditionLabels[button.dataset.removeCondition]}条件を外しました。`);
}));

$("addConditionButton").addEventListener("click", () => {
  const type = $("conditionType").value;
  const row = document.querySelector(`[data-condition="${type}"]`);
  if (!row || !row.hidden) { showToast("その条件はすでに追加されています。"); return; }
  row.hidden = false;
  renderEstimate();
  showToast(`${conditionLabels[type]}条件を追加しました。`);
});

$("primaryActionButton").addEventListener("click", () => {
  if (currentStep < 3) { setStep(currentStep + 1); return; }
  saveCurrentCampaign();
});
$("backStepButton").addEventListener("click", () => setStep(currentStep - 1));
$("previousWeek").addEventListener("click", () => { weekStart = addDays(weekStart, -7); renderQueue(); });
$("nextWeek").addEventListener("click", () => { weekStart = addDays(weekStart, 7); renderQueue(); });
$("thisWeekButton").addEventListener("click", () => { weekStart = mondayStart(today); renderQueue(); });

$("sendConfirmation").addEventListener("change", () => { $("confirmSendButton").disabled = !$("sendConfirmation").checked; });
$("sendForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const campaign = campaigns.find((item) => item.id === dialogCampaignId);
  if (!campaign || !$("sendConfirmation").checked) return;
  campaign.status = "sent";
  saveCampaigns();
  $("sendDialog").close();
  renderQueue();
  showToast("確認画面上で送信済みにしました。実LINEには送信していません。");
});
$("deleteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  campaigns = campaigns.filter((item) => item.id !== dialogCampaignId);
  selectedCampaignId = campaigns[0]?.id || null;
  saveCampaigns();
  $("deleteDialog").close();
  renderQueue();
  showToast("配信予定を確認用キューから削除しました。");
});
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => $(button.dataset.closeDialog).close()));
$("resetDemoButton").addEventListener("click", () => {
  campaigns = clone(defaultCampaigns);
  selectedCampaignId = campaigns[0].id;
  weekStart = mondayStart(today);
  localStorage.removeItem(previewStorageKey);
  $("campaignForm").reset();
  $("remainingQuota").value = $("remainingQuota").defaultValue;
  $("unitCost").value = $("unitCost").defaultValue;
  document.querySelector('[data-condition="school"]').hidden = false;
  document.querySelector('[data-condition="grade"]').hidden = false;
  document.querySelector('[data-condition="reservation"]').hidden = false;
  document.querySelector('[data-condition="registered"]').hidden = true;
  document.querySelector('[data-condition="measurement"]').hidden = true;
  document.querySelector(".cost-settings").open = false;
  setStep(1);
  checkScheduleCollision();
  renderQueue();
  showToast("確認用データを初期状態へ戻しました。");
});

weekStart = mondayStart(today);
checkScheduleCollision();
setStep(1);
renderQueue();
