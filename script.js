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
  const role   = roleSelect.value;
  const grade  = getGrade(role);
  const randomDesc = descs[Math.floor(Math.random() * descs.length)];

  pseudoDisplay.textContent = pseudo;
  roleDisplay.textContent   = `${role} · ${grade}`;
  descDisplay.textContent   = randomDesc;

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

// --- Copy card to clipboard on click ---
async function copyCardToClipboard() {
  const card = document.getElementById("card");
  const blob = await htmlToImage.toBlob(card, { pixelRatio: 2 });

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob })
  ]);

  // small visual feedback
  const hint = document.querySelector(".copy-hint");
  hint.textContent = "copied!";
  setTimeout(() => hint.textContent = "click to copy", 900);
}

document.getElementById("card").addEventListener("click", copyCardToClipboard);

// --- Tweet button (no image upload, just text) ---
function shareToTwitter() {
  const tweetText = encodeURIComponent(
`i have taken the pledge.

the ritual grows stronger.
https://nafyn.github.io/ritual-communitycard/`
  );

  const url = `https://twitter.com/intent/tweet?text=${tweetText}`;
  window.open(url, "_blank");
}

document.getElementById("pledgeBtn").addEventListener("click", shareToTwitter);

// initial draw
update();
