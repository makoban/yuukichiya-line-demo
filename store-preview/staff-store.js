const $ = (id) => document.getElementById(id);
const operations = [
  { icon: "fa-qrcode", label: "QR読取", staff: "山田", time: "10:24" },
  { icon: "fa-coins", label: "ポイント +50", staff: "佐藤", time: "10:18" },
  { icon: "fa-user-group", label: "会員照会", staff: "山田", time: "9:55" },
  { icon: "fa-ruler", label: "採寸記録", staff: "佐藤", time: "9:42" },
  { icon: "fa-box", label: "商品受け渡し", staff: "山田", time: "9:16" },
];
let toastTimer = null;

function showToast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => { $("toast").hidden = true; }, 3000);
}

function openDialog(id) {
  const dialog = $(id);
  if (dialog && !dialog.open) dialog.showModal();
}

function showView(id) {
  document.querySelectorAll(".app-view").forEach((view) => {
    const active = view.id === id;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
  });
  document.querySelectorAll(".bottom-nav [data-view]").forEach((button) => {
    const active = button.dataset.view === id;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  window.scrollTo({ top: 0, behavior: "instant" });
  history.replaceState(null, "", `#${id}`);
}

function renderHistory() {
  const list = $("historyList");
  list.replaceChildren(...operations.map((operation) => {
    const article = document.createElement("article");
    article.className = "history-item";
    const icon = document.createElement("span");
    icon.innerHTML = `<i class="fa-solid ${operation.icon}" aria-hidden="true"></i>`;
    const detail = document.createElement("div");
    const title = document.createElement("strong");
    const staff = document.createElement("small");
    title.textContent = operation.label;
    staff.textContent = `担当：${operation.staff}`;
    detail.append(title, staff);
    const time = document.createElement("time");
    time.textContent = operation.time;
    article.append(icon, detail, time);
    return article;
  }));
}

document.querySelectorAll("[data-dialog]").forEach((button) => {
  button.addEventListener("click", () => openDialog(button.dataset.dialog));
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

$("simulateScan").addEventListener("click", () => {
  $("scanDialog").close();
  showToast("確認用QRを読み取りました。会員情報へ進めます。");
  setTimeout(() => openDialog("memberDialog"), 250);
});

$("memberSearchButton").addEventListener("click", () => {
  $("memberResult").hidden = false;
  showToast("確認用の会員情報を表示しました。");
});

$("memberQuery").addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  $("memberSearchButton").click();
});

$("simulatePoint").addEventListener("click", () => {
  const mode = document.querySelector('input[name="pointMode"]:checked')?.value;
  const amount = Math.max(1, Number.parseInt($("pointAmount").value, 10) || 0);
  $("pointDialog").close();
  showToast(`確認版：${amount}ポイントを${mode === "subtract" ? "利用" : "付与"}する内容です。実際の変更はありません。`);
});

for (const id of ["previewReservationButton", "previewReservationListButton"]) {
  $(id).addEventListener("click", (event) => {
    event.currentTarget.closest("dialog")?.close();
    showToast("外部確認版のため、実予約データには接続していません。");
  });
}

renderHistory();
showView(["history", "settings"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "home");
