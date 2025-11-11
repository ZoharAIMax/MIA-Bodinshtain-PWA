
const vocabulary = [
  {
    "english": "absorb",
    "hebrew": "לספוג"
  },
  {
    "english": "access",
    "hebrew": "גישה / לגשת"
  },
  {
    "english": "appeal",
    "hebrew": "לפנות / למשוך תשומת לב"
  },
  {
    "english": "agriculture",
    "hebrew": "חקלאות"
  },
  {
    "english": "agenda",
    "hebrew": "סדר יום"
  }
];

let currentIndex = -1;
let order = [];
let knownCount = 0;
let totalSeen = 0;
let mistakes = new Set();

const wordEnEl = document.getElementById("word-en");
const wordHeEl = document.getElementById("word-he");
const startBtn = document.getElementById("startBtn");
const showBtn = document.getElementById("showBtn");
const listenBtn = document.getElementById("listenBtn");
const knewBtn = document.getElementById("knewBtn");
const didntBtn = document.getElementById("didntBtn");
const restartBtn = document.getElementById("restartBtn");
const mistakesModeCheckbox = document.getElementById("mistakesMode");
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");

function shuffleIndices(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resetSession(useMistakesOnly = false) {
  if (useMistakesOnly && mistakes.size > 0) {
    order = Array.from(mistakes);
  } else {
    order = shuffleIndices(vocabulary.length);
  }
  currentIndex = -1;
  knownCount = 0;
  totalSeen = 0;
  updateStats();
  wordEnEl.textContent = "Ready – press “Start” to begin";
  wordHeEl.textContent = "—";
  wordHeEl.classList.add("hidden");
  listenBtn.disabled = true;
}

function showNextWord() {
  if (order.length === 0) {
    wordEnEl.textContent = "No words loaded.";
    wordHeEl.textContent = "—";
    listenBtn.disabled = true;
    return;
  }
  currentIndex++;
  if (currentIndex >= order.length) {
    wordEnEl.textContent = "Session complete!";
    wordHeEl.textContent = "You can restart or switch modes.";
    wordHeEl.classList.remove("hidden");
    listenBtn.disabled = true;
    return;
  }
  const idx = order[currentIndex];
  const entry = vocabulary[idx];
  wordEnEl.textContent = entry.english;
  wordHeEl.textContent = entry.hebrew;
  wordHeEl.classList.add("hidden");
  totalSeen++;
  listenBtn.disabled = false;
  updateStats();
}

function updateStats() {
  const total = order.length || 0;
  progressText.textContent = total ? `${Math.min(totalSeen, total)} / ${total}` : "0 / 0";
  const score = totalSeen > 0 ? Math.round((knownCount / totalSeen) * 100) : 0;
  scoreText.textContent = `${score}%`;
}

// פונקציית השמעה באמצעות Web Speech API
function speakCurrentWord() {
  if (!("speechSynthesis" in window)) {
    alert("Speech is not supported in this browser.");
    return;
  }
  if (currentIndex < 0 || currentIndex >= order.length) {
    return;
  }
  const idx = order[currentIndex];
  const text = vocabulary[idx].english;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

startBtn.addEventListener("click", () => {
  resetSession(mistakesModeCheckbox.checked);
  showNextWord();
  startBtn.disabled = true;
  showBtn.disabled = false;
  knewBtn.disabled = false;
  didntBtn.disabled = false;
  restartBtn.disabled = false;
});

showBtn.addEventListener("click", () => {
  wordHeEl.classList.remove("hidden");
});

listenBtn.addEventListener("click", () => {
  speakCurrentWord();
});

knewBtn.addEventListener("click", () => {
  const idx = order[currentIndex];
  mistakes.delete(idx);
  knownCount++;
  updateStats();
  showNextWord();
});

didntBtn.addEventListener("click", () => {
  const idx = order[currentIndex];
  mistakes.add(idx);
  updateStats();
  showNextWord();
});

restartBtn.addEventListener("click", () => {
  resetSession(mistakesModeCheckbox.checked);
  showNextWord();
});

// רישום Service Worker עבור PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      console.log("Service worker registration failed");
    });
  });
}
