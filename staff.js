const lineConfig = window.YUUKICHIYA_LINE_CONFIG || {};
const staffUrlParams = new URLSearchParams(window.location.search);
const memberNumber = staffUrlParams.get("member") || "YK-001234";
let memberName = "山田 由美";
const staffToken = staffUrlParams.get("token") || "";
const initialPointBalance = 1250;
const pointStorageKey = "yuukichiya.pointState.v1";
const pointChannel = "BroadcastChannel" in window ? new BroadcastChannel("yuukichiya.points.demo") : null;

const initialPointTransactions = [
  {
    id: "pt-1",
    delta: 450,
    reason: "学生服購入",
    staff: "本店",
    memo: "",
    createdAt: "2026-06-08T14:20:00+09:00",
    balanceAfter: 1250,
  },
  {
    id: "pt-2",
    delta: -100,
    reason: "補正サービス利用",
    staff: "本店",
    memo: "",
    createdAt: "2026-05-28T16:05:00+09:00",
    balanceAfter: 800,
  },
  {
    id: "pt-3",
    delta: 300,
    reason: "紙カードから移行",
    staff: "高橋店",
    memo: "",
    createdAt: "2026-05-02T11:45:00+09:00",
    balanceAfter: 900,
  },
];

let pointState = readPointState();
let selectedPointDelta = 100;
let isSubmitting = false;

const staffMemberName = document.getElementById("staffMemberName");
const staffMemberCode = document.getElementById("staffMemberCode");
const staffCurrentPoints = document.getElementById("staffCurrentPoints");
const staffDeltaInput = document.getElementById("staffDeltaInput");
const staffReasonInput = document.getElementById("staffReasonInput");
const staffMemoInput = document.getElementById("staffMemoInput");
const applyPointsButton = document.getElementById("applyPointsButton");
const staffResult = document.getElementById("staffResult");
const staffTransactionList = document.getElementById("staffTransactionList");
const staffSyncText = document.getElementById("staffSyncText");

function cloneTransactions(list) {
  return list.map((transaction) => ({ ...transaction }));
}

function defaultPointState() {
  return {
    balance: initialPointBalance,
    transactions: cloneTransactions(initialPointTransactions),
  };
}

function normalizePointState(state) {
  if (!state || !Number.isFinite(Number(state.balance)) || !Array.isArray(state.transactions)) {
    return defaultPointState();
  }
  return {
    balance: Math.max(0, Number(state.balance)),
    transactions: cloneTransactions(state.transactions),
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

function writePointState(state) {
  pointState = normalizePointState(state);
  try {
    window.localStorage.setItem(pointStorageKey, JSON.stringify(pointState));
  } catch (error) {
    console.warn("Point storage write failed", error);
  }
  pointChannel?.postMessage({ type: "points-updated", state: pointState });
}

function pointApiBaseUrl() {
  const base = String(lineConfig.pointApiBaseUrl || lineConfig.demoApiBaseUrl || "").trim();
  return base && base.startsWith("https://") ? base.replace(/\/$/, "") : "";
}

function pointApiMemberUrl(path = "") {
  const base = pointApiBaseUrl();
  if (!base) return "";
  return `${base}/points/${encodeURIComponent(memberNumber)}${path}`;
}

function pointStateFromRemote(data) {
  const remoteMember = data?.member || {};
  memberName = remoteMember.representative_name || remoteMember.member_name || memberName;
  const numericBalance = Number(data?.balance ?? remoteMember.current_points);
  return {
    balance: Number.isFinite(numericBalance) ? Math.max(0, numericBalance) : initialPointBalance,
    transactions: Array.isArray(data?.transactions)
      ? data.transactions.map((transaction) => ({
          id: transaction.id,
          delta: Number(transaction.delta) || 0,
          reason: transaction.reason || "ポイント調整",
          staff: transaction.staff_name || transaction.staff || "本店",
          memo: transaction.memo || "",
          createdAt: transaction.created_at || transaction.createdAt,
          balanceAfter: Number(transaction.balance_after ?? transaction.balanceAfter) || 0,
        }))
      : cloneTransactions(initialPointTransactions),
  };
}

function formatPoints(value) {
  return `${value.toLocaleString("ja-JP")}pt`;
}

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "日時未登録";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStaffBusy(nextBusy) {
  isSubmitting = nextBusy;
  applyPointsButton.disabled = nextBusy;
  staffDeltaInput.disabled = nextBusy;
  staffReasonInput.disabled = nextBusy;
  staffMemoInput.disabled = nextBusy;
}

function showStaffResult(message) {
  staffResult.textContent = message;
  staffResult.hidden = false;
}

function renderStaffPanel() {
  staffMemberName.textContent = `${memberName} 様`;
  staffMemberCode.textContent = memberNumber;
  staffCurrentPoints.textContent = formatPoints(pointState.balance);
  staffDeltaInput.value = String(selectedPointDelta);
  document.querySelectorAll(".staff-delta-button").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.delta) === selectedPointDelta);
    button.disabled = isSubmitting;
  });
  renderTransactionList();
}

function renderTransactionList() {
  staffTransactionList.innerHTML = pointState.transactions
    .slice(0, 6)
    .map((transaction) => {
      const deltaText = `${transaction.delta > 0 ? "+" : ""}${transaction.delta}pt`;
      const minus = transaction.delta < 0 ? " is-minus" : "";
      return `
        <div class="staff-transaction-item">
          <span>
            <strong>${escapeHtml(transaction.reason)}</strong>
            <span class="staff-transaction-meta">${escapeHtml(formatDate(transaction.createdAt))} / ${escapeHtml(transaction.staff)} / 残高 ${escapeHtml(formatPoints(transaction.balanceAfter))}</span>
          </span>
          <strong class="point-delta${minus}">${escapeHtml(deltaText)}</strong>
        </div>
      `;
    })
    .join("");
}

function setSelectedPointDelta(value) {
  selectedPointDelta = value;
  renderStaffPanel();
}

async function loadRemotePointState() {
  const url = pointApiMemberUrl();
  if (!url) {
    staffSyncText.textContent = "ローカルのみ";
    return;
  }
  staffSyncText.textContent = "同期中";
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Point API ${response.status}`);
    const data = await response.json();
    writePointState(pointStateFromRemote(data));
    staffSyncText.textContent = "共有同期済み";
    renderStaffPanel();
  } catch (error) {
    console.warn("Remote point load failed", error);
    staffSyncText.textContent = "API未接続";
  }
}

async function postRemotePointAdjustment(delta) {
  const url = pointApiMemberUrl("/transactions");
  if (!url) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Staff-Token": staffToken,
    },
    body: JSON.stringify({
      staffToken,
      delta,
      reason: staffReasonInput.value,
      staffName: "本店スタッフ",
      memo: staffMemoInput.value.trim(),
      memberName,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Point API ${response.status}`);
  }
  return pointStateFromRemote(data);
}

function applyLocalPointAdjustment(requestedDelta) {
  const previousBalance = pointState.balance;
  const nextBalance = Math.max(0, previousBalance + requestedDelta);
  const actualDelta = nextBalance - previousBalance;
  if (actualDelta === 0) {
    staffDeltaInput.focus();
    return;
  }

  const transaction = {
    id: `pt-${Date.now()}`,
    delta: actualDelta,
    reason: staffReasonInput.value,
    staff: "本店スタッフ",
    memo: staffMemoInput.value.trim(),
    createdAt: new Date().toISOString(),
    balanceAfter: nextBalance,
  };

  writePointState({
    balance: nextBalance,
    transactions: [transaction, ...pointState.transactions],
  });

  selectedPointDelta = actualDelta;
  staffMemoInput.value = "";
  showStaffResult(`${actualDelta > 0 ? "+" : ""}${actualDelta}pt をローカル確認用に反映しました。共有API未設定のため別スマホには同期されません。`);
  staffSyncText.textContent = "ローカルのみ";
  renderStaffPanel();
}

async function applyPointAdjustment() {
  if (isSubmitting) return;
  const requestedDelta = Number.parseInt(staffDeltaInput.value, 10);
  if (!Number.isFinite(requestedDelta) || requestedDelta === 0) {
    staffDeltaInput.focus();
    return;
  }

  if (!pointApiBaseUrl()) {
    applyLocalPointAdjustment(requestedDelta);
    return;
  }

  setStaffBusy(true);
  staffSyncText.textContent = "送信中";
  renderStaffPanel();
  try {
    const previousBalance = pointState.balance;
    const nextState = await postRemotePointAdjustment(requestedDelta);
    const appliedDelta = nextState.balance - previousBalance;
    writePointState(nextState);
    selectedPointDelta = appliedDelta || requestedDelta;
    staffMemoInput.value = "";
    const deltaText = `${selectedPointDelta > 0 ? "+" : ""}${selectedPointDelta}pt`;
    showStaffResult(`${deltaText} を共有APIへ反映しました。顧客スマホ側も数秒で更新されます。`);
    staffSyncText.textContent = "共有同期済み";
    renderStaffPanel();
  } catch (error) {
    console.warn("Remote point write failed", error);
    showStaffResult(`共有APIへ反映できませんでした。${error.message || "通信状態を確認してください。"}`);
    staffSyncText.textContent = "API未反映";
  } finally {
    setStaffBusy(false);
    renderStaffPanel();
  }
}

document.querySelectorAll(".staff-delta-button").forEach((button) => {
  button.addEventListener("click", () => setSelectedPointDelta(Number(button.dataset.delta)));
});

staffDeltaInput.addEventListener("input", () => {
  const value = Number.parseInt(staffDeltaInput.value, 10);
  if (Number.isFinite(value)) selectedPointDelta = value;
  renderStaffPanel();
});

applyPointsButton.addEventListener("click", applyPointAdjustment);

window.addEventListener("storage", (event) => {
  if (event.key !== pointStorageKey || !event.newValue) return;
  try {
    pointState = normalizePointState(JSON.parse(event.newValue));
    renderStaffPanel();
  } catch (error) {
    console.warn("Point storage sync failed", error);
  }
});

pointChannel?.addEventListener("message", (event) => {
  if (event.data?.type !== "points-updated") return;
  pointState = normalizePointState(event.data.state);
  renderStaffPanel();
});

renderStaffPanel();
loadRemotePointState();
