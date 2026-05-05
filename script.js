const fileInput = document.getElementById("fileInput");
const textInput = document.getElementById("textInput");
const img = document.getElementById("img");
const textBox = document.getElementById("textBox");
const playBtn = document.getElementById("playBtn");

// ===== IMAGE LOAD =====
fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  img.src = url;
  img.style.display = "block";
});

// ===== TEXT SPLIT =====
function splitLines(text) {
  return text
    .split(/\n|[।.!?]/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
}

// ===== FULLSCREEN =====
function openFullscreen() {
  const el = document.querySelector(".preview");

  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
}

// ===== COLORS =====
const colors = [
  "#ff4d4d",
  "#ffd633",
  "#66ff66",
  "#66ccff",
  "#ff66cc",
  "#ffffff"
];

// ===== MAIN =====
let lines = [];
let index = 0;

playBtn.addEventListener("click", function () {

  const text = textInput.value.trim();
  if (!text) {
    alert("पहले लेख लिखें");
    return;
  }

  // UI hide
  fileInput.style.display = "none";
  textInput.style.display = "none";
  playBtn.style.display = "none";

  openFullscreen();

  lines = splitLines(text);
  index = 0;

  speakNext();
});

// ===== SPEAK FUNCTION =====
function speakNext() {

  if (index >= lines.length) return;

  const line = lines[index];

  // 🎨 MULTICOLOR TEXT (FIXED)
  const words = line.split(" ");

  const colored = words.map((w, i) => {
    const color = colors[i % colors.length];
    return `<span style="color:${color}">${w}</span>`;
  }).join(" ");

  textBox.innerHTML = colored;

  // ===== TTS =====
  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(line);

  let voices = speechSynthesis.getVoices();

  // Voice fallback (mobile fix)
  if (!voices.length) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      setVoiceAndSpeak();
    };
  } else {
    setVoiceAndSpeak();
  }

  function setVoiceAndSpeak() {
    const v = voices.find(v => v.lang.includes("hi")) || voices[0];
    if (v) speech.voice = v;

    speech.lang = "hi-IN";
    speech.rate = 0.95;
    speech.pitch = 1.1;

    speech.onend = () => {
      index++;
      setTimeout(speakNext, 600);
    };

    speechSynthesis.speak(speech);
  }
}
