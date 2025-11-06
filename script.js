// --- Elements ---
const pseudoInput   = document.getElementById("pseudo");
const roleSelect    = document.getElementById("role");
const avatarInput   = document.getElementById("avatarInput");

const pseudoDisplay = document.getElementById("pseudoDisplay");
const roleDisplay   = document.getElementById("roleDisplay");
const descDisplay   = document.getElementById("descDisplay");
const avatarPreview = document.getElementById("avatarPreview");
const avatarInner   = document.querySelector(".avatar-inner");
const rarityPill    = document.getElementById("rarityPill");
const cardElement   = document.getElementById("card");
const copyCardBtn   = document.getElementById("copyCardBtn");
const copyHint      = document.querySelector(".copy-hint");
const copyFeedback  = document.querySelector(".copy-feedback");
let copyHintDefaultText = copyHint ? copyHint.textContent : "click to copy";
let copyHintDefaultColor = copyHint ? getComputedStyle(copyHint).color : "";
const defaultAvatarSrc = avatarPreview ? avatarPreview.getAttribute("src") : "";
const iosDevice = isIOSDevice();
const avatarPreloads = [];

if (iosDevice && copyHint) {
  copyHintDefaultText = "tap the copy button";
  copyHint.textContent = copyHintDefaultText;
  copyHintDefaultColor = getComputedStyle(copyHint).color;
  copyHint.style.opacity = "1";
}

if (avatarPreview) {
  const initialSrc = avatarPreview.currentSrc || avatarPreview.src || defaultAvatarSrc || "pepefront.png";
  avatarPreview.dataset.exportSrc = initialSrc;
  if (avatarInner) {
    avatarInner.style.backgroundImage = `url("${initialSrc}")`;
    avatarInner.style.backgroundPosition = "center";
    avatarInner.style.backgroundSize = "cover";
    avatarInner.style.backgroundRepeat = "no-repeat";
  }
}

function setAvatarPreviewSource(src, uploaded) {
  if (!avatarPreview) return;
  avatarPreview.src = src;
  avatarPreview.dataset.exportSrc = src;
  if (avatarInner) {
    avatarInner.style.backgroundImage = `url("${src}")`;
  }
  const preloader = new Image();
  preloader.src = src;
  avatarPreloads.push(preloader);

  if (uploaded) {
    avatarPreview.setAttribute("data-uploaded-src", "true");
  } else {
    avatarPreview.removeAttribute("data-uploaded-src");
  }
}

cardElement.setAttribute("role", "button");
cardElement.setAttribute("tabindex", "0");
cardElement.setAttribute("aria-label", "Copy your ritual card to the clipboard");

// --- Descriptions pool ---
const descs = [
  "this user lives in the Infernet",
  "this user was born to bring AI computation",
  "this user believes in the end of opaque algorithms",
  "this user wondered how AI can natively live onchain",
  "this user knows what TEEs mean",
  "this user will follow you through your API calls"
];

descDisplay.textContent = descs[Math.floor(Math.random() * descs.length)];

// --- Role to Rarity ---
function getGrade(role) {
  if (["Initiate", "Ritualist Ascendant"].includes(role)) return "Common";
  if (["Ritty Bitty", "Ritty"].includes(role))            return "Rare";
  if (["Ritualist", "Zealot"].includes(role))             return "Legendary";
  if (["Mods", "Foundation Team"].includes(role))         return "Epic";
  return "Common";
}

// --- Update card preview ---
function update() {
  const pseudo = pseudoInput.value.trim() || "Unnamed Ritualist";
  const role = roleSelect.value || "Initiate";
  const grade = getGrade(role);

  pseudoDisplay.textContent = pseudo;
  roleDisplay.innerHTML = `
    <span class="font-semibold text-primary">${role}</span>
    <span class="mx-1 text-foam/40">&bull;</span>
    <span class="text-primary">${grade}</span>
  `;

  rarityPill.textContent = grade;
}

pseudoInput.addEventListener("input", update);
roleSelect.addEventListener("change", update);

// --- Avatar preview ---
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files?.[0];
  const fallbackSrc = defaultAvatarSrc || "pepefront.png";

  if (!file) {
    setAvatarPreviewSource(fallbackSrc, false);
    return;
  }

  if (!file.type.startsWith("image/")) {
    setAvatarPreviewSource(fallbackSrc, false);
    return;
  }

  const reader = new FileReader();
  reader.onload = event => {
    if (avatarInput.files?.[0] !== file) return;

    const result = event.target?.result;
    if (typeof result === "string" && result.startsWith("data:image")) {
      setAvatarPreviewSource(result, true);
    } else {
      setAvatarPreviewSource(fallbackSrc, false);
    }
  };
  reader.onerror = () => {
    setAvatarPreviewSource(fallbackSrc, false);
  };
  reader.readAsDataURL(file);
});

function waitForImageLoad(img) {
  if (!img) return Promise.resolve();

  if (img.complete && img.naturalWidth !== 0) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const handleLoad = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };

    img.addEventListener("load", handleLoad, { once: true });
    img.addEventListener("error", handleError, { once: true });
  });
}

async function ensureCardImagesReady() {
  const images = cardElement.querySelectorAll("img");
  const loadPromises = Array.from(images).map(waitForImageLoad);
  await Promise.all(loadPromises);
}

async function waitForExportNodeReady(node) {
  if (!node) return;

  const images = node.querySelectorAll("img");
  const loadPromises = Array.from(images).map(img => {
    if (img.src?.startsWith("data:")) return waitForImageLoad(img);
    return waitForImageLoad(img);
  });
  await Promise.all(loadPromises);

  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
}

function buildExportCard() {
  const clone = cardElement.cloneNode(true);
  clone.removeAttribute("id");
  clone.style.transform = "none";
  clone.style.transition = "none";
  clone.style.boxShadow = "none";
  clone.style.cursor = "default";
  clone.classList.add("export-mode");
  const exportWidth = 576;
  clone.style.width = `${exportWidth}px`;
  clone.style.maxWidth = `${exportWidth}px`;
  clone.style.minWidth = `${exportWidth}px`;
  clone.style.height = "auto";
  clone.classList.remove("group");

  clone.querySelectorAll(".copy-hint, .copy-feedback, .copy-summon").forEach(el => el.remove());

  const originalAvatar = document.getElementById("avatarPreview");
  const cloneAvatar = clone.querySelector("#avatarPreview");
  const originalAvatarInner = document.querySelector(".avatar-inner");
  const cloneAvatarInner = clone.querySelector(".avatar-inner");

  if (originalAvatarInner && cloneAvatarInner) {
    const innerStyles = window.getComputedStyle(originalAvatarInner);
    cloneAvatarInner.style.backgroundImage = innerStyles.backgroundImage;
    cloneAvatarInner.style.backgroundPosition = innerStyles.backgroundPosition;
    cloneAvatarInner.style.backgroundSize = innerStyles.backgroundSize;
    cloneAvatarInner.style.backgroundRepeat = innerStyles.backgroundRepeat;
    cloneAvatarInner.style.backgroundColor = innerStyles.backgroundColor;
  }

  if (cloneAvatarInner && cloneAvatar) {
    cloneAvatar.remove();
  } else if (originalAvatar && cloneAvatar) {
    const avatarSrc = originalAvatar.dataset.exportSrc || originalAvatar.currentSrc || originalAvatar.src;
    if (avatarSrc) cloneAvatar.src = avatarSrc;
    cloneAvatar.removeAttribute("srcset");
    const originalStyles = window.getComputedStyle(originalAvatar);
    cloneAvatar.style.objectFit = originalStyles.objectFit || "cover";
    cloneAvatar.style.objectPosition = originalStyles.objectPosition || "center";
  }

  return clone;
}

async function renderCardImage() {
  await ensureCardImagesReady();

  const hasInlineImages = Array.from(cardElement.querySelectorAll("img")).some(img => {
    const src = img.currentSrc || img.src || "";
    return src.startsWith("data:") || src.startsWith("blob:");
  });

  const exportNode = buildExportCard();
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.pointerEvents = "none";
  container.style.left = "-9999px";
  container.appendChild(exportNode);
  document.body.appendChild(container);

  await waitForExportNodeReady(exportNode);

  const options = {
    pixelRatio: 2,
    backgroundColor: "#0d1512",
    cacheBust: true,
    quality: 1,
    useCORS: !hasInlineImages
  };

  const cleanup = () => {
    if (container.parentNode) container.parentNode.removeChild(container);
  };

  try {
    const blob = await htmlToImage.toBlob(exportNode, options);
    if (blob) {
      const dataUrl = await blobToDataUrl(blob);
      return { blob, dataUrl, cleanup };
    }
  } catch (err) {
    console.error("toBlob failed", err);
  }

  try {
    const dataUrl = await htmlToImage.toPng(exportNode, options);
    return { blob: null, dataUrl, cleanup };
  } catch (err) {
    console.error("toPng failed", err);
  }

  try {
    const canvas = await htmlToImage.toCanvas(exportNode, options);
    const dataUrl = canvas.toDataURL("image/png");
    let blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) blob = await dataUrlToBlob(dataUrl);
    return { blob, dataUrl, cleanup };
  } catch (err) {
    console.error("toCanvas failed", err);
  }

  try {
    const svgUrl = await htmlToImage.toSvg(exportNode, options);
    const blob = await dataUrlToBlob(svgUrl);
    return { blob, dataUrl: svgUrl, cleanup };
  } catch (err) {
    console.error("toSvg failed", err);
  }

  cleanup();
  throw new Error("Unable to render ritual card image");
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then(response => response.blob());
}

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  const iOSMatch = /iPad|iPhone|iPod/.test(ua);
  const iPadOS13Up = platform === "MacIntel" && maxTouchPoints > 1;
  return iOSMatch || iPadOS13Up;
}

function isModernImageClipboardAvailable() {
  return typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof window.ClipboardItem !== "undefined";
}

async function toPngBlob(blob) {
  if (!blob) return null;
  if (blob.type === "image/png") return blob;

  try {
    const arrayBuffer = blob.arrayBuffer ? await blob.arrayBuffer() : await new Response(blob).arrayBuffer();
    return new Blob([arrayBuffer], { type: "image/png" });
  } catch (error) {
    console.error("Failed to convert blob to PNG:", error);
    return null;
  }
}

async function attemptModernClipboardCopy(blob, dataUrl) {
  if (!isModernImageClipboardAvailable()) return false;

  const candidateBlobs = [];
  if (blob) {
    const pngBlob = await toPngBlob(blob);
    if (pngBlob) candidateBlobs.push(pngBlob);
  }
  if (dataUrl) {
    try {
      const dataBlob = await dataUrlToBlob(dataUrl);
      const pngBlob = await toPngBlob(dataBlob);
      if (pngBlob) candidateBlobs.push(pngBlob);
    } catch (error) {
      console.error("Clipboard write from data URL failed:", error);
    }
  }

  if (!candidateBlobs.length) return false;

  const payloadVariants = [];
  for (const candidate of candidateBlobs) {
    payloadVariants.push({ "image/png": candidate });
    payloadVariants.push({ "image/png": Promise.resolve(candidate) });
    if (dataUrl) {
      const html = `<img src="${dataUrl}" alt="ritual card" />`;
      payloadVariants.push({
        "image/png": candidate,
        "text/html": html,
        "text/plain": dataUrl
      });
      payloadVariants.push({
        "image/png": Promise.resolve(candidate),
        "text/html": html,
        "text/plain": dataUrl
      });
    }
  }

  let lastError = null;
  for (const payload of payloadVariants) {
    try {
      const item = new ClipboardItem(payload);
      await navigator.clipboard.write([item]);
      return true;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.error("Modern clipboard write failed:", lastError);
  }
  return false;
}

function legacyCopyImageFromDataUrl(dataUrl) {
  if (!dataUrl) return Promise.resolve(false);
  if (!document.queryCommandSupported || !document.queryCommandSupported("copy")) {
    return Promise.resolve(false);
  }

  return new Promise(resolve => {
    const img = new Image();
    img.decoding = "async";
    img.src = dataUrl;

    const cleanup = container => {
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
      if (container && container.parentNode) container.parentNode.removeChild(container);
    };

    img.onload = () => {
      const container = document.createElement("div");
      container.contentEditable = "true";
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";

      const wrapper = document.createElement("div");
      wrapper.appendChild(img);
      container.appendChild(wrapper);
      container.setAttribute("tabindex", "-1");
      document.body.appendChild(container);
      try {
        container.focus({ preventScroll: true });
      } catch (error) {
        console.debug("Legacy container focus failed:", error);
      }

      const selection = window.getSelection();
      if (!selection) {
        cleanup(container);
        resolve(false);
        return;
      }

      const range = document.createRange();
      try {
        range.selectNode(wrapper.firstChild);
      } catch (error) {
        console.error("Legacy range selection failed:", error);
        cleanup(container);
        resolve(false);
        return;
      }

      selection.removeAllRanges();
      selection.addRange(range);

      let succeeded = false;
      try {
        succeeded = document.execCommand("copy");
      } catch (error) {
        console.error("Legacy execCommand copy failed:", error);
        succeeded = false;
      }

      cleanup(container);
      resolve(succeeded);
    };

    img.onerror = () => resolve(false);
  });
}

async function copyImageToClipboard(blob, dataUrl) {
  if (await attemptModernClipboardCopy(blob, dataUrl)) return true;
  const legacyResult = await legacyCopyImageFromDataUrl(dataUrl);
  return legacyResult;
}

async function renderResultToClipboardBlob(renderResult) {
  if (!renderResult) throw new Error("Missing render result");

  if (renderResult.blob) {
    const png = await toPngBlob(renderResult.blob);
    if (png) return png;
  }

  if (renderResult.dataUrl) {
    const dataBlob = await dataUrlToBlob(renderResult.dataUrl);
    const png = await toPngBlob(dataBlob);
    if (png) return png;
  }

  throw new Error("Unable to create clipboard blob");
}

async function generateClipboardAsset() {
  const renderResult = await renderCardImage();
  const pngBlob = await renderResultToClipboardBlob(renderResult);
  const dataUrl = renderResult.dataUrl || await blobToDataUrl(pngBlob);

  return {
    renderResult,
    pngBlob,
    dataUrl
  };
}

// --- Copy card to clipboard ---
async function copyCardToClipboard() {
  const summon = document.querySelector(".copy-summon");

  if (copyHint) {
    copyHint.textContent = copyHintDefaultText;
    copyHint.style.color = copyHintDefaultColor;
    copyHint.style.opacity = "0";
  }
  if (summon) summon.style.opacity = "0";
  if (copyFeedback) copyFeedback.style.opacity = "0";

  let copySucceeded = false;
  let cleanup;
  let asset = null;
  let assetError = null;

  const assetPromise = (async () => {
    const prepared = await generateClipboardAsset();
    return prepared;
  })();

  if (isModernImageClipboardAvailable()) {
    try {
      const clipboardItem = new ClipboardItem({
        "image/png": assetPromise.then(prepared => prepared.pngBlob),
        "text/plain": assetPromise.then(prepared => prepared.dataUrl),
        "text/html": assetPromise.then(prepared => `<img src="${prepared.dataUrl}" alt="ritual card" />`)
      });
      await navigator.clipboard.write([clipboardItem]);
      copySucceeded = true;
    } catch (error) {
      console.error("Immediate clipboard write failed:", error);
    }
  }

  try {
    asset = await assetPromise;
    cleanup = asset.renderResult.cleanup;
  } catch (error) {
    assetError = error;
    console.error("Failed generating clipboard asset:", error);
  }

  if (!copySucceeded && asset) {
    try {
      copySucceeded = await copyImageToClipboard(asset.pngBlob, asset.dataUrl);
    } catch (error) {
      console.error("Clipboard fallback copy failed:", error);
    }
  }

  const shareSupported = typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    typeof File === "function";

  if (!copySucceeded && iosDevice && asset && shareSupported) {
    try {
      const shareFile = new File([asset.pngBlob], "ritual-card.png", { type: "image/png" });
      let canShareFile = false;
      try {
        canShareFile = navigator.canShare({ files: [shareFile] });
      } catch (error) {
        console.error("Share capability check failed:", error);
      }

      if (canShareFile) {
        await navigator.share({
          files: [shareFile],
          title: "Ritual Card",
          text: "Your ritual card is ready."
        });
        copySucceeded = true;
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share fallback failed:", error);
      }
    }
  }

  if (cleanup) cleanup();

  if (!copySucceeded) {
    if (copyHint) {
      const message = assetError ? "render failed" : "copy failed";
      copyHint.textContent = message;
      copyHint.style.color = "#F87171";
      copyHint.style.opacity = "1";
    }
    if (copyFeedback) copyFeedback.style.opacity = "0";
    return;
  }

  cardElement.classList.add("summoning");
  if (summon) summon.style.opacity = "1";

  setTimeout(() => {
    if (summon) summon.style.opacity = "0";
    cardElement.classList.remove("summoning");

    cardElement.classList.add("copied");

    if (copyHint) {
      copyHint.textContent = "copied";
      copyHint.style.color = "#8AF2B8";
      copyHint.style.opacity = "1";
    }

    setTimeout(() => {
      cardElement.classList.remove("copied");
      if (copyFeedback) copyFeedback.style.opacity = "0";
      if (copyHint) {
        copyHint.textContent = copyHintDefaultText;
        copyHint.style.color = copyHintDefaultColor;
        copyHint.style.opacity = "1";
      }
    }, 800);
  }, 2000);
}

if (cardElement) {
  cardElement.addEventListener("click", copyCardToClipboard);
  cardElement.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      copyCardToClipboard();
    }
  });
}

if (copyCardBtn) {
  if (iosDevice) {
    copyCardBtn.classList.remove("hidden");
    copyCardBtn.classList.add("inline-flex");
  }

  copyCardBtn.addEventListener("click", event => {
    event.preventDefault();
    copyCardToClipboard();
  });
}

// --- Tweet button ---
document.getElementById("pledgeBtn").addEventListener("click", () => {
  const tweetText = encodeURIComponent(
`i have taken the pledge. the ritual grows stronger🕯️

take yours on https://nafyn.github.io/ritual-communitycard/`
  );
  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
});

// --- Create the summoning label if missing ---
const summonClass = "copy-summon absolute bottom-[38px] right-[38px] text-xs font-medium text-[#8AF2B8] opacity-0 pointer-events-none";
const summonMessage = "summoning… ✧⟡";

let copySummon = document.querySelector(".copy-summon");
if (!copySummon) {
  copySummon = document.createElement("span");
  cardElement.appendChild(copySummon);
}

copySummon.className = summonClass;
copySummon.textContent = summonMessage;

update();






