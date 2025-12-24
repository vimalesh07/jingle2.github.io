// Simple ID + storage helpers
function createGiftId() {
  return "gift_" + Date.now().toString(36) + "_" +
    Math.random().toString(16).slice(2);
}

function saveGift(id, data) {
  localStorage.setItem(id, JSON.stringify(data));
}

function loadGift(id) {
  const raw = localStorage.getItem(id);
  return raw ? JSON.parse(raw) : null;
}

function getGiftIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  } else {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    document.body.removeChild(t);
  }
}

window.JingleUtils = {
  createGiftId,
  saveGift,
  loadGift,
  getGiftIdFromUrl,
  copyToClipboard
};
