const memberNumber = "YK-001234";
const memberName = "山田 由美";
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

function formatPoints(value) {
  return `${value.toLocaleString("ja-JP")}pt`;
}

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "日時未登録";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function renderStaffPanel() {
  staffMemberName.textContent = `${memberName} 様`;
  staffMemberCode.textContent = memberNumber;
  staffCurrentPoints.textContent = formatPoints(pointState.balance);
  staffDeltaInput.value = String(selectedPointDelta);
  document.querySelectorAll(".staff-delta-button").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.delta) === selectedPointDelta);
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
            <strong>${transaction.reason}</strong>
            <span class="staff-transaction-meta">${formatDate(transaction.createdAt)} / ${transaction.staff} / 残高 ${formatPoints(transaction.balanceAfter)}</span>
          </span>
          <strong class="point-delta${minus}">${deltaText}</strong>
        </div>
      `;
    })
    .join("");
}

function setSelectedPointDelta(value) {
  selectedPointDelta = value;
  renderStaffPanel();
}

function applyPointAdjustment() {
  const requestedDelta = Number.parseInt(staffDeltaInput.value, 10);
  if (!Number.isFinite(requestedDelta) || requestedDelta === 0) {
    staffDeltaInput.focus();
    return;
  }

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
  const deltaText = `${actualDelta > 0 ? "+" : ""}${actualDelta}pt`;
  staffResult.textContent = `${deltaText} を反映しました。顧客側のポイント画面にも即時反映されます。`;
  staffResult.hidden = false;
  staffSyncText.textContent = "反映済み";
  renderStaffPanel();
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
