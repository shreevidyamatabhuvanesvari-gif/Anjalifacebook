const fileInput = document.getElementById("fileInput");
const textInput = document.getElementById("textInput");
const img = document.getElementById("img");
const textBox = document.getElementById("textBox");
const playBtn = document.getElementById("playBtn");

const femaleBtn = document.getElementById("femaleBtn");
const maleBtn = document.getElementById("maleBtn");
const autoBtn = document.getElementById("autoBtn");

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

// ===== COLORS =====
const colors = ["#ff4d4d","#ffd633","#66ff66","#66ccff","#ff66cc","#ffffff"];

// ===== VOICE MODE =====
let voiceMode = "female";

femaleBtn.onclick = () => voiceMode = "female";
maleBtn.onclick = () => voiceMode = "male";
autoBtn.onclick = () => voiceMode = "auto";

// ===== MAIN =====
let lines = [];
let index = 0;

playBtn.addEventListener("click", function () {

  const text = textInput.value.trim();
  if (!text) {
    alert("पहले लेख लिखें");
    return;
  }

  fileInput.style.display = "none";
  textInput.style.display = "none";
  playBtn.style.display = "none";

  lines = splitLines(text);
  index = 0;

  speakNext();
});

// ===== SPEAK FUNCTION =====
function speakNext() {

  if (index >= lines.length) return;

  const line = lines[index];

  // 🎨 MULTICOLOR TEXT
  const words = line.split(" ");
  const colored = words.map((w,i)=>{
    return `<span style="color:${colors[i % colors.length]}">${w}</span>`;
  }).join(" ");

  textBox.innerHTML = colored;

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(line);

  let voices = speechSynthesis.getVoices();

  // 🔥 Hindi voices filter (FIXED LOGIC)
  let hindiVoices = voices.filter(v => v.lang.includes("hi"));

  // fallback
  if (hindiVoices.length === 0) {
    hindiVoices = voices;
  }

  let selectedVoice;

  if (voiceMode === "female") {
    selectedVoice = hindiVoices[0];
  } 
  else if (voiceMode === "male") {
    selectedVoice = hindiVoices[1] || hindiVoices[0];
  } 
  else if (voiceMode === "auto") {
    selectedVoice = hindiVoices[index % hindiVoices.length];
  }

  if (selectedVoice) speech.voice = selectedVoice;

  speech.lang = "hi-IN";
  speech.rate = 0.95;
  speech.pitch = 1;

  speech.onend = () => {
    index++;
    setTimeout(speakNext, 600);
  };

  speechSynthesis.speak(speech);
}
