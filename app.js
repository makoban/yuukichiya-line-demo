const memberNumber = "YK-001234";
const initialPointBalance = 1250;

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
    address: "愛知県豊田市桜町1-2-3",
    avatar: "./assets/avatars/avatar-04-guardian.png",
  },
  {
    id: "m2",
    name: "山田 花子",
    birthday: "2013-08-20",
    role: "生徒",
    gender: "女性",
    school: "豊田市立さくら中学校",
    address: "愛知県豊田市桜町1-2-3",
    avatar: "./assets/avatars/avatar-01-student-girl.png",
  },
  {
    id: "m3",
    name: "山田 太郎",
    birthday: "2015-05-12",
    role: "生徒",
    gender: "男性",
    school: "豊田市立みどり小学校",
    address: "愛知県豊田市桜町1-2-3",
    avatar: "./assets/avatars/avatar-02-student-boy.png",
  },
];

let members = cloneMembers(initialMembers);
let selectedId = members[0].id;
let pointBalance = initialPointBalance;
const initialPointTransactions = [
  {
    id: "pt-1",
    delta: 450,
    reason: "学生服購入",
    staff: "本店",
    createdAt: "2026-06-08T14:20:00+09:00",
    balanceAfter: 1250,
  },
  {
    id: "pt-2",
    delta: -100,
    reason: "補正サービス利用",
    staff: "本店",
    createdAt: "2026-05-28T16:05:00+09:00",
    balanceAfter: 800,
  },
  {
    id: "pt-3",
    delta: 300,
    reason: "紙カードから移行",
    staff: "高橋店",
    createdAt: "2026-05-02T11:45:00+09:00",
    balanceAfter: 900,
  },
];
let pointTransactions = clonePointTransactions(initialPointTransactions);

const initialMeasurementRecords = [
  {
    id: "mr-1",
    memberId: "m2",
    measuredAt: "2026-06-08T16:20:00+09:00",
    staff: "本店 佐藤",
    item: "夏制服 上下",
    values: [
      ["身長", "155cm"],
      ["胸囲", "78cm"],
      ["ウエスト", "62cm"],
      ["股下", "68cm"],
    ],
    note: "中学夏服の買い替え相談",
  },
  {
    id: "mr-2",
    memberId: "m3",
    measuredAt: "2026-06-07T11:05:00+09:00",
    staff: "高橋店 鈴木",
    item: "体操服・ハーフパンツ",
    values: [
      ["身長", "142cm"],
      ["胸囲", "70cm"],
      ["ウエスト", "58cm"],
      ["股下", "61cm"],
    ],
    note: "成長分を見てワンサイズ上を提案",
  },
  {
    id: "mr-3",
    memberId: "m1",
    measuredAt: "2026-06-05T14:35:00+09:00",
    staff: "本店 伊藤",
    item: "ジャケット袖丈直し",
    values: [
      ["袖丈", "54cm"],
      ["肩幅", "39cm"],
      ["着丈", "61cm"],
    ],
    note: "保護者用の補正相談",
  },
  {
    id: "mr-4",
    memberId: "m2",
    measuredAt: "2025-12-18T15:10:00+09:00",
    staff: "本店 佐藤",
    item: "冬制服 上下",
    values: [
      ["身長", "148cm"],
      ["胸囲", "74cm"],
      ["ウエスト", "59cm"],
      ["股下", "64cm"],
    ],
    note: "冬服の袖丈と裾を確認",
  },
  {
    id: "mr-5",
    memberId: "m3",
    measuredAt: "2025-11-02T10:40:00+09:00",
    staff: "高橋店 鈴木",
    item: "通学ズボン",
    values: [
      ["身長", "136cm"],
      ["ウエスト", "56cm"],
      ["股下", "57cm"],
    ],
    note: "裾上げあり",
  },
];
let measurementRecords = cloneMeasurementRecords(initialMeasurementRecords);

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
const addressInput = document.getElementById("addressInput");
const photoInput = document.getElementById("photoInput");
const addMemberButton = document.getElementById("addMemberButton");
const liffStatus = document.getElementById("liffStatus");
const lineReturnButton = document.getElementById("lineReturnButton");
const lineTalkScreen = document.getElementById("lineTalkScreen");
const memberServiceScreen = document.getElementById("memberServiceScreen");
const memberCloseButton = document.getElementById("memberCloseButton");
const memberMenuButton = document.getElementById("memberMenuButton");
const pointsMenuButton = document.getElementById("pointsMenuButton");
const pointsScreen = document.getElementById("pointsScreen");
const pointsCloseButton = document.getElementById("pointsCloseButton");
const pointBalanceText = document.getElementById("pointBalanceText");
const pointMemberText = document.getElementById("pointMemberText");
const pointHistoryList = document.getElementById("pointHistoryList");
const pointsQrCanvas = document.getElementById("pointsQrCanvas");
const staffScanButton = document.getElementById("staffScanButton");
const pointEffect = document.getElementById("pointEffect");
const pointEffectText = document.getElementById("pointEffectText");
const latestSyncText = document.getElementById("latestSyncText");
const lineConfig = window.YUUKICHIYA_LINE_CONFIG || {};
const reservationScreen = document.getElementById("reservationScreen");
const reservationMenuButton = document.getElementById("reservationMenuButton");
const reservationCloseButton = document.getElementById("reservationCloseButton");
const measurementLatestList = document.getElementById("measurementLatestList");
const measurementHistoryList = document.getElementById("measurementHistoryList");
const reservationMemberInput = document.getElementById("reservationMemberInput");
const reservationStoreInput = document.getElementById("reservationStoreInput");
const reservationDateInput = document.getElementById("reservationDateInput");
const reservationNoteInput = document.getElementById("reservationNoteInput");
const slotGrid = document.getElementById("slotGrid");
const slotSummaryText = document.getElementById("slotSummaryText");
const confirmReservationButton = document.getElementById("confirmReservationButton");
const reservationConfirmation = document.getElementById("reservationConfirmation");
const reservationConfirmedTime = document.getElementById("reservationConfirmedTime");
const reservationConfirmationDetails = document.getElementById("reservationConfirmationDetails");
const lineSendStatus = document.getElementById("lineSendStatus");
const sendLineMessageButton = document.getElementById("sendLineMessageButton");
const pointStorageKey = "yuukichiya.pointState.v1";
const pointChannel = "BroadcastChannel" in window ? new BroadcastChannel("yuukichiya.points.demo") : null;
const reservationStorageKey = "yuukichiya.measurementReservations.v1";
const reservationSlotHours = Array.from({ length: 8 }, (_, index) => index + 10);
const reservationStores =
  Array.isArray(lineConfig.reservationStores) && lineConfig.reservationStores.length > 0
    ? lineConfig.reservationStores
    : ["本店", "高橋店"];

let selectedReservationHour = null;
let lastReservation = null;
let lastReservationMessage = "";
let lastReservationFlexMessage = null;
let lineProfile = null;

syncPointState(readPointState(), { silent: true });
initLiff();

function selectedMember() {
  return members.find((member) => member.id === selectedId) || members[0];
}

function cloneMembers(list) {
  return list.map((member) => ({ ...member }));
}

function clonePointTransactions(list) {
  return list.map((transaction) => ({ ...transaction }));
}

function cloneMeasurementRecords(list) {
  return list.map((record) => ({
    ...record,
    values: Array.isArray(record.values) ? record.values.map((pair) => [...pair]) : [],
  }));
}

function memberKindLabel(member, index) {
  return index === 0 ? "代表者" : gradeText(member.birthday);
}

function memberDetail(member, index) {
  const school = index === 0 ? "" : member.school;
  return [memberKindLabel(member, index), member.gender, school, formatBirthday(member.birthday)].filter(Boolean).join(" / ");
}

function formatBirthday(value) {
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return "未登録";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function gradeText(value) {
  const birth = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(birth.getTime())) return "学年未登録";
  const now = new Date();
  const academicYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  const earlyYearAdjustment = month < 4 || (month === 4 && day === 1) ? 1 : 0;
  const gradeNumber = academicYear - birth.getFullYear() - 6 + earlyYearAdjustment;
  if (gradeNumber <= 0) return "未就学";
  if (gradeNumber <= 6) return `小学${gradeNumber}年`;
  if (gradeNumber <= 9) return `中学${gradeNumber - 6}年`;
  if (gradeNumber <= 12) return `高校${gradeNumber - 9}年`;
  return "卒業生";
}

function renderRepresentative() {
  const rep = members[0];
  representativeAvatar.src = rep.avatar;
  representativeAvatar.alt = `${rep.name}のアイコン`;
  representativeName.textContent = `${rep.name} 様`;
  memberNumberText.textContent = memberNumber;
  representativeBirthday.textContent = formatBirthday(rep.birthday);
  const qrSeed = pointQrSeed();
  drawQr(qrSeed);
  if (pointsScreen && !pointsScreen.hidden) {
    renderPoints();
  }
}

async function initLiff() {
  if (!lineConfig.liffId || !window.liff) {
    liffStatus.textContent = "勇吉屋 公式LINE";
    return;
  }

  try {
    await liff.init({ liffId: lineConfig.liffId });
    if (!liff.isLoggedIn()) {
      if (liff.isInClient?.()) {
        liff.login();
      }
      return;
    }
    const profile = await liff.getProfile();
    lineProfile = profile;
    liffStatus.textContent = "LINE連携中";
    if (profile?.displayName) {
      members[0].name = profile.displayName;
      if (profile.pictureUrl) {
        members[0].avatar = profile.pictureUrl;
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
        <button class="member-card${active}${representative}" type="button" data-id="${member.id}">
          <span class="member-avatar-frame">
            <img src="${member.avatar}" alt="${member.name}のアイコン" />
          </span>
          <span class="member-card-main">
            <strong>${member.name}</strong>
            <span class="member-card-detail">${detail}</span>
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
  genderInput.value = member.gender || "未回答";
  schoolInput.value = member.school;
  addressInput.value = member.address || "";
}

function renderAvatars() {
  const current = members[0].avatar;
  avatarGrid.innerHTML = avatarFiles
    .map((file) => {
      const src = `./assets/avatars/${file}`;
      const active = current.endsWith(file) ? " is-active" : "";
      return `
        <button class="avatar-option${active}" type="button" data-src="${src}" aria-label="アイコンを選択">
          <span class="avatar-option-frame">
            <img src="${src}" alt="" />
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

function pointQrSeed() {
  return staffPageUrl();
}

function formatPoints(value) {
  return `${value.toLocaleString("ja-JP")}pt`;
}

function defaultPointState() {
  return {
    balance: initialPointBalance,
    transactions: clonePointTransactions(initialPointTransactions),
  };
}

function normalizePointState(state) {
  if (!state || !Number.isFinite(Number(state.balance)) || !Array.isArray(state.transactions)) {
    return defaultPointState();
  }
  return {
    balance: Math.max(0, Number(state.balance)),
    transactions: clonePointTransactions(state.transactions),
  };
}

function readPointState() {
  try {
    const saved = window.localStorage.getItem(pointStorageKey);
    if (!saved) {
      const state = defaultPointState();
      window.localStorage.setItem(pointStorageKey, JSON.stringify(state));
      return state;
    }
    return normalizePointState(JSON.parse(saved));
  } catch (error) {
    console.warn("Point storage is unavailable", error);
    return defaultPointState();
  }
}

function syncPointState(state, options = {}) {
  const nextState = normalizePointState(state);
  const previousBalance = pointBalance;
  pointBalance = nextState.balance;
  pointTransactions = clonePointTransactions(nextState.transactions);

  if (options.silent) return;
  if (pointsScreen.hidden) return;

  const delta = pointBalance - previousBalance;
  if (delta !== 0) {
    renderPoints({ animateFrom: previousBalance, effectDelta: delta });
  } else {
    renderPoints();
  }
}

function staffPageUrl() {
  const localHostnames = ["127.0.0.1", "localhost", "::1"];
  const base = localHostnames.includes(window.location.hostname)
    ? "staff.html"
    : lineConfig.staffPageUrl || "staff.html";
  const url = new URL(base, window.location.href);
  url.searchParams.set("token", "demo-yuk001234");
  url.searchParams.set("member", memberNumber);
  return url.href;
}

function formatTransactionDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "日時未登録";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function renderPoints(options = {}) {
  const rep = members[0];
  pointMemberText.textContent = `${rep.name} 様 / ${memberNumber}`;
  if (staffScanButton) {
    staffScanButton.dataset.url = staffPageUrl();
  }
  drawQrToCanvas(pointsQrCanvas, pointQrSeed());
  renderPointHistory();

  if (typeof options.animateFrom === "number") {
    animatePointBalance(options.animateFrom, pointBalance);
    flashPointUpdate(options.effectDelta);
  } else {
    pointBalanceText.textContent = formatPoints(pointBalance);
  }
}

function renderPointHistory() {
  pointHistoryList.innerHTML = pointTransactions
    .slice(0, 5)
    .map((transaction) => {
      const isMinus = transaction.delta < 0;
      const deltaText = `${transaction.delta > 0 ? "+" : ""}${transaction.delta}pt`;
      return `
        <div class="point-history-item">
          <span>
            <strong>${transaction.reason}</strong>
            <span>${formatTransactionDate(transaction.createdAt)} / ${transaction.staff} / 残高 ${formatPoints(transaction.balanceAfter)}</span>
          </span>
          <strong class="point-delta${isMinus ? " is-minus" : ""}">${deltaText}</strong>
        </div>
      `;
    })
    .join("");
}

function animatePointBalance(from, to) {
  const duration = 720;
  const started = performance.now();

  function tick(now) {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (to - from) * eased);
    pointBalanceText.textContent = formatPoints(value);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      pointBalanceText.textContent = formatPoints(to);
    }
  }

  requestAnimationFrame(tick);
}

function flashPointUpdate(delta) {
  const effectDelta = typeof delta === "number" ? delta : 0;
  const deltaText = `${effectDelta > 0 ? "+" : ""}${effectDelta}pt`;

  document.querySelector(".points-hero")?.classList.remove("is-updating");
  pointEffectText.classList.toggle("is-minus", effectDelta < 0);
  pointEffectText.textContent = deltaText;
  pointEffect.hidden = false;

  requestAnimationFrame(() => {
    document.querySelector(".points-hero")?.classList.add("is-updating");
  });

  const now = new Date();
  latestSyncText.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} 反映`;

  window.setTimeout(() => {
    pointEffect.hidden = true;
    document.querySelector(".points-hero")?.classList.remove("is-updating");
  }, 1120);
}

function openPointsScreen() {
  if (reservationScreen && !reservationScreen.hidden) closeReservationScreen();
  if (memberServiceScreen) memberServiceScreen.hidden = true;
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  syncPointState(readPointState(), { silent: true });
  pointsScreen.hidden = false;
  document.body.classList.add("points-open");
  renderPoints();
}

function closePointsScreen() {
  pointsScreen.hidden = true;
  document.body.classList.remove("points-open");
  if (lineTalkScreen) lineTalkScreen.hidden = false;
}

function returnToLine(event) {
  event?.preventDefault();
  const officialLineUrl = lineConfig.officialLineUrl || "https://lin.ee/7byeeeA";

  try {
    if (
      window.liff &&
      typeof window.liff.closeWindow === "function" &&
      (!window.liff.isInClient || window.liff.isInClient())
    ) {
      window.liff.closeWindow();
      return;
    }
  } catch (error) {
    console.warn("LIFF closeWindow failed", error);
  }

  window.location.href = officialLineUrl;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMeasurementDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "日時未登録";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function measurementMemberName(memberId) {
  return members.find((member) => member.id === memberId)?.name || "登録メンバー";
}

function sortMeasurementRecords(records) {
  return [...records].sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
}

function latestMeasurementForMember(memberId) {
  return sortMeasurementRecords(measurementRecords.filter((record) => record.memberId === memberId))[0];
}

function measurementValuesText(record, limit = 3) {
  if (!record?.values?.length) return "採寸値未登録";
  const values = record.values.slice(0, limit).map(([label, value]) => `${label} ${value}`);
  const rest = record.values.length > limit ? ` ほか${record.values.length - limit}件` : "";
  return `${values.join(" / ")}${rest}`;
}

function renderMeasurementRecords() {
  if (!measurementLatestList || !measurementHistoryList) return;

  measurementLatestList.innerHTML = members
    .map((member, index) => {
      const record = latestMeasurementForMember(member.id);
      const kind = memberKindLabel(member, index);
      if (!record) {
        return `
          <article class="measurement-latest-item is-empty">
            <div class="measurement-member-row">
              <strong>${escapeHtml(member.name)}</strong>
              <span>${escapeHtml(kind)}</span>
            </div>
            <p>まだ採寸記録がありません</p>
          </article>
        `;
      }
      return `
        <article class="measurement-latest-item">
          <div class="measurement-member-row">
            <strong>${escapeHtml(member.name)}</strong>
            <span>${escapeHtml(kind)}</span>
          </div>
          <dl class="measurement-latest-meta">
            <div>
              <dt>いつ</dt>
              <dd>${escapeHtml(formatMeasurementDate(record.measuredAt))}</dd>
            </div>
            <div>
              <dt>何を</dt>
              <dd>${escapeHtml(record.item)}</dd>
            </div>
          </dl>
          <p>${escapeHtml(measurementValuesText(record))}</p>
          <span class="measurement-staff">入力 ${escapeHtml(record.staff)}</span>
        </article>
      `;
    })
    .join("");

  measurementHistoryList.innerHTML = sortMeasurementRecords(measurementRecords)
    .map((record) => `
      <div class="measurement-history-item">
        <div>
          <strong>${escapeHtml(record.item)}</strong>
          <span>${escapeHtml(formatMeasurementDate(record.measuredAt))} / ${escapeHtml(measurementMemberName(record.memberId))} / ${escapeHtml(record.staff)}</span>
          <small>${escapeHtml(measurementValuesText(record, 4))}</small>
        </div>
      </div>
    `)
    .join("");
}

function toDateInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function defaultReservationDate() {
  const now = new Date();
  return toDateInputValue(now.getHours() >= 17 ? addDays(now, 1) : now);
}

function formatReservationDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  if (!Number.isFinite(date.getTime())) return value;
  return `${year}年${month}月${day}日（${weekdays[date.getDay()]}）`;
}

function timeRangeLabel(hour) {
  return `${String(hour).padStart(2, "0")}:00-${String(hour + 1).padStart(2, "0")}:00`;
}

function isPastReservationSlot(dateValue, hour) {
  const today = toDateInputValue(new Date());
  if (dateValue < today) return true;
  if (dateValue > today) return false;
  return hour <= new Date().getHours();
}

function demoReservationSeeds() {
  const tomorrow = toDateInputValue(addDays(new Date(), 1));
  const twoDaysLater = toDateInputValue(addDays(new Date(), 2));
  return [
    {
      id: "YK-M-DEMO-001",
      date: tomorrow,
      store: "本店",
      hour: 11,
      startTime: "11:00",
      endTime: "12:00",
      childName: "予約済み",
      guardianName: "他のお客様",
      memberNumber: "",
      note: "",
      createdAt: new Date().toISOString(),
      demoSeed: true,
    },
    {
      id: "YK-M-DEMO-002",
      date: twoDaysLater,
      store: "高橋店",
      hour: 14,
      startTime: "14:00",
      endTime: "15:00",
      childName: "予約済み",
      guardianName: "他のお客様",
      memberNumber: "",
      note: "",
      createdAt: new Date().toISOString(),
      demoSeed: true,
    },
  ];
}

function readReservations() {
  try {
    const saved = window.localStorage.getItem(reservationStorageKey);
    if (saved) {
      const reservations = JSON.parse(saved);
      return Array.isArray(reservations) ? reservations : [];
    }
    const seeds = demoReservationSeeds();
    writeReservations(seeds);
    return seeds;
  } catch (error) {
    console.warn("Reservation storage is unavailable", error);
    return demoReservationSeeds();
  }
}

function writeReservations(reservations) {
  try {
    window.localStorage.setItem(reservationStorageKey, JSON.stringify(reservations));
  } catch (error) {
    console.warn("Reservation storage write failed", error);
  }
}

function isReservationTaken(reservations, date, store, hour) {
  return reservations.some((reservation) => reservation.date === date && reservation.store === store && Number(reservation.hour) === hour);
}

function renderReservationMemberOptions() {
  const current = reservationMemberInput.value;
  const childMembers = members.filter((member, index) => index > 0 || member.role === "生徒");
  const options = (childMembers.length ? childMembers : members)
    .map((member) => `<option value="${escapeHtml(member.id)}">${escapeHtml(member.name)}</option>`)
    .join("");
  reservationMemberInput.innerHTML = options;
  if (members.some((member) => member.id === current)) {
    reservationMemberInput.value = current;
  }
}

function renderReservationStores() {
  const current = reservationStoreInput.value;
  reservationStoreInput.innerHTML = reservationStores
    .map((store) => `<option value="${escapeHtml(store)}">${escapeHtml(store)}</option>`)
    .join("");
  if (reservationStores.includes(current)) {
    reservationStoreInput.value = current;
  }
}

function renderReservationSlots() {
  const date = reservationDateInput.value;
  const store = reservationStoreInput.value;
  const reservations = readReservations();
  let availableCount = 0;

  if (selectedReservationHour !== null) {
    const unavailable =
      isReservationTaken(reservations, date, store, selectedReservationHour) ||
      isPastReservationSlot(date, selectedReservationHour);
    if (unavailable) selectedReservationHour = null;
  }

  slotGrid.innerHTML = reservationSlotHours
    .map((hour) => {
      const taken = isReservationTaken(reservations, date, store, hour);
      const past = isPastReservationSlot(date, hour);
      const disabled = taken || past;
      const selected = selectedReservationHour === hour;
      if (!disabled) availableCount += 1;
      const stateText = taken ? "予約済み" : past ? "受付終了" : "空き";
      return `
        <button class="slot-button${selected ? " is-selected" : ""}" type="button" data-hour="${hour}"${disabled ? " disabled" : ""}>
          ${timeRangeLabel(hour)}
          <span>${stateText}</span>
        </button>
      `;
    })
    .join("");

  slotSummaryText.textContent = `${availableCount}枠空き`;
  confirmReservationButton.disabled = selectedReservationHour === null;
}

function openReservationScreen() {
  if (pointsScreen && !pointsScreen.hidden) closePointsScreen();
  if (memberServiceScreen) memberServiceScreen.hidden = true;
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  renderReservationMemberOptions();
  renderReservationStores();
  reservationDateInput.min = toDateInputValue(new Date());
  if (!reservationDateInput.value || reservationDateInput.value < reservationDateInput.min) {
    reservationDateInput.value = defaultReservationDate();
  }
  selectedReservationHour = null;
  reservationConfirmation.hidden = true;
  setLineSendStatus("LINEメッセージを準備中");
  reservationScreen.hidden = false;
  document.body.classList.add("reservation-open");
  renderMeasurementRecords();
  renderReservationSlots();
}

function closeReservationScreen() {
  reservationScreen.hidden = true;
  document.body.classList.remove("reservation-open");
  if (lineTalkScreen) lineTalkScreen.hidden = false;
}

function selectedReservationMember() {
  return members.find((member) => member.id === reservationMemberInput.value) || members[1] || members[0];
}

function buildReservationCandidate(hour) {
  const child = selectedReservationMember();
  return {
    id: `YK-M-${Date.now().toString(36).toUpperCase()}`,
    date: reservationDateInput.value,
    store: reservationStoreInput.value,
    hour,
    startTime: `${String(hour).padStart(2, "0")}:00`,
    endTime: `${String(hour + 1).padStart(2, "0")}:00`,
    childId: child.id,
    childName: child.name,
    guardianName: members[0].name,
    memberNumber,
    note: reservationNoteInput.value.trim(),
    lineUserId: lineProfile?.userId || "",
    createdAt: new Date().toISOString(),
  };
}

async function reserveOnServer(candidate) {
  const response = await fetch(lineConfig.reservationApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidate),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { raw: text };
  }
  if (response.status === 409) {
    const conflict = new Error("この時間は先に予約済みになりました。");
    conflict.code = "slot_taken";
    throw conflict;
  }
  if (!response.ok) {
    throw new Error(data.message || `予約APIでエラーが発生しました: ${response.status}`);
  }
  return { ...candidate, ...(data.reservation || {}), lineMessageSent: Boolean(data.lineMessageSent) };
}

function reserveLocally(candidate) {
  const reservations = readReservations();
  if (isReservationTaken(reservations, candidate.date, candidate.store, candidate.hour)) {
    const conflict = new Error("この時間は先に予約済みになりました。");
    conflict.code = "slot_taken";
    throw conflict;
  }
  writeReservations([...reservations, candidate]);
  return candidate;
}

async function confirmReservation() {
  if (selectedReservationHour === null) return;

  confirmReservationButton.disabled = true;
  slotSummaryText.textContent = "予約を確認中";
  const candidate = buildReservationCandidate(selectedReservationHour);

  try {
    const reservation = lineConfig.reservationApiUrl
      ? await reserveOnServer(candidate)
      : reserveLocally(candidate);
    lastReservation = reservation;
    lastReservationMessage = buildReservationLineMessage(reservation);
    lastReservationFlexMessage = buildReservationFlexMessage(reservation);
    selectedReservationHour = null;
    renderReservationSlots();
    showReservationConfirmation(reservation);
    await sendReservationLineMessage();
  } catch (error) {
    if (error.code === "slot_taken") {
      selectedReservationHour = null;
      renderReservationSlots();
      slotSummaryText.textContent = "この時間は予約済みです";
      return;
    }
    slotSummaryText.textContent = "予約できませんでした";
    setLineSendStatus(error.message || "予約処理でエラーが発生しました", "warning");
  } finally {
    renderReservationSlots();
  }
}

function showReservationConfirmation(reservation) {
  reservationConfirmedTime.textContent = `${formatReservationDate(reservation.date)} ${timeRangeLabel(Number(reservation.hour))}`;
  reservationConfirmationDetails.innerHTML = reservationDisplayRows(reservation)
    .map(([label, value]) => `
      <div>
        <dt>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(value)}</dd>
      </div>
    `)
    .join("");
  reservationConfirmation.hidden = false;
  reservationConfirmation.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function reservationDateTimeText(reservation) {
  return `${formatReservationDate(reservation.date)} ${timeRangeLabel(Number(reservation.hour))}`;
}

function reservationDisplayRows(reservation) {
  const rows = [
    ["受付番号", reservation.id],
    ["店舗", reservation.store],
    ["対象", reservation.childName],
    ["保護者", reservation.guardianName],
    ["会員番号", reservation.memberNumber],
  ];
  if (reservation.note) rows.push(["メモ", reservation.note]);
  return rows.filter(([, value]) => value);
}

function buildReservationLineMessage(reservation) {
  return [
    "採寸予約が確定しました。",
    `日時：${reservationDateTimeText(reservation)}`,
    ...reservationDisplayRows(reservation).map(([label, value]) => `${label}：${value}`),
  ].join("\n");
}

function reservationPageUrl() {
  if (lineConfig.measurementReservationUrl?.startsWith("https://")) {
    return lineConfig.measurementReservationUrl;
  }
  if (window.location.href.startsWith("https://")) {
    return window.location.href;
  }
  return lineConfig.officialLineUrl || "https://lin.ee/7byeeeA";
}

function flexRow(label, value) {
  return {
    type: "box",
    layout: "baseline",
    spacing: "sm",
    contents: [
      {
        type: "text",
        text: label,
        color: "#667085",
        size: "sm",
        flex: 2,
      },
      {
        type: "text",
        text: String(value),
        color: "#152033",
        size: "sm",
        weight: "bold",
        wrap: true,
        flex: 5,
      },
    ],
  };
}

function buildReservationFlexMessage(reservation) {
  const dateTime = reservationDateTimeText(reservation);
  return {
    type: "flex",
    altText: `採寸予約が確定しました。${dateTime}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#06a944",
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: "勇吉屋 採寸予約",
            color: "#ffffff",
            size: "sm",
            weight: "bold",
          },
          {
            type: "text",
            text: "予約確定しました",
            color: "#ffffff",
            size: "xl",
            weight: "bold",
            margin: "sm",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "18px",
        contents: [
          {
            type: "text",
            text: dateTime,
            color: "#027a34",
            size: "md",
            weight: "bold",
            wrap: true,
          },
          {
            type: "separator",
            margin: "lg",
          },
          ...reservationDisplayRows(reservation).map(([label, value]) => flexRow(label, value)),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "16px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#06a944",
            action: {
              type: "uri",
              label: "予約画面を開く",
              uri: reservationPageUrl(),
            },
          },
        ],
      },
    },
  };
}

function setLineSendStatus(message, tone = "") {
  lineSendStatus.classList.remove("is-success", "is-warning");
  if (tone) lineSendStatus.classList.add(`is-${tone}`);
  lineSendStatus.textContent = message;
}

async function sendReservationLineMessage() {
  if (!lastReservation || !lastReservationMessage) return;
  if (lastReservation.lineMessageSent) {
    setLineSendStatus("LINEへ予約確定リッチメッセージを送信しました", "success");
    return;
  }

  if (window.liff && liff.isInClient?.() && liff.isLoggedIn?.() && typeof liff.sendMessages === "function") {
    try {
      await liff.sendMessages([lastReservationFlexMessage || { type: "text", text: lastReservationMessage }]);
      setLineSendStatus("LINEへ予約確定リッチメッセージを送信しました", "success");
      return;
    } catch (error) {
      console.warn("LIFF rich message send failed", error);
      try {
        await liff.sendMessages([{ type: "text", text: lastReservationMessage }]);
        setLineSendStatus("リッチメッセージ送信に失敗したため、テキスト確認文をLINEへ送信しました。", "warning");
        return;
      } catch (textError) {
        console.warn("LIFF text message send failed", textError);
      }
    }
  }

  try {
    await navigator.clipboard?.writeText(lastReservationMessage);
    setLineSendStatus("LINE送信にはLIFF IDとメッセージ送信権限、または予約API設定が必要です。確認文はコピーしました。", "warning");
  } catch (error) {
    setLineSendStatus("LINE送信にはLIFF IDとメッセージ送信権限、または予約API設定が必要です。", "warning");
  }
}

function updateSelected(key, value) {
  selectedMember()[key] = value;
  renderRepresentative();
  renderMembers();
  renderAvatars();
}

function drawQr(seed) {
  drawQrToCanvas(document.getElementById("qrCanvas"), seed);
}

function drawQrToCanvas(canvas, seed) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 25;
  const cell = Math.floor(size / cells);
  const offset = Math.floor((size - cell * cells) / 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  function fillCellRect(x, y, width, height) {
    ctx.fillRect(offset + x * cell, offset + y * cell, cell * width, cell * height);
  }

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
    fillCellRect(x, y, 7, 7);
    ctx.fillStyle = "#ffffff";
    fillCellRect(x + 1, y + 1, 5, 5);
    ctx.fillStyle = "#111827";
    fillCellRect(x + 2, y + 2, 3, 3);
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
        fillCellRect(x, y, 1, 1);
      }
    }
  }
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

function openMemberService() {
  if (pointsScreen && !pointsScreen.hidden) closePointsScreen();
  if (reservationScreen && !reservationScreen.hidden) closeReservationScreen();
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  memberServiceScreen.hidden = false;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMemberService() {
  returnToLine();
}

function render() {
  renderRepresentative();
  renderMembers();
  renderEditor();
  renderAvatars();
  renderReservationMemberOptions();
  renderMeasurementRecords();
  if (pointsScreen && !pointsScreen.hidden) {
    renderPoints();
  }
  if (reservationScreen && !reservationScreen.hidden) {
    renderReservationSlots();
  }
}

lineReturnButton?.addEventListener("click", returnToLine);
memberMenuButton?.addEventListener("click", openMemberService);
memberCloseButton?.addEventListener("click", returnToLine);
pointsMenuButton?.addEventListener("click", openPointsScreen);
pointsCloseButton?.addEventListener("click", returnToLine);
reservationMenuButton?.addEventListener("click", openReservationScreen);
reservationCloseButton?.addEventListener("click", returnToLine);
reservationDateInput.addEventListener("change", () => {
  selectedReservationHour = null;
  renderReservationSlots();
});
reservationStoreInput.addEventListener("change", () => {
  selectedReservationHour = null;
  renderReservationSlots();
});
slotGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".slot-button");
  if (!button || button.disabled) return;
  selectedReservationHour = Number(button.dataset.hour);
  renderReservationSlots();
});
confirmReservationButton.addEventListener("click", confirmReservation);
sendLineMessageButton.addEventListener("click", sendReservationLineMessage);
avatarOpenButton.addEventListener("click", openAvatarSheet);
avatarCloseButton.addEventListener("click", closeAvatarSheet);
avatarSheet.addEventListener("click", (event) => {
  if (event.target === avatarSheet) closeAvatarSheet();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!avatarSheet.hidden) {
    closeAvatarSheet();
  } else if (!reservationScreen.hidden) {
    closeReservationScreen();
  } else if (!pointsScreen.hidden) {
    closePointsScreen();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === reservationStorageKey && !reservationScreen.hidden) {
    renderReservationSlots();
  }
  if (event.key === pointStorageKey && event.newValue) {
    try {
      syncPointState(JSON.parse(event.newValue));
    } catch (error) {
      console.warn("Point storage sync failed", error);
    }
  }
});

pointChannel?.addEventListener("message", (event) => {
  if (event.data?.type === "points-updated") {
    syncPointState(event.data.state);
  }
});

nameInput.addEventListener("input", (event) => updateSelected("name", event.target.value));
birthdayInput.addEventListener("input", (event) => updateSelected("birthday", event.target.value));
genderInput.addEventListener("change", (event) => updateSelected("gender", event.target.value));
schoolInput.addEventListener("input", (event) => updateSelected("school", event.target.value));
addressInput.addEventListener("input", (event) => updateSelected("address", event.target.value));

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
    address: members[0].address || "",
    avatar: `./assets/avatars/${avatarFiles[(nextIndex + 4) % avatarFiles.length]}`,
  };
  members.push(member);
  selectedId = member.id;
  render();
});

function openInitialScreenFromUrl() {
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  if (pointsScreen) pointsScreen.hidden = true;
  if (reservationScreen) reservationScreen.hidden = true;
  memberServiceScreen.hidden = false;
}

render();
openInitialScreenFromUrl();
