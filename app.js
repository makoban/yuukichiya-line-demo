const memberNumber = "YK-001234";
const reservationStorageKey = "yuukichiya.measurementReservations.v1";

const avatarFiles = [
  "avatar-01-student-girl.png",
  "avatar-02-student-boy.png",
  "avatar-03-student-senior.png",
  "avatar-04-guardian.png",
  "avatar-05-rabbit.png",
  "avatar-06-cat.png",
  "avatar-07-dog.png",
  "avatar-08-bear.png",
  "avatar-09-penguin.png",
  "avatar-10-owl.png",
  "avatar-11-fox.png",
  "avatar-12-mascot.png",
];

const initialMembers = [
  {
    id: "m1",
    name: "山田 由美",
    birthday: "1985-06-11",
    role: "代表者",
    gender: "女性",
    school: "",
    avatar: "./assets/avatars/avatar-04-guardian.png",
  },
  {
    id: "m2",
    name: "山田 花子",
    birthday: "2013-08-20",
    role: "生徒",
    gender: "女性",
    school: "豊田市立さくら中学校",
    avatar: "./assets/avatars/avatar-01-student-girl.png",
  },
  {
    id: "m3",
    name: "山田 太郎",
    birthday: "2015-05-12",
    role: "生徒",
    gender: "男性",
    school: "豊田市立みどり小学校",
    avatar: "./assets/avatars/avatar-02-student-boy.png",
  },
];

const pointHistory = [
  { label: "学生服購入", date: "2026/06/10", delta: 300 },
  { label: "紙カードから移行", date: "2026/05/22", delta: 1000 },
  { label: "補正サービス利用", date: "2026/05/12", delta: -50 },
];

let members = cloneMembers(initialMembers);
let selectedId = members[0].id;
let selectedReservationSlot = "";
let latestReservation = null;
let pointBalance = 1250;
let lineProfile = null;

const memberList = document.getElementById("memberList");
const avatarGrid = document.getElementById("avatarGrid");
const avatarSheet = document.getElementById("avatarSheet");
const avatarOpenButton = document.getElementById("avatarOpenButton");
const avatarCloseButton = document.getElementById("avatarCloseButton");
const representativeAvatar = document.getElementById("representativeAvatar");
const representativeName = document.getElementById("representativeName");
const representativeBirthday = document.getElementById("representativeBirthday");
const memberNumberText = document.getElementById("memberNumberText");
const nameInput = document.getElementById("nameInput");
const birthdayInput = document.getElementById("birthdayInput");
const genderInput = document.getElementById("genderInput");
const schoolInput = document.getElementById("schoolInput");
const photoInput = document.getElementById("photoInput");
const addMemberButton = document.getElementById("addMemberButton");
const liffStatus = document.getElementById("liffStatus");
const pointsMenuButton = document.getElementById("pointsMenuButton");
const pointsScreen = document.getElementById("pointsScreen");
const pointsCloseButton = document.getElementById("pointsCloseButton");
const pointBalanceText = document.getElementById("pointBalanceText");
const pointMemberText = document.getElementById("pointMemberText");
const pointsQrCanvas = document.getElementById("pointsQrCanvas");
const pointHistoryList = document.getElementById("pointHistoryList");
const latestSyncText = document.getElementById("latestSyncText");
const staffScanButton = document.getElementById("staffScanButton");
const staffSheet = document.getElementById("staffSheet");
const staffCloseButton = document.getElementById("staffCloseButton");
const staffMemberName = document.getElementById("staffMemberName");
const staffCurrentPoints = document.getElementById("staffCurrentPoints");
const staffDeltaInput = document.getElementById("staffDeltaInput");
const staffReasonInput = document.getElementById("staffReasonInput");
const applyPointsButton = document.getElementById("applyPointsButton");
const pointEffect = document.getElementById("pointEffect");
const pointEffectText = document.getElementById("pointEffectText");
const largeQrFrame = document.getElementById("largeQrFrame");
const reservationMenuButton = document.getElementById("reservationMenuButton");
const reservationScreen = document.getElementById("reservationScreen");
const reservationCloseButton = document.getElementById("reservationCloseButton");
const reservationMemberInput = document.getElementById("reservationMemberInput");
const reservationStoreInput = document.getElementById("reservationStoreInput");
const reservationDateInput = document.getElementById("reservationDateInput");
const reservationPhoneInput = document.getElementById("reservationPhoneInput");
const reservationNoteInput = document.getElementById("reservationNoteInput");
const slotSummaryText = document.getElementById("slotSummaryText");
const slotGrid = document.getElementById("slotGrid");
const confirmReservationButton = document.getElementById("confirmReservationButton");
const reservationConfirmation = document.getElementById("reservationConfirmation");
const reservationConfirmedTime = document.getElementById("reservationConfirmedTime");
const reservationConfirmationDetails = document.getElementById("reservationConfirmationDetails");
const lineSendStatus = document.getElementById("lineSendStatus");
const sendLineMessageButton = document.getElementById("sendLineMessageButton");
const lineConfig = window.YUUKICHIYA_LINE_CONFIG || {};
const reservationStores = lineConfig.reservationStores?.length ? lineConfig.reservationStores : ["本店", "高橋店"];
const reservationStartHour = Number(lineConfig.reservationStartHour || 10);
const reservationEndHour = Number(lineConfig.reservationEndHour || 18);
const reservationSlotHours = Array.from(
  { length: Math.max(1, reservationEndHour - reservationStartHour) },
  (_, index) => reservationStartHour + index,
);

function selectedMember() {
  return members.find((member) => member.id === selectedId) || members[0];
}

function cloneMembers(list) {
  return list.map((member) => ({ ...member }));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function gradeText(value) {
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return "学年未登録";
  const now = new Date();
  const academicYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const earlyYearAdjustment = month < 4 || (month === 4 && day === 1) ? 1 : 0;
  const gradeNumber = academicYear - date.getFullYear() - 6 + earlyYearAdjustment;
  if (gradeNumber <= 0) return "未就学";
  if (gradeNumber <= 6) return `小学${gradeNumber}年`;
  if (gradeNumber <= 9) return `中学${gradeNumber - 6}年`;
  if (gradeNumber <= 12) return `高校${gradeNumber - 9}年`;
  return "卒業生";
}

function memberDetail(member, index) {
  const kind = index === 0 ? "代表者" : gradeText(member.birthday);
  const school = index === 0 ? "" : member.school;
  return [kind, member.gender, school, formatBirthday(member.birthday)].filter(Boolean).join(" / ");
}

function formatBirthday(value) {
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return "未登録";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDateInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateHuman(value) {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const date = parseDateInput(value);
  if (!Number.isFinite(date.getTime())) return value;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}

function slotEnd(start) {
  const hour = Number(start.slice(0, 2));
  return `${pad(hour + 1)}:00`;
}

function isPastSlot(dateValue, start) {
  const [hour] = start.split(":").map(Number);
  const date = parseDateInput(dateValue);
  date.setHours(hour, 0, 0, 0);
  return date <= new Date();
}

function renderRepresentative() {
  const rep = members[0];
  representativeAvatar.src = rep.avatar;
  representativeAvatar.alt = `${rep.name}のアイコン`;
  representativeName.textContent = `${rep.name} 様`;
  memberNumberText.textContent = memberNumber;
  representativeBirthday.textContent = formatBirthday(rep.birthday);
  drawQr(`${memberNumber}:${rep.name}:${rep.birthday}`);
}

async function initLiff() {
  if (!lineConfig.liffId || !window.liff) {
    liffStatus.textContent = "勇吉屋 公式LINE";
    return;
  }

  try {
    await liff.init({ liffId: lineConfig.liffId });
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }
    lineProfile = await liff.getProfile();
    liffStatus.textContent = "LINE連携中";
    if (lineProfile?.displayName) {
      members[0].name = lineProfile.displayName;
      if (lineProfile.pictureUrl) {
        members[0].avatar = lineProfile.pictureUrl;
      }
      render();
    }
  } catch (error) {
    liffStatus.textContent = "勇吉屋 公式LINE";
    console.warn("LIFF initialization failed", error);
  }
}

function renderMembers() {
  memberList.innerHTML = members
    .map((member, index) => {
      const active = member.id === selectedId ? " is-active" : "";
      const representative = index === 0 ? " is-representative" : "";
      const detail = memberDetail(member, index);
      return `
        <button class="member-card${active}${representative}" type="button" data-id="${escapeHtml(member.id)}">
          <span class="member-avatar-frame">
            <img src="${escapeHtml(member.avatar)}" alt="${escapeHtml(member.name)}のアイコン" />
          </span>
          <span class="member-card-main">
            <strong>${escapeHtml(member.name)}</strong>
            <span class="member-card-detail">${escapeHtml(detail)}</span>
          </span>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".member-card").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.id;
      render();
    });
  });
}

function renderEditor() {
  const member = selectedMember();
  nameInput.value = member.name;
  birthdayInput.value = member.birthday;
  if (genderInput) genderInput.value = member.gender || "未回答";
  schoolInput.value = member.school;
}

function renderAvatars() {
  const current = members[0].avatar;
  avatarGrid.innerHTML = avatarFiles
    .map((file) => {
      const src = `./assets/avatars/${file}`;
      const active = current.endsWith(file) ? " is-active" : "";
      return `
        <button class="avatar-option${active}" type="button" data-src="${escapeHtml(src)}" aria-label="アイコンを選択">
          <span class="avatar-option-frame">
            <img src="${escapeHtml(src)}" alt="" />
          </span>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".avatar-option").forEach((button) => {
    button.addEventListener("click", () => {
      members[0].avatar = button.dataset.src;
      selectedId = members[0].id;
      render();
      closeAvatarSheet();
    });
  });
}

function updateSelected(key, value) {
  selectedMember()[key] = value;
  renderRepresentative();
  renderMembers();
  renderAvatars();
  renderReservationMembers();
  if (!pointsScreen.hidden) renderPoints();
}

function drawQr(seed, canvas = document.getElementById("qrCanvas")) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 25;
  const cell = Math.floor(size / cells);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  function hashAt(index) {
    let hash = 2166136261;
    const text = `${seed}:${index}`;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function finder(x, y) {
    ctx.fillStyle = "#111827";
    ctx.fillRect(x * cell, y * cell, cell * 7, cell * 7);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect((x + 1) * cell, (y + 1) * cell, cell * 5, cell * 5);
    ctx.fillStyle = "#111827";
    ctx.fillRect((x + 2) * cell, (y + 2) * cell, cell * 3, cell * 3);
  }

  finder(1, 1);
  finder(17, 1);
  finder(1, 17);

  ctx.fillStyle = "#111827";
  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const inFinder =
        (x >= 1 && x < 8 && y >= 1 && y < 8) ||
        (x >= 17 && x < 24 && y >= 1 && y < 8) ||
        (x >= 1 && x < 8 && y >= 17 && y < 24);
      if (inFinder) continue;
      if (hashAt(y * cells + x) % 3 === 0) {
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }
}

function renderPoints() {
  pointBalanceText.textContent = `${pointBalance.toLocaleString("ja-JP")}pt`;
  pointMemberText.textContent = `${members[0].name} 様 / ${memberNumber}`;
  staffMemberName.textContent = `${members[0].name} 様`;
  staffCurrentPoints.textContent = `${pointBalance.toLocaleString("ja-JP")}pt`;
  latestSyncText.textContent = "リアルタイム反映";
  drawQr(`${memberNumber}:${members[0].name}:points`, pointsQrCanvas);
  pointHistoryList.innerHTML = pointHistory
    .map((item) => {
      const sign = item.delta > 0 ? "+" : "";
      const minus = item.delta < 0 ? " is-minus" : "";
      return `
        <div class="point-history-item">
          <span>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.date)}</span>
          </span>
          <strong class="point-delta${minus}">${sign}${item.delta.toLocaleString("ja-JP")}pt</strong>
        </div>
      `;
    })
    .join("");
}

function openPointsScreen() {
  renderPoints();
  pointsScreen.hidden = false;
  document.body.classList.add("points-open");
}

function closePointsScreen() {
  pointsScreen.hidden = true;
  document.body.classList.remove("points-open");
}

function openStaffSheet() {
  renderPoints();
  staffSheet.hidden = false;
  document.body.classList.add("staff-open");
  largeQrFrame.classList.add("is-scanning");
  window.setTimeout(() => largeQrFrame.classList.remove("is-scanning"), 900);
}

function closeStaffSheet() {
  staffSheet.hidden = true;
  document.body.classList.remove("staff-open");
}

function showPointEffect(delta) {
  pointEffectText.textContent = `${delta > 0 ? "+" : ""}${delta.toLocaleString("ja-JP")}pt`;
  pointEffectText.classList.toggle("is-minus", delta < 0);
  pointEffect.hidden = false;
  window.setTimeout(() => {
    pointEffect.hidden = true;
  }, 1150);
}

function getSeedReservations() {
  const today = new Date();
  const tomorrow = toDateInputValue(addDays(today, 1));
  const twoDaysLater = toDateInputValue(addDays(today, 2));
  return [
    {
      id: "seed-tomorrow-11",
      date: tomorrow,
      start: "11:00",
      end: "12:00",
      store: reservationStores[0],
      memberName: "他のお客様",
      status: "reserved",
    },
    {
      id: "seed-two-days-14",
      date: twoDaysLater,
      start: "14:00",
      end: "15:00",
      store: reservationStores[0],
      memberName: "他のお客様",
      status: "reserved",
    },
  ];
}

function getStoredReservations() {
  try {
    const parsed = JSON.parse(localStorage.getItem(reservationStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Reservation storage read failed", error);
    return [];
  }
}

function saveStoredReservations(reservations) {
  try {
    localStorage.setItem(reservationStorageKey, JSON.stringify(reservations));
  } catch (error) {
    console.warn("Reservation storage write failed", error);
  }
}

function getAllReservations() {
  return [...getSeedReservations(), ...getStoredReservations()];
}

function isSlotTaken(date, store, start, reservations = getAllReservations()) {
  return reservations.some(
    (reservation) =>
      reservation.date === date &&
      reservation.store === store &&
      reservation.start === start &&
      reservation.status !== "cancelled",
  );
}

function renderReservationStores() {
  reservationStoreInput.innerHTML = reservationStores
    .map((store) => `<option value="${escapeHtml(store)}">${escapeHtml(store)}</option>`)
    .join("");
}

function reservableMembers() {
  const children = members.filter((_, index) => index > 0);
  return children.length ? children : members;
}

function renderReservationMembers() {
  const previous = reservationMemberInput.value;
  const options = reservableMembers();
  reservationMemberInput.innerHTML = options
    .map((member) => `<option value="${escapeHtml(member.id)}">${escapeHtml(member.name)}</option>`)
    .join("");
  if (options.some((member) => member.id === previous)) {
    reservationMemberInput.value = previous;
  }
}

function selectedReservationMember() {
  return members.find((member) => member.id === reservationMemberInput.value) || reservableMembers()[0] || members[0];
}

function updateConfirmReservationButton() {
  const hasPhone = reservationPhoneInput.value.trim().length >= 10;
  confirmReservationButton.disabled = !(selectedReservationSlot && hasPhone);
}

function renderSlots() {
  const date = reservationDateInput.value;
  const store = reservationStoreInput.value;
  const reservations = getAllReservations();
  let openCount = 0;

  if (selectedReservationSlot) {
    const unavailable =
      isSlotTaken(date, store, selectedReservationSlot, reservations) || isPastSlot(date, selectedReservationSlot);
    if (unavailable) selectedReservationSlot = "";
  }

  slotGrid.innerHTML = reservationSlotHours
    .map((hour) => {
      const start = `${pad(hour)}:00`;
      const end = `${pad(hour + 1)}:00`;
      const taken = isSlotTaken(date, store, start, reservations);
      const past = isPastSlot(date, start);
      const disabled = taken || past;
      const selected = start === selectedReservationSlot ? " is-selected" : "";
      const status = taken ? "予約済み" : past ? "受付終了" : "空き";
      if (!disabled) openCount += 1;
      return `
        <button class="slot-button${selected}" type="button" data-start="${start}" ${disabled ? "disabled" : ""}>
          ${start}-${end}
          <span>${status}</span>
        </button>
      `;
    })
    .join("");

  slotSummaryText.textContent = `${openCount}枠空き`;
  document.querySelectorAll(".slot-button:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      selectedReservationSlot = button.dataset.start;
      renderSlots();
      updateConfirmReservationButton();
    });
  });
  updateConfirmReservationButton();
}

function initReservationForm() {
  const today = toDateInputValue(new Date());
  reservationDateInput.min = today;
  reservationDateInput.value = today;
  reservationPhoneInput.value = "090-1234-5678";
  renderReservationStores();
  renderReservationMembers();
  renderSlots();
}

function buildReservationPayload() {
  const target = selectedReservationMember();
  const date = reservationDateInput.value;
  const start = selectedReservationSlot;
  return {
    id: `YK-M-${Date.now().toString(36).toUpperCase()}`,
    memberNumber,
    guardianName: members[0].name,
    childName: target.name,
    childId: target.id,
    childSchool: target.school,
    date,
    start,
    end: slotEnd(start),
    store: reservationStoreInput.value,
    phone: reservationPhoneInput.value.trim(),
    note: reservationNoteInput.value.trim(),
    lineDisplayName: lineProfile?.displayName || "",
    createdAt: new Date().toISOString(),
    status: "reserved",
  };
}

function createLocalReservation(payload) {
  const stored = getStoredReservations();
  const reservations = [...getSeedReservations(), ...stored];
  if (isSlotTaken(payload.date, payload.store, payload.start, reservations)) {
    const error = new Error("slot_taken");
    error.code = "slot_taken";
    throw error;
  }
  saveStoredReservations([payload, ...stored]);
  return payload;
}

async function createServerReservation(payload) {
  const idToken = window.liff?.getIDToken?.() || "";
  const response = await fetch(lineConfig.reservationApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, liffIdToken: idToken }),
  });
  if (response.status === 409) {
    const error = new Error("slot_taken");
    error.code = "slot_taken";
    throw error;
  }
  if (!response.ok) {
    throw new Error(`Reservation API failed: ${response.status}`);
  }
  return response.json();
}

function buildReservationLineMessage(reservation) {
  const lines = [
    "採寸予約が確定しました。",
    `日時：${formatDateHuman(reservation.date)} ${reservation.start}-${reservation.end}`,
    `店舗：${reservation.store}`,
    `対象：${reservation.childName}`,
    `保護者：${reservation.guardianName}`,
    `電話：${reservation.phone}`,
    `会員番号：${reservation.memberNumber}`,
    `受付番号：${reservation.id}`,
  ];
  if (reservation.note) lines.push(`メモ：${reservation.note}`);
  return lines.join("\n");
}

function renderReservationConfirmation(reservation) {
  reservationConfirmedTime.textContent = `${formatDateHuman(reservation.date)} ${reservation.start}-${reservation.end}`;
  reservationConfirmationDetails.innerHTML = [
    ["店舗", reservation.store],
    ["対象", reservation.childName],
    ["保護者", reservation.guardianName],
    ["電話", reservation.phone],
    ["受付番号", reservation.id],
  ]
    .map(
      ([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `,
    )
    .join("");
  reservationConfirmation.hidden = false;
}

function setLineStatus(text, type = "") {
  lineSendStatus.className = `line-send-status${type ? ` is-${type}` : ""}`;
  lineSendStatus.textContent = text;
}

async function sendReservationLineMessage(reservation) {
  const text = buildReservationLineMessage(reservation);
  sendLineMessageButton.dataset.mode = "send";
  sendLineMessageButton.textContent = "LINEメッセージを再送";

  if (window.liff?.isInClient?.() && window.liff?.isLoggedIn?.() && typeof window.liff.sendMessages === "function") {
    try {
      await window.liff.sendMessages([{ type: "text", text }]);
      setLineStatus("LINEメッセージへ送信しました。", "success");
      return true;
    } catch (error) {
      console.warn("LIFF message send failed", error);
      setLineStatus("予約は確定済みです。LINE送信権限を確認してください。", "warning");
      return false;
    }
  }

  sendLineMessageButton.dataset.mode = "copy";
  sendLineMessageButton.textContent = "メッセージ内容をコピー";
  setLineStatus("予約は確定済みです。本番LIFFで開くとLINEメッセージ送信まで実行します。", "warning");
  return false;
}

async function confirmReservation() {
  if (!selectedReservationSlot) return;
  const payload = buildReservationPayload();
  confirmReservationButton.disabled = true;
  confirmReservationButton.textContent = "予約中";
  setLineStatus("LINEメッセージを準備中");

  try {
    const result = lineConfig.reservationApiUrl
      ? await createServerReservation(payload)
      : { reservation: createLocalReservation(payload), lineMessageSent: false };
    const reservation = result.reservation || result;
    latestReservation = reservation;
    renderSlots();
    renderReservationConfirmation(reservation);
    if (result.lineMessageSent) {
      setLineStatus("予約確定メッセージをLINEへ送信しました。", "success");
    } else {
      await sendReservationLineMessage(reservation);
    }
  } catch (error) {
    if (error.code === "slot_taken") {
      selectedReservationSlot = "";
      renderSlots();
      setLineStatus("その時間は他の予約が入りました。別の空き時間を選んでください。", "warning");
    } else {
      console.error(error);
      setLineStatus("予約処理でエラーが発生しました。接続先APIを確認してください。", "warning");
    }
  } finally {
    confirmReservationButton.textContent = "この時間で予約する";
    updateConfirmReservationButton();
  }
}

async function copyReservationMessage() {
  if (!latestReservation) return;
  const text = buildReservationLineMessage(latestReservation);
  try {
    await navigator.clipboard.writeText(text);
    setLineStatus("メッセージ内容をコピーしました。", "success");
  } catch (error) {
    console.warn("Clipboard copy failed", error);
    setLineStatus(text, "warning");
  }
}

function openReservationScreen() {
  renderReservationMembers();
  renderSlots();
  reservationScreen.hidden = false;
  document.body.classList.add("reservation-open");
}

function closeReservationScreen() {
  reservationScreen.hidden = true;
  document.body.classList.remove("reservation-open");
}

function openAvatarSheet() {
  selectedId = members[0].id;
  render();
  avatarSheet.hidden = false;
  document.body.classList.add("sheet-open");
}

function closeAvatarSheet() {
  avatarSheet.hidden = true;
  document.body.classList.remove("sheet-open");
}

function render() {
  renderRepresentative();
  renderMembers();
  renderEditor();
  renderAvatars();
  renderReservationMembers();
}

function openInitialScreenFromUrl() {
  const screen = new URLSearchParams(window.location.search).get("screen");
  if (screen === "points") openPointsScreen();
  if (screen === "reservation" || screen === "measurement-reservation") openReservationScreen();
}

avatarOpenButton.addEventListener("click", openAvatarSheet);
avatarCloseButton.addEventListener("click", closeAvatarSheet);
avatarSheet.addEventListener("click", (event) => {
  if (event.target === avatarSheet) closeAvatarSheet();
});

pointsMenuButton.addEventListener("click", openPointsScreen);
pointsCloseButton.addEventListener("click", closePointsScreen);
staffScanButton.addEventListener("click", openStaffSheet);
staffCloseButton.addEventListener("click", closeStaffSheet);
staffSheet.addEventListener("click", (event) => {
  if (event.target === staffSheet) closeStaffSheet();
});

document.querySelectorAll(".staff-delta-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".staff-delta-button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    staffDeltaInput.value = button.dataset.delta;
  });
});

applyPointsButton.addEventListener("click", () => {
  const delta = Number(staffDeltaInput.value || 0);
  if (!Number.isFinite(delta) || delta === 0) return;
  pointBalance += delta;
  pointHistory.unshift({
    label: staffReasonInput.value,
    date: new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }),
    delta,
  });
  closeStaffSheet();
  renderPoints();
  showPointEffect(delta);
});

reservationMenuButton.addEventListener("click", openReservationScreen);
reservationCloseButton.addEventListener("click", closeReservationScreen);
reservationDateInput.addEventListener("change", () => {
  selectedReservationSlot = "";
  renderSlots();
});
reservationStoreInput.addEventListener("change", () => {
  selectedReservationSlot = "";
  renderSlots();
});
reservationMemberInput.addEventListener("change", updateConfirmReservationButton);
reservationPhoneInput.addEventListener("input", updateConfirmReservationButton);
reservationNoteInput.addEventListener("input", updateConfirmReservationButton);
confirmReservationButton.addEventListener("click", confirmReservation);
sendLineMessageButton.addEventListener("click", () => {
  if (!latestReservation) return;
  if (sendLineMessageButton.dataset.mode === "copy") {
    copyReservationMessage();
    return;
  }
  sendReservationLineMessage(latestReservation);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !avatarSheet.hidden) closeAvatarSheet();
  if (event.key === "Escape" && !pointsScreen.hidden) closePointsScreen();
  if (event.key === "Escape" && !reservationScreen.hidden) closeReservationScreen();
  if (event.key === "Escape" && !staffSheet.hidden) closeStaffSheet();
});

nameInput.addEventListener("input", (event) => updateSelected("name", event.target.value));
birthdayInput.addEventListener("input", (event) => updateSelected("birthday", event.target.value));
if (genderInput) {
  genderInput.addEventListener("change", (event) => updateSelected("gender", event.target.value));
}
schoolInput.addEventListener("input", (event) => updateSelected("school", event.target.value));

photoInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    members[0].avatar = reader.result;
    selectedId = members[0].id;
    render();
    closeAvatarSheet();
  };
  reader.readAsDataURL(file);
});

addMemberButton.addEventListener("click", () => {
  const nextIndex = members.length + 1;
  const member = {
    id: `m${Date.now()}`,
    name: `山田 追加${nextIndex}`,
    birthday: "2017-04-02",
    role: "生徒",
    gender: "未回答",
    school: "学校名を入力",
    avatar: `./assets/avatars/${avatarFiles[(nextIndex + 4) % avatarFiles.length]}`,
  };
  members.push(member);
  selectedId = member.id;
  render();
});

window.addEventListener("storage", (event) => {
  if (event.key === reservationStorageKey && !reservationScreen.hidden) renderSlots();
});

initReservationForm();
render();
openInitialScreenFromUrl();
initLiff();
