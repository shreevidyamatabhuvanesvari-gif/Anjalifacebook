const fileInput = document.getElementById("fileInput");
const textInput = document.getElementById("textInput");
const img = document.getElementById("img");
const textBox = document.getElementById("textBox");
const playBtn = document.getElementById("playBtn");

const voiceToggle = document.getElementById("voiceToggle");
const voiceOptions = document.getElementById("voiceOptions");

// ✅ NEW
const restartBtn = document.getElementById("restartBtn");
const watermark = document.getElementById("watermark");
const userName = document.getElementById("userName");

// ✅ DOWNLOAD
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");

// ✅ CANVAS
const reelCanvas =
  document.getElementById("reelCanvas");

let mediaRecorder;
let recordedChunks = [];

// ===== IMAGE LOAD =====
fileInput.addEventListener(
  "change",
  function () {

    const file =
      fileInput.files[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    img.src = url;

    img.style.display =
      "block";
  }
);

// ===== TEXT SPLIT =====
function splitLines(text) {

  return text
    .split(/\n|[।.!?]/)
    .map(l => l.trim())
    .filter(
      l => l.length > 0
    );
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

// ===== VOICE MODE =====
let voiceMode = "female";

// ===== VOICE MENU =====
voiceToggle.onclick = () => {

  voiceOptions.style.display =
    voiceOptions.style.display ===
    "none"
      ? "block"
      : "none";
};

function setVoice(type) {

  voiceMode = type;

  voiceOptions.style.display =
    "none";
}

// ===== MAIN =====
let lines = [];
let index = 0;

// ===== START RECORDING =====
async function startRecording() {

  // ✅ START AUDIO ENGINE
  if (
    typeof startAudioEngine ===
    "function"
  ) {

    startAudioEngine();
  }

  // ✅ START CANVAS RECORDER
  if (
    typeof startCanvasRecording ===
    "function"
  ) {

    startCanvasRecording();
  }
}

// ===== PLAY =====
playBtn.addEventListener(
  "click",
  async function () {

    const text =
      textInput.value.trim();

    if (!text) {

      alert("पहले लेख लिखें");

      return;
    }

    // ✅ WATERMARK
    watermark.innerText =
      userName.value
        ? "© " + userName.value
        : "";

    // ✅ HIDE UI
    fileInput.style.display =
      "none";

    textInput.style.display =
      "none";

    playBtn.style.display =
      "none";

    document.querySelector(
      ".voice-controls"
    ).style.display = "none";

    // ===== SPLIT LINES =====
    lines = splitLines(text);

    index = 0;

    // ✅ START TALKING EFFECT
    if (
      typeof startTalkingEffect ===
      "function"
    ) {

      startTalkingEffect();
    }

    // ✅ START RECORDING
    await startRecording();

    // ✅ START SPEECH
    speakNext();
  }
);

// ===== DOWNLOAD BUTTON =====
downloadBtn.addEventListener(
  "click",
  function () {

    // ✅ STOP AUDIO
    if (
      typeof stopAudioEngine ===
      "function"
    ) {

      stopAudioEngine();
    }

    // ✅ STOP RECORDING
    if (
      typeof stopCanvasRecording ===
      "function"
    ) {

      stopCanvasRecording();
    }
  }
);

// ===== RESTART =====
restartBtn.addEventListener(
  "click",
  function () {

    // ✅ STOP SPEECH
    speechSynthesis.cancel();

    // ✅ RESET
    index = 0;

    // ✅ RESTART AUDIO
    if (
      typeof stopAudioEngine ===
      "function"
    ) {

      stopAudioEngine();
    }

    if (
      typeof startAudioEngine ===
      "function"
    ) {

      startAudioEngine();
    }

    // ✅ START AGAIN
    speakNext();
  }
);

// ===== SPEAK FUNCTION =====
function speakNext() {

  // ===== END =====
  if (index >= lines.length) {

    // ✅ STOP AUDIO ENGINE
    if (
      typeof stopAudioEngine ===
      "function"
    ) {

      stopAudioEngine();
    }

    // ✅ STOP RECORDING
    if (
      typeof stopCanvasRecording ===
      "function"
    ) {

      stopCanvasRecording();
    }

    return;
  }

  const line =
    lines[index];

  // ===== MULTICOLOR TEXT =====
  const words =
    line.split(" ");

  const colored =
    words.map((w, i) => {

      return `
        <span
        style="
        color:${colors[
          i % colors.length
        ]}">
        ${w}
        </span>
      `;

    }).join(" ");

  textBox.innerHTML =
    colored;

  // ===== CANCEL OLD =====
  speechSynthesis.cancel();

  // ===== SPEECH =====
  const speech =
    new SpeechSynthesisUtterance(
      line
    );

  let voices =
    speechSynthesis.getVoices();

  // ===== FILTER =====
  let hindiVoices =
    voices.filter(v =>
      v.lang.includes("hi")
    );

  if (
    hindiVoices.length === 0
  ) {

    hindiVoices = voices;
  }

  // ===== FEMALE =====
  let femaleVoice =
    hindiVoices[0];

  // ===== MALE =====
  let maleVoice =
    voices.find(v =>

      v.name
        .toLowerCase()
        .includes("male") ||

      v.name
        .toLowerCase()
        .includes("david") ||

      v.name
        .toLowerCase()
        .includes(
          "google uk english male"
        ) ||

      v.name
        .toLowerCase()
        .includes(
          "microsoft ravi"
        ) ||

      v.name
        .toLowerCase()
        .includes(
          "microsoft heera"
        )
    );

  // ===== FALLBACK =====
  if (!maleVoice) {

    maleVoice =
      voices.find(v =>
        v.lang.includes("hi")
      );
  }

  if (!maleVoice) {

    maleVoice =
      hindiVoices[1] ||
      hindiVoices[0];
  }

  let selectedVoice;

  // ===== FEMALE MODE =====
  if (
    voiceMode === "female"
  ) {

    selectedVoice =
      femaleVoice;

    speech.pitch = 1.12;

    speech.rate = 0.98;

    speech.volume = 1;
  }

  // ===== MALE MODE =====
  else if (
    voiceMode === "male"
  ) {

    selectedVoice =
      maleVoice;

    speech.pitch = 0.72;

    speech.rate = 0.86;

    speech.volume = 1;
  }

  // ===== AUTO MODE =====
  else {

    selectedVoice =
      index % 2 === 0
        ? femaleVoice
        : maleVoice;

    speech.pitch =
      index % 2 === 0
        ? 1.12
        : 0.72;

    speech.rate =
      index % 2 === 0
        ? 0.98
        : 0.86;

    speech.volume = 1;
  }

  // ===== APPLY VOICE =====
  if (selectedVoice) {

    speech.voice =
      selectedVoice;
  }

  speech.lang = "hi-IN";

  // ===== NEXT LINE =====
  speech.onend = () => {

    index++;

    // ✅ NATURAL PAUSE
    setTimeout(
      speakNext,
      850
    );
  };

  // ===== SPEAK =====
  speechSynthesis.speak(
    speech
  );
}
