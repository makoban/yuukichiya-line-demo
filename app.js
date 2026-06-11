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

const presets = {
  guardian: [
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
  ],
  student: [
    {
      id: "m1",
      name: "山田 一郎",
      birthday: "2009-10-02",
      role: "代表者",
      school: "豊田高校",
      avatar: "./assets/avatars/avatar-03-student-senior.png",
    },
    {
      id: "m2",
      name: "山田 太郎",
      birthday: "2015-05-12",
      role: "生徒",
      school: "豊田市立みどり小学校",
      avatar: "./assets/avatars/avatar-02-student-boy.png",
    },
  ],
  family: [
    {
      id: "m1",
      name: "山田 さくら",
      birthday: "1978-02-18",
      role: "代表者",
      school: "",
      avatar: "./assets/avatars/avatar-10-owl.png",
    },
    {
      id: "m2",
      name: "山田 花子",
      birthday: "2013-08-20",
      role: "生徒",
      school: "豊田市立さくら中学校",
      avatar: "./assets/avatars/avatar-01-student-girl.png",
    },
  ],
};

let mode = "guardian";
let members = clonePreset(mode);
let selectedId = members[0].id;

const memberSummary = document.getElementById("memberSummary");
const memberList = document.getElementById("memberList");
const avatarGrid = document.getElementById("avatarGrid");
const nameInput = document.getElementById("nameInput");
const birthdayInput = document.getElementById("birthdayInput");
const roleInput = document.getElementById("roleInput");
const schoolInput = document.getElementById("schoolInput");
const photoInput = document.getElementById("photoInput");
const addMemberButton = document.getElementById("addMemberButton");
const liffStatus = document.getElementById("liffStatus");
const lineConfig = window.YUUKICHIYA_LINE_CONFIG || {};

initLiff();

function today() {
  return new Date();
}

function selectedMember() {
  return members.find((member) => member.id === selectedId) || members[0];
}

function clonePreset(presetMode) {
  return presets[presetMode].map((member) => ({ ...member }));
}

function calcAge(birthday) {
  const birth = new Date(`${birthday}T00:00:00`);
  const now = today();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return Number.isFinite(age) ? age : null;
}

function calcGrade(birthday) {
  const birth = new Date(`${birthday}T00:00:00`);
  if (!Number.isFinite(birth.getFullYear())) return "未入力";
  const now = today();
  const academicYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  const earlyYearAdjustment = month < 4 || (month === 4 && day === 1) ? 1 : 0;
  const gradeNumber = academicYear - birth.getFullYear() - 6 + earlyYearAdjustment;
  if (gradeNumber <= 0) return "未就学";
  if (gradeNumber <= 6) return `小学${gradeNumber}年`;
  if (gradeNumber <= 9) return `中学${gradeNumber - 6}年`;
  if (gradeNumber <= 12) return `高校${gradeNumber - 9}年`;
  return "一般";
}

function ageText(member) {
  const age = calcAge(member.birthday);
  return age === null ? "年齢未入力" : `${age}歳`;
}

function gradeText(member) {
  return calcGrade(member.birthday);
}

function renderSummary() {
  const rep = members[0];
  memberSummary.innerHTML = `
    <div class="summary-avatar">
      <img src="${rep.avatar}" alt="${rep.name}のアイコン" />
    </div>
    <div class="summary-text">
      <strong>${rep.name} 様</strong>
      <div class="summary-meta">
        <span class="chip">会員番号 YK-001234</span>
        <span class="chip">${rep.role}</span>
        <span class="chip">${ageText(rep)}</span>
        <span class="chip">${gradeText(rep)}</span>
      </div>
    </div>
  `;
  drawQr(`YK-001234:${rep.name}`);
}

async function initLiff() {
  if (!lineConfig.liffId || !window.liff) {
    liffStatus.textContent = "勇吉屋 公式LINE デモ";
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
    liffStatus.textContent = "LIFF未接続デモ";
    console.warn("LIFF initialization failed", error);
  }
}

function renderMembers() {
  memberList.innerHTML = members
    .map((member) => {
      const active = member.id === selectedId ? " is-active" : "";
      const school = member.school || "学校登録なし";
      return `
        <button class="member-card${active}" type="button" data-id="${member.id}">
          <img src="${member.avatar}" alt="${member.name}のアイコン" />
          <span>
            <strong>${member.name}</strong>
            <span>${member.role} / ${school}</span>
          </span>
          <span class="member-age">
            <b>${ageText(member)}</b>
            <b>${gradeText(member)}</b>
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
  const current = selectedMember().avatar;
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
      selectedMember().avatar = button.dataset.src;
      render();
    });
  });
}

function updateSelected(key, value) {
  selectedMember()[key] = value;
  renderSummary();
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

function setMode(nextMode) {
  mode = nextMode;
  members = clonePreset(mode);
  selectedId = members[0].id;
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  render();
}

function render() {
  renderSummary();
  renderMembers();
  renderEditor();
  renderAvatars();
}

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
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
    selectedMember().avatar = reader.result;
    render();
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
