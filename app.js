const memberNumber = "YK-001234";

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
    school: "",
    avatar: "./assets/avatars/avatar-04-guardian.png",
  },
  {
    id: "m2",
    name: "山田 花子",
    birthday: "2013-08-20",
    role: "生徒",
    school: "豊田市立さくら中学校",
    avatar: "./assets/avatars/avatar-01-student-girl.png",
  },
  {
    id: "m3",
    name: "山田 太郎",
    birthday: "2015-05-12",
    role: "生徒",
    school: "豊田市立みどり小学校",
    avatar: "./assets/avatars/avatar-02-student-boy.png",
  },
];

let members = cloneMembers(initialMembers);
let selectedId = members[0].id;

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
const roleInput = document.getElementById("roleInput");
const schoolInput = document.getElementById("schoolInput");
const photoInput = document.getElementById("photoInput");
const addMemberButton = document.getElementById("addMemberButton");
const liffStatus = document.getElementById("liffStatus");
const lineConfig = window.YUUKICHIYA_LINE_CONFIG || {};

initLiff();

function selectedMember() {
  return members.find((member) => member.id === selectedId) || members[0];
}

function cloneMembers(list) {
  return list.map((member) => ({ ...member }));
}

function roleLabel(member, index) {
  return index === 0 ? "代表者" : member.role;
}

function formatBirthday(value) {
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return "未登録";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
    const profile = await liff.getProfile();
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
      const detail = [roleLabel(member, index), formatBirthday(member.birthday)].filter(Boolean).join(" / ");
      return `
        <button class="member-card${active}${representative}" type="button" data-id="${member.id}">
          <img src="${member.avatar}" alt="${member.name}のアイコン" />
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
  roleInput.value = member.role;
  schoolInput.value = member.school;
}

function renderAvatars() {
  const current = members[0].avatar;
  avatarGrid.innerHTML = avatarFiles
    .map((file) => {
      const src = `./assets/avatars/${file}`;
      const active = current.endsWith(file) ? " is-active" : "";
      return `
        <button class="avatar-option${active}" type="button" data-src="${src}" aria-label="アイコンを選択">
          <img src="${src}" alt="" />
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
}

function drawQr(seed) {
  const canvas = document.getElementById("qrCanvas");
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
}

avatarOpenButton.addEventListener("click", openAvatarSheet);
avatarCloseButton.addEventListener("click", closeAvatarSheet);
avatarSheet.addEventListener("click", (event) => {
  if (event.target === avatarSheet) closeAvatarSheet();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !avatarSheet.hidden) closeAvatarSheet();
});

nameInput.addEventListener("input", (event) => updateSelected("name", event.target.value));
birthdayInput.addEventListener("input", (event) => updateSelected("birthday", event.target.value));
roleInput.addEventListener("change", (event) => updateSelected("role", event.target.value));
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
    school: "学校名を入力",
    avatar: `./assets/avatars/${avatarFiles[(nextIndex + 4) % avatarFiles.length]}`,
  };
  members.push(member);
  selectedId = member.id;
  render();
});

render();
