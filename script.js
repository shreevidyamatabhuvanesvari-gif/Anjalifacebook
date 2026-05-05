const fileInput = document.getElementById("fileInput");
const textInput = document.getElementById("textInput");
const img = document.getElementById("img");
const textBox = document.getElementById("textBox");
const playBtn = document.getElementById("playBtn");

const voiceToggle = document.getElementById("voiceToggle");
const voiceOptions = document.getElementById("voiceOptions");

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

// ===== VOICE MENU =====
voiceToggle.onclick = () => {
  voiceOptions.style.display =
    voiceOptions.style.display === "none" ? "block" : "none";
};

function setVoice(type) {
  voiceMode = type;
  voiceOptions.style.display = "none";
}

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
  document.querySelector(".voice-controls").style.display = "none";

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

  // ===== HINDI VOICES =====
  let hindiVoices = voices.filter(v => v.lang.includes("hi"));
  if (hindiVoices.length === 0) hindiVoices = voices;

  // ===== IMPROVED DETECTION =====
  let femaleVoice = hindiVoices.find(v =>
    v.name.toLowerCase().includes("female") ||
    v.name.toLowerCase().includes("google हिन्दी") ||
    v.name.toLowerCase().includes("hindi")
  );

  let maleVoice = hindiVoices.find(v =>
    v.name.toLowerCase().includes("male") ||
    v.name.toLowerCase().includes("india") ||
    v.name.toLowerCase().includes("en-in")
  );

  // fallback
  if (!femaleVoice) femaleVoice = hindiVoices[0];
  if (!maleVoice) maleVoice = hindiVoices[1] || hindiVoices[0];

  let selectedVoice;

  // ===== FINAL VOICE APPLY =====
  if (voiceMode === "female") {
    selectedVoice = femaleVoice;
    speech.pitch = 1.25;   // soft & clear
    speech.rate = 1;
  } 
  else if (voiceMode === "male") {
  selectedVoice = hindiVoices.find(v => 
    v.name.toLowerCase().includes("male") ||
    v.name.toLowerCase().includes("india") ||
    v.name.toLowerCase().includes("hi-in")
  ) || hindiVoices[0];

  speech.pitch = 0.4;   // 🔥 deeper
  speech.rate = 0.75;     // 🔥 slower = smooth
}
  else {
    selectedVoice = index % 2 === 0 ? femaleVoice : maleVoice;
    speech.pitch = index % 2 === 0 ? 1.25 : 0.55;
    speech.rate = 0.9;
  }

  if (selectedVoice) speech.voice = selectedVoice;

  speech.lang = "hi-IN";

  speech.onend = () => {
    index++;
    setTimeout(speakNext, 600);
  };

  speechSynthesis.speak(speech);
}
