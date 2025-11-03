const pseudoInput   = document.getElementById("pseudo");
const roleSelect    = document.getElementById("role");
const avatarInput   = document.getElementById("avatarInput");

const pseudoDisplay = document.getElementById("pseudoDisplay");
const roleDisplay   = document.getElementById("roleDisplay");
const descDisplay   = document.getElementById("descDisplay");
const avatarPreview = document.getElementById("avatarPreview");
const rarityPill    = document.getElementById("rarityPill");

const descs = [
  "this user lives in the Infernet",
  "this user was born to bring AI computation",
  "this user believes in the end of opaque algorithms",
  "this user wondered how AI can natively live onchain",
  "this user knows what TEEs mean",
  "this user will follow you through your API calls"
];

function getGrade(role) {
  if (["Initiate","Ritualist Ascendant"].includes(role)) return "Common";
  if (["Ritty Bitty","Ritty"].includes(role))           return "Rare";
  if (["Ritualist","Zealot"].includes(role))            return "Legendary";
  if (["Mods","Foundation Team"].includes(role))        return "Epic";
  return "Common";
}

function update() {
  const pseudo = pseudoInput.value || "Unnamed Ritualist";
  const role = roleSelect.value;
  const grade = getGrade(role);
  const randomDesc = descs[Math.floor(Math.random()*descs.length)];

  pseudoDisplay.textContent = pseudo;
  roleDisplay.textContent = `${role} · ${grade}`;
  descDisplay.textContent = randomDesc;

  const pill = document.getElementById("rarityPill");
  pill.textContent = grade;
  pill.className = "rarity-pill " + grade.toLowerCase();
}

pseudoInput.addEventListener("input",  update);
roleSelect.addEventListener("change", update);

avatarInput.addEventListener("change", () => {
  const f = avatarInput.files?.[0];
  avatarPreview.src = f ? URL.createObjectURL(f) : "pepefront.png";
});

document.getElementById("pledgeBtn").addEventListener("click", shareToTwitter);

async function uploadTo0x0(blob) {
  const form = new FormData();
  form.append("file", blob, "card.png");
  
  const res = await fetch("https://0x0.st", {
    method: "POST",
    body: form
  });

  return await res.text(); // renvoie directement l’URL finale (ex: https://0x0.st/abcd.png)
}

async function shareToTwitter() {
  const card = document.getElementById("card");

  // Convertit la carte en blob (pas juste DataURL, nécessaire pour upload)
  const blob = await htmlToImage.toBlob(card, { pixelRatio: 2 });

  // Upload vers 0x0.st → on récupère l'URL publique
  const imageUrl = await uploadTo0x0(blob);

  // Texte du tweet (customisable)
  const tweetText = encodeURIComponent(
"i have taken the pledge.\n\nthe ritual grows stronger.\nhttps://nafyn.github.io/ritual-communitycard/"
);

  // Ouvre Twitter avec l’image
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(imageUrl)}`;
  window.open(tweetUrl, "_blank");
}


update();
