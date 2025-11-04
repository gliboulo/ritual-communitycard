// --- Elements ---
const pseudoInput   = document.getElementById("pseudo");
const roleSelect    = document.getElementById("role");
const avatarInput   = document.getElementById("avatarInput");

const pseudoDisplay = document.getElementById("pseudoDisplay");
const roleDisplay   = document.getElementById("roleDisplay");
const descDisplay   = document.getElementById("descDisplay");
const avatarPreview = document.getElementById("avatarPreview");
const rarityPill    = document.getElementById("rarityPill");

// --- Descriptions pool ---
const descs = [
  "this user lives in the Infernet",
  "this user was born to bring AI computation",
  "this user believes in the end of opaque algorithms",
  "this user wondered how AI can natively live onchain",
  "this user knows what TEEs mean",
  "this user will follow you through your API calls"
];

let chosenDesc = descs[Math.floor(Math.random() * descs.length)];

// --- Role → Rarity ---
function getGrade(role) {
  if (["Initiate","Ritualist Ascendant"].includes(role)) return "Common";
  if (["Ritty Bitty","Ritty"].includes(role))           return "Rare";
  if (["Ritualist","Zealot"].includes(role))            return "Legendary";
  if (["Mods","Foundation Team"].includes(role))        return "Epic";
  return "Common";
}

// --- Update card preview ---
function update() {
  const pseudo = pseudoInput.value || "Unnamed Ritualist";
  const role = roleSelect.value || "Initiate";
  const grade  = getGrade(role);

  pseudoDisplay.textContent = pseudo;
  roleDisplay.innerHTML = `<span class="role">${role}</span> <span class="dot">·</span> <span class="grade">${grade}</span>`;
  descDisplay.textContent = chosenDesc;

  rarityPill.textContent = grade;
  rarityPill.className   = "rarity-pill " + grade.toLowerCase();
}

pseudoInput.addEventListener("input", update);
roleSelect.addEventListener("change", update);

// --- Avatar preview ---
avatarInput.addEventListener("change", () => {
  const f = avatarInput.files?.[0];
  avatarPreview.src = f ? URL.createObjectURL(f) : "pepefront.png";
});

async function copyCardToClipboard() {
  const card = document.getElementById("card");
  const cardContent = document.getElementById("cardContent");
  const hint = document.querySelector(".copy-hint");
  const feedback = document.querySelector(".copy-feedback");

  // masque ui pendant capture
  card.classList.add("hide-copy-ui");

  const blob = await htmlToImage.toBlob(cardContent, {
    pixelRatio: 2,
    backgroundColor: "#0d1512"
  });

  card.classList.remove("hide-copy-ui");

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob })
  ]);

 // --- SEQUENCE ANIMÉE SANS OVERLAP ---
const originalText = feedback.textContent;

// 0) hide hint instantly so nothing overlaps
hint.style.opacity = 0;

// 1) show summoning
feedback.textContent = "[summoning…] ✧⟡";
feedback.style.opacity = 1;

setTimeout(() => {
  // 2) switch to copied! + glow
  feedback.textContent = originalText;
  card.classList.add("copied");
}, 450);

setTimeout(() => {
  // 3) fade everything out & restore hover behavior
  feedback.style.opacity = 0;
  card.classList.remove("copied");
  
  // allow hover to show "click to copy" again
  // (only once animation ends so no flicker)
  hint.style.opacity = ""; // reset to CSS-controlled opacity
}, 1200);

document.getElementById("card").addEventListener("click", copyCardToClipboard);

// --- Tweet button (no image upload, just text) ---
function shareToTwitter() {
  const tweetText = encodeURIComponent(
`i have taken the pledge. the ritual grows stronger 🕯️

take yours on https://nafyn.github.io/ritual-communitycard/`
  );

  const url = `https://twitter.com/intent/tweet?text=${tweetText}`;
  window.open(url, "_blank");
}

document.getElementById("pledgeBtn").addEventListener("click", shareToTwitter);

// initial draw
update();
