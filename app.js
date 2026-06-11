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

const memberSummary = document.getElementById("memberSummary");
const memberList = document.getElementById("memberList");
const avatarGrid = document.getElementById("avatarGrid");
const avatarSheet = document.getElementById("avatarSheet");
const avatarOpenButton = document.getElementById("avatarOpenButton");
const avatarCloseButton = document.getElementById("avatarCloseButton");
const representativeAvatar = document.getElementById("representativeAvatar");
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

function cloneMembers(list) {
  return list.map((member) => ({ ...member }));
}

function roleLabel(member, index) {
  return index === 0 ? "代表者" : member.role;
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
  representativeAvatar.src = rep.avatar;
  representativeAvatar.alt = `${rep.name}の代表者アイコン`;
  memberSummary.innerHTML = `
    <div class="summary-text">
      <strong>${rep.name} 様</strong>
      <div class="summary-meta">
        <span class="chip">会員番号 YK-001234</span>
        <span class="chip">代表者</span>
        <span class="chip">${ageText(rep)}</span>
        <span class="chip">${gradeText(rep)}</span>
      </div>
    </div>
  `;
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
    .map((member, index) => {
      const active = member.id === selectedId ? " is-active" : "";
      const representative = index === 0 ? " is-representative" : "";
      const school = member.school || "学校登録なし";
      return `
        <button class="member-card${active}${representative}" type="button" data-id="${member.id}">
          <img src="${member.avatar}" alt="${member.name}のアイコン" />
          <span class="member-card-main">
            <strong>${member.name}</strong>
            <span class="member-card-detail">${roleLabel(member, index)} / ${school}</span>
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
      closeAvatarSheet();
    });
  });
}

function updateSelected(key, value) {
  selectedMember()[key] = value;
  renderSummary();
  renderMembers();
  renderAvatars();
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
  renderSummary();
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
    selectedMember().avatar = reader.result;
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
