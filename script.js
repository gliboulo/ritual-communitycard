const pseudoInput = document.getElementById("pseudo");
const roleSelect = document.getElementById("role");
const avatarInput = document.getElementById("avatarInput");

const pseudoDisplay = document.getElementById("pseudoDisplay");
const roleDisplay = document.getElementById("roleDisplay");
const descDisplay = document.getElementById("descDisplay");
const avatarPreview = document.getElementById("avatarPreview");

const descs = [
  "this user lives in the Infernet",
  "this user was born to bring AI computation",
  "this user believes in the end of opaque algorithms",
  "this user wondered how AI can natively live onchain",
  "this user knows what TEEs mean",
  "this user will follow you through your API calls"
];

const card = document.querySelector(".card");

card.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  const rotateX = (-y / 18);
  const rotateY = (x / 18);

  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
});

card.addEventListener("mouseleave", () => {
  card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
});

function getGrade(role) {
  if (["Initiate", "Ritualist Ascendant"].includes(role)) return "Common";
  if (["Ritty Bitty", "Ritty"].includes(role)) return "Rare";
  if (["Ritualist", "Zealot"].includes(role)) return "Legendary";
  if (["Mods", "Foundation Team"].includes(role)) return "Epic";
}

function update() {
  const pseudo = pseudoInput.value || "Unnamed Ritualist";
  const role = roleSelect.value;
  const grade = getGrade(role);
  const randomDesc = descs[Math.floor(Math.random()*descs.length)];

  pseudoDisplay.textContent = pseudo;
  roleDisplay.textContent = `${role} · ${grade}`;
  descDisplay.textContent = randomDesc;
}

pseudoInput.addEventListener("input", update);
roleSelect.addEventListener("change", update);

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  avatarPreview.src = URL.createObjectURL(file);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const card = document.getElementById("card");
  htmlToImage.toPng(card).then((dataUrl) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "ritual_card.png";
    a.click();
  });
});

update();
