const memberNumber = "YK-001234";
const initialPointBalance = 1250;
const memberStorageKey = "yuukichiya.members.v1";

const avatarFiles = [
  "avatar-01-student-girl.png",
  "avatar-02-student-boy.png",
  "avatar-03-student-senior.png",
  "avatar-04-guardian.png",
  "avatar-12-mascot.png",
  "avatar-13-adult-woman-short.png",
  "avatar-14-adult-man-glasses.png",
  "avatar-15-adult-woman-bob.png",
  "avatar-16-adult-man-suit.png",
  "avatar-17-child-girl-elementary.png",
  "avatar-18-child-boy-hoodie.png",
  "avatar-19-child-girl-junior.png",
  "avatar-20-child-boy-junior.png",
  "avatar-05-rabbit.png",
  "avatar-06-cat.png",
  "avatar-07-dog.png",
  "avatar-08-bear.png",
  "avatar-09-penguin.png",
  "avatar-10-owl.png",
  "avatar-11-fox.png",
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

let hasStoredMemberState = false;
let members = readMemberState();
let selectedId = members[0].id;
let avatarTargetId = selectedId;
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
const purchaseHistoryLimit = 100;
let purchaseHistoryRecords = createDemoPurchaseHistory().slice(0, purchaseHistoryLimit);

const initialMeasurementRecords = [
  {
    id: "mr-1",
    memberId: "m2",
    measuredAt: "2026-06-08T16:20:00+09:00",
    purchasedAt: "2026-06-08T14:20:00+09:00",
    staff: "本店 佐藤",
    item: "夏制服 上下",
    amount: 45000,
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
    purchasedAt: "2026-06-07T11:05:00+09:00",
    staff: "高橋店 鈴木",
    item: "体操服・ハーフパンツ",
    amount: 8800,
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
    purchasedAt: "2026-05-28T16:05:00+09:00",
    staff: "本店 伊藤",
    item: "ジャケット袖丈直し",
    amount: 2200,
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
    purchasedAt: "2025-12-18T15:10:00+09:00",
    staff: "本店 佐藤",
    item: "冬制服 上下",
    amount: 46200,
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
    purchasedAt: "2025-11-02T10:40:00+09:00",
    staff: "高橋店 鈴木",
    item: "通学ズボン",
    amount: 7800,
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
const avatarSheetTitle = document.getElementById("avatarSheetTitle");
const representativeAvatar = document.getElementById("representativeAvatar");
const representativeName = document.getElementById("representativeName");
const representativeBirthday = document.getElementById("representativeBirthday");
const memberNumberText = document.getElementById("memberNumberText");
const nameInput = document.getElementById("nameInput");
const birthdayInput = document.getElementById("birthdayInput");
const genderInput = document.getElementById("genderInput");
const schoolInput = document.getElementById("schoolInput");
const addressInput = document.getElementById("addressInput");
const purchaseHistoryList = document.getElementById("purchaseHistoryList");
const purchaseHistoryCount = document.getElementById("purchaseHistoryCount");
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
const pointEffect = document.getElementById("pointEffect");
const pointEffectText = document.getElementById("pointEffectText");
const latestSyncText = document.getElementById("latestSyncText");
const lineConfig = window.YUUKICHIYA_LINE_CONFIG || {};
const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const reservationScreen = document.getElementById("reservationScreen");
const reservationMenuButton = document.getElementById("reservationMenuButton");
const reservationCloseButton = document.getElementById("reservationCloseButton");
const couponScreen = document.getElementById("couponScreen");
const couponCloseButton = document.getElementById("couponCloseButton");
const couponScreenTitle = document.getElementById("couponScreenTitle");
const couponBenefitLabel = document.getElementById("couponBenefitLabel");
const couponKicker = document.getElementById("couponKicker");
const couponName = document.getElementById("couponName");
const couponCode = document.getElementById("couponCode");
const couponQrImage = document.getElementById("couponQrImage");
const couponValidTo = document.getElementById("couponValidTo");
const couponTarget = document.getElementById("couponTarget");
const refreshReservationsButton = document.getElementById("refreshReservationsButton");
const reservationStatusList = document.getElementById("reservationStatusList");
const measurementLatestList = document.getElementById("measurementLatestList");
const measurementHistoryList = document.getElementById("measurementHistoryList");
const measurementRecordsScreen = document.getElementById("measurementRecordsScreen");
const measurementRecordsCloseButton = document.getElementById("measurementRecordsCloseButton");
const measurementRecordsCountText = document.getElementById("measurementRecordsCountText");
const measurementMemberFilters = document.getElementById("measurementMemberFilters");
const measurementRecordsPageList = document.getElementById("measurementRecordsPageList");
const reservationMemberInput = document.getElementById("reservationMemberInput");
const reservationStoreInput = document.getElementById("reservationStoreInput");
const reservationDateInput = document.getElementById("reservationDateInput");
const reservationNoteInput = document.getElementById("reservationNoteInput");
const slotGrid = document.getElementById("slotGrid");
const slotSummaryText = document.getElementById("slotSummaryText");
const confirmReservationButton = document.getElementById("confirmReservationButton");
const reservationConfirmation = document.getElementById("reservationConfirmation");
const reservationResultKicker = document.getElementById("reservationResultKicker");
const reservationConfirmedTime = document.getElementById("reservationConfirmedTime");
const reservationConfirmationDetails = document.getElementById("reservationConfirmationDetails");
const lineSendStatus = document.getElementById("lineSendStatus");
const sendLineMessageButton = document.getElementById("sendLineMessageButton");
const pointStorageKey = "yuukichiya.pointState.v1";
const pointChannel = "BroadcastChannel" in window ? new BroadcastChannel("yuukichiya.points.demo") : null;
const reservationStorageKey = "yuukichiya.measurementReservations.v1";
const reservationStartHour = Number(lineConfig.reservationStartHour) || 10;
const reservationEndHour = Number(lineConfig.reservationEndHour) || 18;
const reservationSlotHours = Array.from(
  { length: Math.max(1, reservationEndHour - reservationStartHour) },
  (_, index) => index + reservationStartHour,
);
const reservationStores =
  Array.isArray(lineConfig.reservationStores) && lineConfig.reservationStores.length > 0
    ? lineConfig.reservationStores
    : ["本店", "高橋店"];

let selectedReservationHour = null;
let lastReservation = null;
let lastReservationMessage = "";
let lastReservationFlexMessage = null;
let lineProfile = null;
let liffReadyPromise = null;
let liffReady = false;
let liffInitError = null;
let remoteReservationCache = [];
let remoteReservationLookupKey = "";
let remoteReservationLoading = false;
let myReservationCache = [];
let myReservationsLoading = false;
let myReservationsMessage = "";
let cancellingReservationId = "";
let selectedMeasurementFilterId = "all";
let dbCoupons = [];
let pointSyncTimer = null;
let latestRemotePointSignature = "";
let isPageScrollLocked = false;
let lockedPageScrollY = 0;
let previousBodyScrollStyles = null;

syncPointState(readPointState(), { silent: true });
liffReadyPromise = initLiff();

function selectedMember() {
  return members.find((member) => member.id === selectedId) || members[0];
}

function avatarTargetMember() {
  const member = members.find((item) => item.id === avatarTargetId) || selectedMember();
  avatarTargetId = member.id;
  return member;
}

function cloneMembers(list) {
  return list.map((member) => ({ ...member }));
}

function normalizeMemberState(value) {
  if (!Array.isArray(value) || !value.length) return cloneMembers(initialMembers);

  return value.map((member, index) => {
    const fallback = initialMembers[index] || initialMembers[0];
    return {
      id: typeof member.id === "string" && member.id ? member.id : fallback.id || `m${index + 1}`,
      dbMemberNumber: typeof member.dbMemberNumber === "string" ? member.dbMemberNumber : undefined,
      name: typeof member.name === "string" && member.name ? member.name : fallback.name || "登録メンバー",
      birthday: typeof member.birthday === "string" ? member.birthday : fallback.birthday || "",
      role: typeof member.role === "string" && member.role ? member.role : fallback.role || "生徒",
      gender: typeof member.gender === "string" && member.gender ? member.gender : fallback.gender || "未回答",
      school: typeof member.school === "string" ? member.school : fallback.school || "",
      phone: typeof member.phone === "string" ? member.phone : fallback.phone || "",
      address: typeof member.address === "string" ? member.address : fallback.address || "",
      avatar: typeof member.avatar === "string" && member.avatar ? member.avatar : fallback.avatar,
    };
  });
}

function readMemberState() {
  try {
    const saved = window.localStorage.getItem(memberStorageKey);
    if (!saved) return cloneMembers(initialMembers);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.length) return cloneMembers(initialMembers);
    hasStoredMemberState = true;
    return normalizeMemberState(parsed);
  } catch (error) {
    console.warn("Member storage is unavailable", error);
    return cloneMembers(initialMembers);
  }
}

function persistMemberState() {
  try {
    const state = members.map((member) => ({
      id: member.id,
      dbMemberNumber: member.dbMemberNumber,
      name: member.name,
      birthday: member.birthday,
      role: member.role,
      gender: member.gender,
      school: member.school,
      phone: member.phone,
      address: member.address,
      avatar: member.avatar,
    }));
    window.localStorage.setItem(memberStorageKey, JSON.stringify(state));
    hasStoredMemberState = true;
  } catch (error) {
    console.warn("Member storage write failed", error);
  }
}

function clonePointTransactions(list) {
  return list.map((transaction) => ({ ...transaction }));
}

function createDemoPurchaseHistory() {
  const seedRecords = [
    {
      id: "ph-001",
      purchasedAt: "2026-06-08T14:20:00+09:00",
      item: "中学夏制服 上下セット",
      amount: 45000,
      memberId: "m2",
      store: "本店",
      channel: "店頭",
      pointStatus: "granted",
      pointDelta: 450,
    },
    {
      id: "ph-002",
      purchasedAt: "2026-06-07T11:05:00+09:00",
      item: "体操服・ハーフパンツ",
      amount: 8800,
      memberId: "m3",
      store: "高橋店",
      channel: "店頭",
      pointStatus: "granted",
      pointDelta: 88,
    },
    {
      id: "ph-003",
      purchasedAt: "2026-05-28T16:05:00+09:00",
      item: "袖丈補正サービス",
      amount: 2200,
      memberId: "m1",
      store: "本店",
      channel: "店頭",
      pointStatus: "none",
      pointDelta: 0,
    },
    {
      id: "ph-004",
      purchasedAt: "2026-05-18T13:40:00+09:00",
      item: "スクールシャツ 2枚",
      amount: 6400,
      memberId: "m2",
      store: "EC",
      channel: "EC",
      pointStatus: "pending",
      pointDelta: 64,
    },
  ];

  const templates = [
    { item: "スクールシャツ", amount: 3200, memberId: "m2", store: "本店", channel: "店頭" },
    { item: "通学ソックス", amount: 900, memberId: "m3", store: "高橋店", channel: "店頭" },
    { item: "体操服 半袖", amount: 2800, memberId: "m3", store: "本店", channel: "店頭" },
    { item: "セーター", amount: 6800, memberId: "m2", store: "EC", channel: "EC" },
    { item: "通学ベルト", amount: 1800, memberId: "m3", store: "高橋店", channel: "店頭" },
    { item: "裾上げ補正", amount: 1100, memberId: "m1", store: "本店", channel: "店頭", pointStatus: "none" },
  ];

  const generatedRecords = Array.from({ length: 104 }, (_, index) => {
    const template = templates[index % templates.length];
    const month = 5 - Math.floor(index / 24);
    const day = 28 - (index % 24);
    const hour = 10 + (index % 8);
    const minute = (index * 7) % 60;
    const amount = template.amount + (index % 3) * 100;
    const pointStatus = template.pointStatus || (index % 17 === 0 ? "pending" : "granted");
    const pointDelta = pointStatus === "none" ? 0 : Math.floor(amount / 100);
    return {
      id: `ph-demo-${String(index + 1).padStart(3, "0")}`,
      purchasedAt: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+09:00`,
      item: template.item,
      amount,
      memberId: template.memberId,
      store: template.store,
      channel: template.channel,
      pointStatus,
      pointDelta,
    };
  });

  return [...seedRecords, ...generatedRecords].sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
}

function cloneMeasurementRecords(list) {
  return list.map((record) => ({
    ...record,
    values: Array.isArray(record.values) ? record.values.map((pair) => [...pair]) : [],
  }));
}

function demoApiBaseUrl() {
  const base = String(lineConfig.demoApiBaseUrl || "").trim();
  return base && base.startsWith("https://") ? base.replace(/\/$/, "") : "";
}

async function loadDemoDataFromDatabase() {
  const base = demoApiBaseUrl();
  if (!base) return;
  try {
    const url = new URL(`${base}/demo-data`);
    url.searchParams.set("memberNumber", memberNumber);
    const response = await fetch(url.href, { cache: "no-store" });
    if (!response.ok) throw new Error(`Demo API ${response.status}`);
    const data = await response.json();
    applyDemoProfile(data.profile);
    applyDemoCoupons(data.coupons);
    render();
  } catch (error) {
    console.warn("Demo API data is unavailable", error);
  }
}

function applyDemoProfile(profile) {
  if (!profile || !Array.isArray(profile.members) || !profile.members.length) return;
  const previousMembers = cloneMembers(members);
  const preferLocal = hasStoredMemberState;
  const profileValue = (localValue, remoteValue, fallback = "") =>
    preferLocal ? localValue || remoteValue || fallback : remoteValue || localValue || fallback;
  const fallbackAvatars = [
    "./assets/avatars/avatar-04-guardian.png",
    "./assets/avatars/avatar-01-student-girl.png",
    "./assets/avatars/avatar-02-student-boy.png",
    "./assets/avatars/avatar-03-student-senior.png",
  ];
  const localIdByNumber = new Map();
  members = profile.members.map((member, index) => {
    const previous = previousMembers[index] || {};
    const id = index < 3 ? `m${index + 1}` : member.member_number || `m${index + 1}`;
    localIdByNumber.set(member.member_number, id);
    return {
      id,
      dbMemberNumber: member.member_number,
      name: profileValue(previous.name, member.member_name, "登録メンバー"),
      birthday: profileValue(previous.birthday, member.birthday),
      role: member.member_type === "guardian" ? "代表者" : "生徒",
      gender: previous.gender || "未回答",
      school: profileValue(previous.school, member.school),
      address: profileValue(previous.address, member.address),
      avatar: preferLocal
        ? previous.avatar || member.member_avatar_url || fallbackAvatars[index] || fallbackAvatars[0]
        : member.member_avatar_url || previous.avatar || fallbackAvatars[index] || fallbackAvatars[0],
    };
  });
  if (!members.some((member) => member.id === selectedId)) selectedId = members[0].id;
  if (!members.some((member) => member.id === avatarTargetId)) avatarTargetId = selectedId;

  const nextPointState = pointStateFromRemote(profile.pointBalance, profile.pointTransactions);
  latestRemotePointSignature = pointStateSignature(nextPointState);
  persistPointState(nextPointState);
  syncPointState(nextPointState, { silent: true });

  if (Array.isArray(profile.purchaseHistory) && profile.purchaseHistory.length) {
    purchaseHistoryRecords = profile.purchaseHistory
      .map((record) => {
        const amount = Number(record.amount_yen) || 0;
        return {
          id: record.id,
          purchasedAt: record.purchased_at,
          item: record.item_name || "購入品",
          amount,
          memberId: localIdByNumber.get(record.member_number) || record.member_number,
          store: record.store || "本店",
          channel: record.channel || "店頭",
          pointStatus: record.item_kind === "補正" ? "none" : "granted",
          pointDelta: record.item_kind === "補正" ? 0 : Math.floor(amount / 100),
        };
      })
      .slice(0, purchaseHistoryLimit);
  }
}

function applyDemoCoupons(coupons) {
  dbCoupons = Array.isArray(coupons) ? coupons : [];
  renderCoupon();
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
  if (isLocalPreview) {
    liffStatus.textContent = "勇吉屋 公式LINE";
    return false;
  }

  if (!lineConfig.liffId || !window.liff) {
    liffStatus.textContent = "勇吉屋 公式LINE";
    return false;
  }

  const isLiffBrowser = typeof window.liff.isInClient === "function" && window.liff.isInClient();
  if (!isLiffBrowser) {
    liffStatus.textContent = "勇吉屋 公式LINE";
    return false;
  }

  try {
    await liff.init({ liffId: lineConfig.liffId, withLoginOnExternalBrowser: false });
    liffReady = true;
    liffInitError = null;
    if (!liff.isLoggedIn()) {
      return true;
    }
    const profile = await liff.getProfile();
    lineProfile = profile;
    liffStatus.textContent = "LINE連携中";
    return true;
  } catch (error) {
    liffReady = false;
    liffInitError = error;
    liffStatus.textContent = "勇吉屋 公式LINE";
    console.warn("LIFF initialization failed", error);
    return false;
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
            <span class="member-avatar-edit-label">変更</span>
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
    button.addEventListener("click", (event) => {
      selectedId = button.dataset.id;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".member-avatar-frame")) {
        openAvatarSheet(selectedId);
        return;
      }
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
  const member = avatarTargetMember();
  const current = member.avatar;
  avatarSheetTitle.textContent = `${member.name}のアイコン変更`;
  avatarGrid.innerHTML = avatarFiles
    .map((file) => {
      const src = `./assets/avatars/${file}`;
      const active = current.endsWith(file) ? " is-active" : "";
      return `
        <button class="avatar-option${active}" type="button" data-src="${src}" aria-label="${member.name}のアイコンを選択">
          <span class="avatar-option-frame">
            <img src="${src}" alt="" />
          </span>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".avatar-option").forEach((button) => {
    button.addEventListener("click", () => {
      member.avatar = button.dataset.src;
      selectedId = member.id;
      avatarTargetId = member.id;
      persistMemberState();
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

function pointStateFromRemote(balance, transactions) {
  const numericBalance = Number(balance);
  return {
    balance: Number.isFinite(numericBalance) ? Math.max(0, numericBalance) : initialPointBalance,
    transactions: Array.isArray(transactions)
      ? transactions.map((transaction) => ({
          id: transaction.id,
          delta: Number(transaction.delta) || 0,
          reason: transaction.reason || "ポイント調整",
          staff: transaction.staff_name || transaction.staff || "本店",
          createdAt: transaction.created_at || transaction.createdAt,
          balanceAfter: Number(transaction.balance_after ?? transaction.balanceAfter) || 0,
        }))
      : clonePointTransactions(initialPointTransactions),
  };
}

function persistPointState(state) {
  try {
    window.localStorage.setItem(pointStorageKey, JSON.stringify(normalizePointState(state)));
  } catch (error) {
    console.warn("Point DB sync storage failed", error);
  }
}

function pointStateSignature(state) {
  const normalized = normalizePointState(state);
  const transactions = normalized.transactions
    .slice(0, 8)
    .map((transaction) => [transaction.id, transaction.delta, transaction.balanceAfter, transaction.createdAt].join(":"))
    .join("|");
  return `${normalized.balance}|${transactions}`;
}

async function fetchRemotePointState(options = {}) {
  const base = demoApiBaseUrl();
  if (!base) return;
  try {
    const response = await fetch(`${base}/points/${encodeURIComponent(memberNumber)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Point API ${response.status}`);
    const data = await response.json();
    const nextPointState = pointStateFromRemote(data.balance ?? data.member?.current_points, data.transactions);
    const signature = pointStateSignature(nextPointState);
    if (signature === latestRemotePointSignature) return;
    latestRemotePointSignature = signature;
    persistPointState(nextPointState);
    syncPointState(nextPointState, options);
  } catch (error) {
    console.warn("Remote point sync failed", error);
  }
}

function startPointSync() {
  stopPointSync();
  fetchRemotePointState();
  pointSyncTimer = window.setInterval(fetchRemotePointState, 2000);
}

function stopPointSync() {
  if (!pointSyncTimer) return;
  window.clearInterval(pointSyncTimer);
  pointSyncTimer = null;
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

function formatPurchaseDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "日時未登録";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  const sign = amount < 0 ? "-" : "";
  return `${sign}¥${Math.abs(amount).toLocaleString("ja-JP")}`;
}

function activeDisplayCoupon() {
  return dbCoupons.find((coupon) => coupon.code === "LINE10-202607") || dbCoupons[0] || null;
}

function couponBenefitText(coupon) {
  if (!coupon) return "10% OFF";
  if (Number(coupon.discount_percent)) return `${Number(coupon.discount_percent)}% OFF`;
  if (Number(coupon.point_bonus)) return `${Number(coupon.point_bonus).toLocaleString("ja-JP")}pt`;
  if (Number(coupon.fixed_discount_yen)) return `${Number(coupon.fixed_discount_yen).toLocaleString("ja-JP")}円引き`;
  return "特典";
}

function couponTargetText(coupon) {
  if (!coupon) return "全商品";
  const rules = coupon.target_rules || {};
  if (rules.itemKeyword) return `${rules.itemKeyword}関連商品`;
  if (rules.tag) return `${rules.tag}の会員`;
  if (Number(coupon.min_purchase_yen)) return `${formatCurrency(coupon.min_purchase_yen)}以上`;
  return "全商品";
}

function formatCouponDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return "期限未設定";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日まで`;
}

function renderCoupon() {
  const coupon = activeDisplayCoupon();
  if (!coupon) return;
  couponScreenTitle.textContent = coupon.name;
  couponBenefitLabel.textContent = couponBenefitText(coupon);
  couponKicker.textContent = coupon.name;
  couponName.textContent = couponBenefitText(coupon);
  couponCode.textContent = coupon.code;
  couponValidTo.textContent = formatCouponDate(coupon.valid_to);
  couponTarget.textContent = couponTargetText(coupon);
  const base = demoApiBaseUrl();
  if (base && couponQrImage) {
    couponQrImage.src = `${base}/coupons/${encodeURIComponent(coupon.code)}/qr.png`;
    couponQrImage.alt = `クーポンQR ${coupon.code}`;
  }
}

function purchaseMemberName(memberId) {
  return members.find((member) => member.id === memberId)?.name || "登録メンバー";
}

function purchasePointStatus(record) {
  if (record.pointStatus === "pending") {
    return { label: "付与予定", className: "is-pending", pointText: `+${record.pointDelta}pt` };
  }
  if (record.pointStatus === "none" || record.pointDelta <= 0) {
    return { label: "ポイント対象外", className: "is-none", pointText: "0pt" };
  }
  return { label: "ポイント付与済", className: "is-granted", pointText: `+${record.pointDelta}pt` };
}

function renderPurchaseHistory() {
  const records = purchaseHistoryRecords.slice(0, purchaseHistoryLimit);
  purchaseHistoryCount.textContent = `${records.length}件 / 最大${purchaseHistoryLimit}件`;
  purchaseHistoryList.innerHTML = records
    .map((record) => {
      const status = purchasePointStatus(record);
      return `
        <article class="purchase-history-item">
          <div class="purchase-history-head">
            <div>
              <time datetime="${escapeHtml(record.purchasedAt)}">${escapeHtml(formatPurchaseDate(record.purchasedAt))}</time>
              <strong>${escapeHtml(record.item)}</strong>
            </div>
            <strong class="purchase-amount">${escapeHtml(formatCurrency(record.amount))}</strong>
          </div>
          <div class="purchase-history-badges">
            <span class="purchase-badge is-channel">${escapeHtml(record.channel)}</span>
            <span class="purchase-badge ${status.className}">${escapeHtml(status.label)}</span>
            <span class="purchase-point-chip${record.pointDelta > 0 ? " is-plus" : ""}">${escapeHtml(status.pointText)}</span>
          </div>
          <dl class="purchase-history-meta">
            <div>
              <dt>対象</dt>
              <dd>${escapeHtml(purchaseMemberName(record.memberId))}</dd>
            </div>
            <div>
              <dt>店舗</dt>
              <dd>${escapeHtml(record.store)}</dd>
            </div>
          </dl>
        </article>
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
  if (measurementRecordsScreen && !measurementRecordsScreen.hidden) closeMeasurementRecordsScreen();
  hideCouponScreen();
  if (memberServiceScreen) memberServiceScreen.hidden = true;
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  syncPointState(readPointState(), { silent: true });
  pointsScreen.hidden = false;
  document.body.classList.add("points-open");
  renderPoints();
  startPointSync();
}

function closePointsScreen() {
  stopPointSync();
  pointsScreen.hidden = true;
  document.body.classList.remove("points-open");
  if (lineTalkScreen) lineTalkScreen.hidden = false;
}

function openMeasurementRecordsScreen() {
  if (pointsScreen && !pointsScreen.hidden) closePointsScreen();
  if (reservationScreen && !reservationScreen.hidden) closeReservationScreen();
  hideCouponScreen();
  if (memberServiceScreen) memberServiceScreen.hidden = true;
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  selectedMeasurementFilterId = selectedMeasurementFilterId || "all";
  measurementRecordsScreen.hidden = false;
  document.body.classList.add("measurement-records-open");
  renderMeasurementRecordsPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMeasurementRecordsScreen() {
  measurementRecordsScreen.hidden = true;
  document.body.classList.remove("measurement-records-open");
  if (lineTalkScreen) lineTalkScreen.hidden = false;
}

function hideCouponScreen() {
  if (!couponScreen) return;
  couponScreen.hidden = true;
  document.body.classList.remove("coupon-open");
}

function openCouponScreen() {
  if (pointsScreen && !pointsScreen.hidden) closePointsScreen();
  if (reservationScreen && !reservationScreen.hidden) closeReservationScreen();
  if (measurementRecordsScreen && !measurementRecordsScreen.hidden) closeMeasurementRecordsScreen();
  if (memberServiceScreen) memberServiceScreen.hidden = true;
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  renderCoupon();
  couponScreen.hidden = false;
  document.body.classList.add("coupon-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeCouponScreen() {
  hideCouponScreen();
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

function measurementMember(memberId) {
  return members.find((member) => member.id === memberId) || null;
}

function measurementMemberIndex(memberId) {
  return members.findIndex((member) => member.id === memberId);
}

function measurementMemberName(memberId) {
  return measurementMember(memberId)?.name || "登録メンバー";
}

function measurementMemberAvatar(memberId) {
  return measurementMember(memberId)?.avatar || "./assets/avatars/avatar-04-guardian.png";
}

function measurementMemberKind(memberId) {
  const index = measurementMemberIndex(memberId);
  return index >= 0 ? memberKindLabel(members[index], index) : "登録メンバー";
}

function measurementItemKind(item) {
  const value = String(item || "");
  if (/体操|ハーフ|シャツ|ポロ|Tシャツ/i.test(value)) {
    return { icon: "👕", label: "体操服" };
  }
  if (/ズボン|パンツ|スラックス/i.test(value)) {
    return { icon: "👖", label: "ズボン" };
  }
  if (/ジャケット|ブレザー|上着|袖丈/i.test(value)) {
    return { icon: "🧥", label: "上着" };
  }
  if (/スカート/i.test(value)) {
    return { icon: "◒", label: "スカート" };
  }
  if (/制服|夏服|冬服/i.test(value)) {
    return { icon: "👔", label: "制服" };
  }
  return { icon: "✦", label: "衣類" };
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

function measurementPurchaseDate(record) {
  return record.purchasedAt || record.measuredAt;
}

function splitMeasurementValue(value) {
  const text = String(value || "").trim();
  const match = text.match(/^([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return { number: text || "-", unit: "" };
  return { number: match[1], unit: match[2].trim() };
}

function renderMeasurementSizeGrid(record, limit = 6) {
  if (!record?.values?.length) {
    return '<div class="measurement-size-empty">採寸値未登録</div>';
  }

  return `
    <div class="measurement-size-grid">
      ${record.values
        .slice(0, limit)
        .map(([label, value]) => {
          const parts = splitMeasurementValue(value);
          return `
            <div class="measurement-size-card">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(parts.number)}${parts.unit ? `<small>${escapeHtml(parts.unit)}</small>` : ""}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMeasurementPurchaseCard(record) {
  const itemKind = measurementItemKind(record.item);
  const memberName = measurementMemberName(record.memberId);
  const memberAvatar = measurementMemberAvatar(record.memberId);
  return `
    <article class="measurement-purchase-card">
      <div class="measurement-purchase-top">
        <span class="measurement-history-person">
          <img src="${escapeHtml(memberAvatar)}" alt="${escapeHtml(memberName)}のアイコン" />
          <span>${escapeHtml(memberName)}</span>
        </span>
        <strong class="measurement-purchase-amount">${escapeHtml(formatCurrency(record.amount))}</strong>
      </div>

      <div class="measurement-purchase-title">
        <span class="measurement-history-clothing" aria-label="${escapeHtml(itemKind.label)}">
          ${escapeHtml(itemKind.icon)}
        </span>
        <div>
          <p>購入品</p>
          <h3>${escapeHtml(record.item)}</h3>
          <span class="measurement-item-chip">
            ${escapeHtml(itemKind.label)}
          </span>
        </div>
      </div>

      <dl class="measurement-purchase-facts">
        <div>
          <dt>いつ</dt>
          <dd>${escapeHtml(formatPurchaseDate(measurementPurchaseDate(record)))}</dd>
        </div>
        <div>
          <dt>担当</dt>
          <dd>${escapeHtml(record.staff)}</dd>
        </div>
      </dl>

      ${renderMeasurementSizeGrid(record)}
      ${record.note ? `<p class="measurement-purchase-note">${escapeHtml(record.note)}</p>` : ""}
    </article>
  `;
}

function renderMeasurementEmptyPurchaseCard(member, index) {
  const kind = memberKindLabel(member, index);
  return `
    <article class="measurement-purchase-card measurement-purchase-card-empty">
      <div class="measurement-purchase-top">
        <span class="measurement-history-person">
          <img src="${escapeHtml(member.avatar)}" alt="${escapeHtml(member.name)}のアイコン" />
          <span>${escapeHtml(member.name)}</span>
        </span>
        <span class="measurement-history-kind">${escapeHtml(kind)}</span>
      </div>
      <div class="measurement-size-empty">まだ採寸記録がありません</div>
    </article>
  `;
}

function renderMeasurementRecordsPage() {
  if (!measurementRecordsPageList) return;

  const allRecords = sortMeasurementRecords(measurementRecords);
  const visibleRecords =
    selectedMeasurementFilterId === "all"
      ? allRecords
      : allRecords.filter((record) => record.memberId === selectedMeasurementFilterId);

  if (measurementRecordsCountText) {
    measurementRecordsCountText.textContent = `${visibleRecords.length}件`;
  }

  if (measurementMemberFilters) {
    const allActive = selectedMeasurementFilterId === "all" ? " is-active" : "";
    measurementMemberFilters.innerHTML = [
      `
        <button class="measurement-member-filter${allActive}" type="button" data-measurement-filter-id="all">
          <span class="measurement-filter-all-icon" aria-hidden="true">全</span>
          <span>
            <strong>全員</strong>
            <small>${allRecords.length}件</small>
          </span>
        </button>
      `,
      ...members.map((member) => {
        const count = allRecords.filter((record) => record.memberId === member.id).length;
        const active = selectedMeasurementFilterId === member.id ? " is-active" : "";
        return `
          <button class="measurement-member-filter${active}" type="button" data-measurement-filter-id="${escapeHtml(member.id)}">
            <img src="${escapeHtml(member.avatar)}" alt="${escapeHtml(member.name)}のアイコン" />
            <span>
              <strong>${escapeHtml(member.name)}</strong>
              <small>${count}件</small>
            </span>
          </button>
        `;
      }),
    ].join("");
  }

  measurementRecordsPageList.innerHTML = visibleRecords.length
    ? visibleRecords.map(renderMeasurementPurchaseCard).join("")
    : `
      <div class="reservation-status-empty">
        <strong>採寸履歴がありません</strong>
        <span>店舗側で採寸記録を登録すると、ここに表示されます</span>
      </div>
    `;
}

function renderMeasurementRecords() {
  if (measurementLatestList) {
    measurementLatestList.innerHTML = members
      .map((member, index) => {
        const record = latestMeasurementForMember(member.id);
        if (!record) {
          return renderMeasurementEmptyPurchaseCard(member, index);
        }
        return renderMeasurementPurchaseCard(record);
      })
      .join("");
  }

  if (measurementHistoryList) {
    measurementHistoryList.innerHTML = sortMeasurementRecords(measurementRecords)
      .map((record) => {
        const itemKind = measurementItemKind(record.item);
        return `
          <div class="measurement-history-item">
            <span class="measurement-history-clothing" aria-label="${escapeHtml(itemKind.label)}">
              ${escapeHtml(itemKind.icon)}
            </span>
            <div class="measurement-history-main">
              <div class="measurement-history-title">
                <strong>${escapeHtml(record.item)}</strong>
                <span class="measurement-item-chip">
                  ${escapeHtml(itemKind.label)}
                </span>
              </div>
              <div class="measurement-history-meta">
                <span class="measurement-history-person">
                  <img src="${escapeHtml(measurementMemberAvatar(record.memberId))}" alt="${escapeHtml(measurementMemberName(record.memberId))}のアイコン" />
                  <span>${escapeHtml(measurementMemberName(record.memberId))}</span>
                </span>
                <span class="measurement-history-date">${escapeHtml(formatMeasurementDate(record.measuredAt))}</span>
                <span class="measurement-history-staff">${escapeHtml(record.staff)}</span>
                <span class="measurement-history-kind">${escapeHtml(measurementMemberKind(record.memberId))}</span>
              </div>
              <small>${escapeHtml(measurementValuesText(record, 4))}</small>
            </div>
          </div>
        `;
      })
      .join("");
  }
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

function reservationApiEnabled() {
  return !isLocalPreview && typeof lineConfig.reservationApiUrl === "string" && lineConfig.reservationApiUrl.startsWith("https://");
}

function liffStateSearchParams(params = new URLSearchParams(window.location.search)) {
  const liffState = params.get("liff.state");
  if (!liffState) return null;

  const queryStart = liffState.indexOf("?");
  const queryText = liffState.startsWith("?")
    ? liffState.slice(1)
    : queryStart >= 0
      ? liffState.slice(queryStart + 1).split("#")[0]
      : liffState;

  return new URLSearchParams(queryText);
}

function normalizeScreenName(value) {
  const screen = String(value || "").trim().toLowerCase();
  if (screen === "member" || screen === "members" || screen === "member-service") return "member";
  if (screen === "point" || screen === "points") return "points";
  if (screen === "reservation" || screen === "measurement-reservation") return "reservation";
  if (screen === "measurement-records" || screen === "measurements" || screen === "records") {
    return "measurement-records";
  }
  if (screen === "coupon" || screen === "coupons") return "coupon";
  return "";
}

function screenFromLiffState(liffState) {
  if (!liffState) return "";

  try {
    const url = new URL(liffState, window.location.origin);
    const screen = normalizeScreenName(url.searchParams.get("screen"));
    if (screen) return screen;
    const pathScreen = normalizeScreenName(url.pathname.replace(/^\/+|\/+$/g, ""));
    if (pathScreen) return pathScreen;
  } catch (error) {
    console.warn("LIFF state URL parse failed", error);
  }

  const queryStart = liffState.indexOf("?");
  const queryText = liffState.startsWith("?")
    ? liffState.slice(1)
    : queryStart >= 0
      ? liffState.slice(queryStart + 1).split("#")[0]
      : liffState;

  return normalizeScreenName(new URLSearchParams(queryText).get("screen"));
}

function screenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const liffStateScreen = screenFromLiffState(params.get("liff.state"));
  return liffStateScreen || normalizeScreenName(params.get("screen")) || "member";
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

function reservationLookupKey(date = reservationDateInput.value, store = reservationStoreInput.value) {
  return `${date}::${store}`;
}

function currentReservations() {
  const localReservations = reservationApiEnabled() ? [] : readReservations();
  return [...localReservations, ...remoteReservationCache];
}

function currentLineAccessToken() {
  try {
    return window.liff?.getAccessToken?.() || "";
  } catch (error) {
    return "";
  }
}

function reservationApiUrlWithParams() {
  const url = new URL(lineConfig.reservationApiUrl);
  url.searchParams.set("date", reservationDateInput.value);
  url.searchParams.set("store", reservationStoreInput.value);
  return url.toString();
}

function myReservationsApiUrl() {
  const url = new URL(lineConfig.reservationApiUrl);
  url.searchParams.set("mine", "1");
  return url.toString();
}

function reservationItemApiUrl(id) {
  const url = new URL(lineConfig.reservationApiUrl);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
  return url.toString();
}

function sortedReservations(reservations) {
  return [...reservations].sort((a, b) => {
    const dateOrder = String(a.date).localeCompare(String(b.date));
    return dateOrder || Number(a.hour) - Number(b.hour);
  });
}

function visibleLocalReservations() {
  return sortedReservations(readReservations().filter((reservation) => !reservation.demoSeed));
}

function reservationChildMember(reservation) {
  return (
    members.find((member) => member.id === reservation.childId) ||
    members.find((member) => member.name === reservation.childName) ||
    null
  );
}

function reservationAvatarMarkup(reservation) {
  const member = reservationChildMember(reservation);
  if (member?.avatar) {
    return `<img src="${escapeHtml(member.avatar)}" alt="${escapeHtml(member.name)}のアイコン" />`;
  }
  const name = String(reservation.childName || "予").trim();
  return `<span>${escapeHtml(name.slice(0, 1) || "予")}</span>`;
}

function reservationRowIcon(label) {
  const icons = {
    受付番号: "#",
    店舗: "🏬",
    対象: "👤",
    保護者: "✓",
    会員番号: "ID",
    メモ: "✎",
    状態: "●",
  };
  return icons[label] || "•";
}

function slotStateIcon({ loading, taken, past, selected }) {
  if (loading) return "…";
  if (selected) return "✓";
  if (taken) return "×";
  if (past) return "–";
  return "◎";
}

function renderReservationStatus() {
  if (!reservationStatusList) return;

  if (myReservationsLoading) {
    reservationStatusList.innerHTML = `
      <div class="reservation-status-empty">
        <strong>予約状況を確認中</strong>
        <span>LINEアカウントに紐づく予約を読み込んでいます</span>
      </div>
    `;
    return;
  }

  const reservations = reservationApiEnabled() ? myReservationCache : visibleLocalReservations();
  const messageHtml = myReservationsMessage
    ? `<div class="reservation-status-alert">${escapeHtml(myReservationsMessage)}</div>`
    : "";

  if (!reservations.length) {
    reservationStatusList.innerHTML = `
      ${messageHtml}
      <div class="reservation-status-empty">
        <strong>現在の予約はありません</strong>
        <span>下の空き枠から新しい採寸予約を入れられます</span>
      </div>
    `;
    return;
  }

  reservationStatusList.innerHTML = `
    ${messageHtml}
    ${sortedReservations(reservations)
      .map((reservation, index) => {
        const hour = Number(reservation.hour);
        const past = isPastReservationSlot(reservation.date, hour);
        const isCancelling = cancellingReservationId === reservation.id;
        return `
          <article class="reservation-status-item">
            <div class="reservation-status-avatar" aria-hidden="true">
              ${reservationAvatarMarkup(reservation)}
            </div>
            <div class="reservation-status-main">
              <div class="reservation-status-head">
                <span class="reservation-status-badge">${index + 1}番目・${past ? "受付終了" : "予約中"}</span>
                <strong><span aria-hidden="true">📅</span>${escapeHtml(formatReservationDate(reservation.date))} ${escapeHtml(timeRangeLabel(hour))}</strong>
              </div>
              <dl>
                ${reservationDisplayRows(reservation)
                  .map(
                    ([label, value]) => `
                      <div>
                        <dt><span class="reservation-row-icon" aria-hidden="true">${escapeHtml(reservationRowIcon(label))}</span>${escapeHtml(label)}</dt>
                        <dd>${escapeHtml(value)}</dd>
                      </div>
                    `,
                  )
                  .join("")}
              </dl>
            </div>
            <button
              class="cancel-reservation-button"
              type="button"
              data-cancel-reservation-id="${escapeHtml(reservation.id)}"
              ${past || isCancelling ? "disabled" : ""}
            >
              ${isCancelling ? "キャンセル中" : "予約キャンセル"}
            </button>
          </article>
        `;
      })
      .join("")}
  `;
}

async function refreshMyReservations() {
  if (!reservationStatusList) return;

  myReservationsMessage = "";
  if (!reservationApiEnabled()) {
    myReservationsLoading = false;
    myReservationCache = [];
    renderReservationStatus();
    return;
  }

  if (liffReadyPromise) {
    await liffReadyPromise;
  }

  const accessToken = currentLineAccessToken();
  if (!accessToken) {
    myReservationsLoading = false;
    myReservationCache = [];
    myReservationsMessage = "LINEログイン後に予約状況を表示します";
    renderReservationStatus();
    return;
  }

  myReservationsLoading = true;
  renderReservationStatus();

  try {
    const response = await fetch(myReservationsApiUrl(), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `予約状況を取得できませんでした: ${response.status}`);
    }
    myReservationCache = Array.isArray(data.reservations) ? data.reservations : [];
  } catch (error) {
    console.warn("My reservations fetch failed", error);
    myReservationsMessage = error.message || "予約状況を取得できませんでした";
  } finally {
    myReservationsLoading = false;
    renderReservationStatus();
  }
}

async function cancelReservation(reservationId) {
  if (!reservationId || cancellingReservationId) return;

  cancellingReservationId = reservationId;
  myReservationsMessage = "";
  const targetReservation = (reservationApiEnabled() ? myReservationCache : readReservations()).find(
    (reservation) => reservation.id === reservationId,
  );
  renderReservationStatus();

  try {
    if (reservationApiEnabled()) {
      const accessToken = currentLineAccessToken();
      if (!accessToken) {
        throw new Error("LINEログイン後にキャンセルできます");
      }

      const response = await fetch(reservationItemApiUrl(reservationId), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `キャンセルできませんでした: ${response.status}`);
      }
    } else {
      writeReservations(readReservations().filter((reservation) => reservation.id !== reservationId));
    }

    if (lastReservation?.id === reservationId) {
      lastReservation = null;
      lastReservationMessage = "";
      lastReservationFlexMessage = null;
    }
    await refreshRemoteReservations();
    await refreshMyReservations();
    myReservationsMessage = "予約をキャンセルしました";
    showReservationCancellation(targetReservation);
  } catch (error) {
    console.warn("Reservation cancel failed", error);
    myReservationsMessage = error.message || "予約をキャンセルできませんでした";
    showReservationResultStatus({
      kicker: "キャンセルできませんでした",
      heading: myReservationsMessage,
      rows: [["状態", "予約状況欄で内容を確認してください"]],
      statusMessage: myReservationsMessage,
      tone: "warning",
      canResend: false,
    });
  } finally {
    cancellingReservationId = "";
    renderReservationSlots();
    renderReservationStatus();
  }
}

async function refreshRemoteReservations() {
  if (!reservationApiEnabled() || !reservationDateInput.value || !reservationStoreInput.value) {
    remoteReservationCache = [];
    remoteReservationLookupKey = "";
    return;
  }

  const key = reservationLookupKey();
  remoteReservationLookupKey = key;
  remoteReservationLoading = true;
  renderReservationSlots();

  try {
    const response = await fetch(reservationApiUrlWithParams(), {
      headers: { Accept: "application/json" },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `予約APIで空き枠を取得できませんでした: ${response.status}`);
    }
    if (remoteReservationLookupKey === key) {
      remoteReservationCache = Array.isArray(data.reservations) ? data.reservations : [];
    }
  } catch (error) {
    console.warn("Reservation availability fetch failed", error);
    if (remoteReservationLookupKey === key) {
      slotSummaryText.textContent = "空き枠取得に失敗しました";
    }
  } finally {
    if (remoteReservationLookupKey === key) {
      remoteReservationLoading = false;
      renderReservationSlots();
    }
  }
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
  const reservations = currentReservations();
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
      const disabled = taken || past || remoteReservationLoading;
      const selected = selectedReservationHour === hour;
      if (!disabled) availableCount += 1;
      const stateText = remoteReservationLoading ? "確認中" : taken ? "予約済み" : past ? "受付終了" : "空き";
      const stateIcon = slotStateIcon({ loading: remoteReservationLoading, taken, past, selected });
      return `
        <button class="slot-button${selected ? " is-selected" : ""}" type="button" data-hour="${hour}"${disabled ? " disabled" : ""}>
          <strong><span class="slot-state-icon" aria-hidden="true">${escapeHtml(stateIcon)}</span>${timeRangeLabel(hour)}</strong>
          <span>${stateText}</span>
        </button>
      `;
    })
    .join("");

  slotSummaryText.textContent = remoteReservationLoading ? "空き枠を確認中" : `${availableCount}枠空き`;
  confirmReservationButton.disabled = selectedReservationHour === null;
}

function openReservationScreen() {
  if (pointsScreen && !pointsScreen.hidden) closePointsScreen();
  if (measurementRecordsScreen && !measurementRecordsScreen.hidden) closeMeasurementRecordsScreen();
  hideCouponScreen();
  if (memberServiceScreen) memberServiceScreen.hidden = true;
  if (lineTalkScreen) lineTalkScreen.hidden = true;
  renderReservationMemberOptions();
  renderReservationStores();
  reservationDateInput.min = toDateInputValue(new Date());
  if (!reservationDateInput.value || reservationDateInput.value < reservationDateInput.min) {
    reservationDateInput.value = defaultReservationDate();
  }
  selectedReservationHour = null;
  resetReservationResultStatus();
  reservationScreen.hidden = false;
  document.body.classList.add("reservation-open");
  renderMeasurementRecords();
  renderReservationStatus();
  renderReservationSlots();
  refreshRemoteReservations();
  refreshMyReservations();
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
    lineAccessToken: currentLineAccessToken(),
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
  const { lineAccessToken, ...publicCandidate } = candidate;
  return { ...publicCandidate, ...(data.reservation || {}), lineMessageSent: Boolean(data.lineMessageSent) };
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

  if (reservationApiEnabled()) {
    if (liffReadyPromise) {
      await liffReadyPromise;
    }
    const canSendLineIdentity = Boolean(lineProfile?.userId || currentLineAccessToken());
    if (!canSendLineIdentity) {
      setLineSendStatus("LINE通知のためログイン確認を開きます。ログイン後にもう一度予約を確定してください。", "warning");
      try {
        window.liff?.login?.({ redirectUri: window.location.href });
      } catch (error) {
        console.warn("LIFF login failed", error);
      }
      confirmReservationButton.disabled = false;
      slotSummaryText.textContent = "LINEログイン確認中";
      return;
    }
  }

  const candidate = buildReservationCandidate(selectedReservationHour);

  try {
    const reservation = reservationApiEnabled()
      ? await reserveOnServer(candidate)
      : reserveLocally(candidate);
    lastReservation = reservation;
    lastReservationMessage = buildReservationLineMessage(reservation);
    lastReservationFlexMessage = buildReservationFlexMessage(reservation);
    selectedReservationHour = null;
    renderReservationSlots();
    showReservationConfirmation(reservation);
    await refreshMyReservations();
    await sendReservationLineMessage();
  } catch (error) {
    if (error.code === "slot_taken") {
      selectedReservationHour = null;
      await refreshRemoteReservations();
      renderReservationSlots();
      slotSummaryText.textContent = "この時間は予約済みです";
      return;
    }
    slotSummaryText.textContent = "予約できませんでした";
    setLineSendStatus(error.message || "予約処理でエラーが発生しました", "warning");
  } finally {
    if (reservationApiEnabled()) {
      await refreshRemoteReservations();
    }
    renderReservationSlots();
  }
}

function showReservationConfirmation(reservation) {
  showReservationResultStatus({
    kicker: "予約確定しました",
    heading: `${formatReservationDate(reservation.date)} ${timeRangeLabel(Number(reservation.hour))}`,
    rows: reservationDisplayRows(reservation),
    statusMessage: "LINEメッセージを準備中",
    tone: "",
    canResend: true,
  });
  reservationConfirmation.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showReservationCancellation(reservation) {
  const heading = reservation
    ? `${formatReservationDate(reservation.date)} ${timeRangeLabel(Number(reservation.hour))}`
    : "キャンセル済み";
  showReservationResultStatus({
    kicker: "予約キャンセルしました",
    heading,
    rows: reservation ? reservationDisplayRows(reservation) : [["状態", "予約をキャンセルしました"]],
    statusMessage: "予約状況欄を更新しました",
    tone: "success",
    canResend: false,
  });
}

function resetReservationResultStatus() {
  showReservationResultStatus({
    kicker: "待機中",
    heading: "予約後にここへ表示",
    rows: [["表示内容", "予約確定・キャンセルの結果"]],
    statusMessage: "最新の操作結果を表示します",
    tone: "",
    canResend: false,
    visible: false,
  });
}

function showReservationResultStatus({
  kicker,
  heading,
  rows,
  statusMessage,
  tone = "",
  canResend = false,
  visible = true,
}) {
  reservationConfirmation.hidden = !visible;
  reservationResultKicker.textContent = kicker;
  reservationConfirmedTime.textContent = heading;
  reservationConfirmationDetails.innerHTML = rows
    .map(([label, value]) => `
      <div>
        <dt><span class="reservation-row-icon" aria-hidden="true">${escapeHtml(reservationRowIcon(label))}</span>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(value)}</dd>
      </div>
    `)
    .join("");
  setLineSendStatus(statusMessage, tone);
  sendLineMessageButton.disabled = !canResend;
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

function reservationPageUrl(reservation = null) {
  let targetUrl = "";
  if (lineConfig.measurementReservationUrl?.startsWith("https://")) {
    targetUrl = lineConfig.measurementReservationUrl;
  } else if (window.location.href.startsWith("https://")) {
    targetUrl = window.location.href;
  } else {
    targetUrl = lineConfig.officialLineUrl || "https://lin.ee/7byeeeA";
  }

  if (!reservation?.id || !targetUrl.startsWith("https://")) {
    return targetUrl;
  }

  try {
    const url = new URL(targetUrl);
    url.searchParams.set("reservationId", reservation.id);
    return url.toString();
  } catch (error) {
    return targetUrl;
  }
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
              label: "予約状況確認",
              uri: reservationPageUrl(reservation),
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

  setLineSendStatus("LINEへ予約確定リッチメッセージを送信中");

  if (liffReadyPromise) {
    await liffReadyPromise;
  }

  if (isLocalPreview) {
    setLineSendStatus("ローカル確認中です。本番LIFFまたは予約API接続後にLINEへ送信します。", "warning");
    return;
  }

  const hasLiff = Boolean(window.liff && lineConfig.liffId);

  if (!hasLiff) {
    await copyReservationMessageToClipboard("LINE送信にはLIFF ID設定が必要です。確認文はコピーしました。");
    return;
  }

  if (!liffReady) {
    const detail = liffInitError?.message ? ` (${liffInitError.message})` : "";
    await copyReservationMessageToClipboard(`LINE連携の初期化に失敗しました${detail}。確認文はコピーしました。`);
    return;
  }

  const inLineClient = Boolean(liff.isInClient?.());
  const isLoggedIn = Boolean(liff.isLoggedIn?.());

  if (!inLineClient) {
    await copyReservationMessageToClipboard("LINEアプリ内のリッチメニューから開いた時だけLINEへ送信できます。確認文はコピーしました。");
    return;
  }

  if (!isLoggedIn) {
    await copyReservationMessageToClipboard("LINEログインが確認できないため、予約確認文をコピーしました。");
    return;
  }

  if (typeof liff.sendMessages === "function") {
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

  await copyReservationMessageToClipboard("LINEへの自動送信に失敗しました。確認文はコピーしました。LINEアプリ内から再送してください。");
}

async function copyReservationMessageToClipboard(message) {
  try {
    await navigator.clipboard?.writeText(lastReservationMessage);
    setLineSendStatus(message, "warning");
  } catch (error) {
    setLineSendStatus(message.replace("確認文はコピーしました。", "確認文のコピーもできませんでした。"), "warning");
  }
}

function updateSelected(key, value) {
  selectedMember()[key] = value;
  persistMemberState();
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

function lockPageScroll() {
  if (isPageScrollLocked) return;

  lockedPageScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  previousBodyScrollStyles = {
    position: document.body.style.position,
    top: document.body.style.top,
    left: document.body.style.left,
    right: document.body.style.right,
    width: document.body.style.width,
    overflow: document.body.style.overflow,
  };

  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedPageScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  isPageScrollLocked = true;
}

function unlockPageScroll() {
  if (!isPageScrollLocked) return;

  const restoreY = lockedPageScrollY;
  Object.assign(document.body.style, previousBodyScrollStyles);
  previousBodyScrollStyles = null;
  lockedPageScrollY = 0;
  isPageScrollLocked = false;
  window.scrollTo(0, restoreY);
}

function openAvatarSheet(targetId = selectedId) {
  const fallbackId = members[0]?.id || selectedId;
  avatarTargetId = members.some((member) => member.id === targetId) ? targetId : fallbackId;
  selectedId = avatarTargetId;
  render();
  avatarSheet.hidden = false;
  document.body.classList.add("sheet-open");
  lockPageScroll();
}

function closeAvatarSheet() {
  avatarSheet.hidden = true;
  document.body.classList.remove("sheet-open");
  unlockPageScroll();
}

function openMemberService() {
  if (pointsScreen && !pointsScreen.hidden) closePointsScreen();
  if (reservationScreen && !reservationScreen.hidden) closeReservationScreen();
  if (measurementRecordsScreen && !measurementRecordsScreen.hidden) closeMeasurementRecordsScreen();
  hideCouponScreen();
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
  renderPurchaseHistory();
  renderAvatars();
  renderReservationMemberOptions();
  renderMeasurementRecords();
  renderMeasurementRecordsPage();
  if (pointsScreen && !pointsScreen.hidden) {
    renderPoints();
  }
  if (reservationScreen && !reservationScreen.hidden) {
    renderReservationSlots();
    renderReservationStatus();
  }
}

lineReturnButton?.addEventListener("click", returnToLine);
memberMenuButton?.addEventListener("click", openMemberService);
memberCloseButton?.addEventListener("click", returnToLine);
pointsMenuButton?.addEventListener("click", openPointsScreen);
pointsCloseButton?.addEventListener("click", returnToLine);
reservationMenuButton?.addEventListener("click", openReservationScreen);
reservationCloseButton?.addEventListener("click", returnToLine);
measurementRecordsCloseButton?.addEventListener("click", returnToLine);
couponCloseButton?.addEventListener("click", returnToLine);
measurementMemberFilters?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest("[data-measurement-filter-id]");
  if (!button) return;
  selectedMeasurementFilterId = button.dataset.measurementFilterId || "all";
  renderMeasurementRecordsPage();
});
refreshReservationsButton?.addEventListener("click", refreshMyReservations);
reservationStatusList?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest("[data-cancel-reservation-id]");
  if (!button || button.disabled) return;
  cancelReservation(button.dataset.cancelReservationId);
});
reservationDateInput.addEventListener("change", () => {
  selectedReservationHour = null;
  renderReservationSlots();
  refreshRemoteReservations();
});
reservationStoreInput.addEventListener("change", () => {
  selectedReservationHour = null;
  renderReservationSlots();
  refreshRemoteReservations();
});
slotGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".slot-button");
  if (!button || button.disabled) return;
  selectedReservationHour = Number(button.dataset.hour);
  renderReservationSlots();
});
confirmReservationButton.addEventListener("click", confirmReservation);
sendLineMessageButton.addEventListener("click", sendReservationLineMessage);
avatarOpenButton.addEventListener("click", () => openAvatarSheet(members[0].id));
avatarCloseButton.addEventListener("click", closeAvatarSheet);
avatarSheet.addEventListener("click", (event) => {
  if (event.target === avatarSheet) closeAvatarSheet();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!avatarSheet.hidden) {
    closeAvatarSheet();
  } else if (couponScreen && !couponScreen.hidden) {
    closeCouponScreen();
  } else if (measurementRecordsScreen && !measurementRecordsScreen.hidden) {
    closeMeasurementRecordsScreen();
  } else if (couponScreen && !couponScreen.hidden) {
    closeCouponScreen();
  } else if (!reservationScreen.hidden) {
    closeReservationScreen();
  } else if (!pointsScreen.hidden) {
    closePointsScreen();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === memberStorageKey && event.newValue) {
    try {
      members = normalizeMemberState(JSON.parse(event.newValue));
      hasStoredMemberState = true;
      if (!members.some((member) => member.id === selectedId)) selectedId = members[0].id;
      if (!members.some((member) => member.id === avatarTargetId)) avatarTargetId = selectedId;
      render();
    } catch (error) {
      console.warn("Member storage sync failed", error);
    }
  }
  if (event.key === reservationStorageKey && !reservationScreen.hidden) {
    renderReservationSlots();
    renderReservationStatus();
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
    const member = avatarTargetMember();
    member.avatar = reader.result;
    selectedId = member.id;
    avatarTargetId = member.id;
    persistMemberState();
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
    phone: members[0].phone || "",
    address: members[0].address || "",
    avatar: `./assets/avatars/${avatarFiles[(nextIndex + 4) % avatarFiles.length]}`,
  };
  members.push(member);
  selectedId = member.id;
  persistMemberState();
  render();
});

function openInitialScreenFromUrl() {
  const screen = screenFromUrl();

  if (screen === "points") {
    openPointsScreen();
    return;
  }
  if (screen === "reservation") {
    openReservationScreen();
    return;
  }
  if (screen === "measurement-records" || screen === "measurements") {
    openMeasurementRecordsScreen();
    return;
  }
  if (screen === "coupon") {
    openCouponScreen();
    return;
  }

  if (lineTalkScreen) lineTalkScreen.hidden = true;
  if (pointsScreen) pointsScreen.hidden = true;
  if (reservationScreen) reservationScreen.hidden = true;
  if (measurementRecordsScreen) measurementRecordsScreen.hidden = true;
  hideCouponScreen();
  memberServiceScreen.hidden = false;
}

render();
openInitialScreenFromUrl();
loadDemoDataFromDatabase();
