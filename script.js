const pseudoInput = document.getElementById("pseudo");
const roleSelect = document.getElementById("role");
const avatarInput = document.getElementById("avatarInput");

const pseudoDisplay = document.getElementById("pseudoDisplay");
const roleDisplay = document.getElementById("roleDisplay");
const descDisplay = document.getElementById("descDisplay");
const avatarPreview = document.getElementById("avatarPreview");
const rarityPill = document.getElementById("rarityPill"); // ✅ on récupère le pill

const descs = [
  "this user lives in the Infernet",
  "this user was born to bring AI computation",
  "this user believes in the end of opaque algorithms",
  "this user wondered how AI can natively live onchain",
  "this user knows what TEEs mean",
  "this user will follow you through your API calls"
];

// -------------------- TILT --------------------
const card = document.querySelector(".card-inner");
let curX = 0, curY = 0, tgtX = 0, tgtY = 0, rafId;

function animateTilt(){
  curX += (tgtX - curX) * 0.18;
  curY += (tgtY - curY) * 0.18;
  card.style.transform = `translateZ(35px) rotateX(${curY}deg) rotateY(${curX}deg) scale(1.04)`;
  if(Math.abs(tgtX - curX) > 0.01 || Math.abs(tgtY - curY) > 0.01){
    rafId = requestAnimationFrame(animateTilt);
  } else {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

document.querySelector(".card").addEventListener("mousemove", e => {
  const r = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - (r.left + r.width/2);
  const y = e.clientY - (r.top + r.height/2);
  const MAX = 14, SENS = 18;
  tgtX = Math.max(-MAX, Math.min(MAX, x / SENS));
  tgtY = Math.max(-MAX, Math.min(MAX, -y / SENS));
  if(!rafId) rafId = requestAnimationFrame(animateTilt);
});

document.querySelector(".card").addEventListener("mouseleave", () => {
  tgtX = 0; tgtY = 0;
  if(!rafId) rafId = requestAnimationFrame(animateTilt);
});

// -------------------- DISPLAY UPDATE --------------------
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

  // ✅ c’est ICI qu’on met à jour le pill
  rarityPill.textContent = grade;
}

pseudoInput.addEventListener("input", update);
roleSelect.addEventListener("change", update);

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  avatarPreview.src = URL.createObjectURL(file);
});

// -------------------- DOWNLOAD --------------------
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
