const fileInput =
  document.getElementById(
    "fileInput"
  );

const textInput =
  document.getElementById(
    "textInput"
  );

const img =
  document.getElementById(
    "img"
  );

const textBox =
  document.getElementById(
    "textBox"
  );

const playBtn =
  document.getElementById(
    "playBtn"
  );

const voiceToggle =
  document.getElementById(
    "voiceToggle"
  );

const voiceOptions =
  document.getElementById(
    "voiceOptions"
  );

const restartBtn =
  document.getElementById(
    "restartBtn"
  );

const watermark =
  document.getElementById(
    "watermark"
  );

const userName =
  document.getElementById(
    "userName"
  );

const downloadBtn =
  document.getElementById(
    "downloadBtn"
  );

const reelCanvas =
  document.getElementById(
    "reelCanvas"
  );

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

    img.onload = () => {

      img.style.display =
        "block";
    };
  }
);

// ===== SPLIT LINES =====
function splitLines(text) {

  return text
    .split(/\n|[।!?]/)
    .map(line => line.trim())
    .filter(
      line => line.length > 0
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
let voiceMode =
  "female";

// ===== FLAGS =====
let lines = [];

let index = 0;

let speaking = false;

let playing = false;

// ===== MENU =====
voiceToggle.onclick = () => {

  voiceOptions.style.display =
    voiceOptions.style.display ===
    "none"
      ? "block"
      : "none";
};

// ===== SET VOICE =====
function setVoice(type) {

  voiceMode = type;

  voiceOptions.style.display =
    "none";
}

// ===== START RECORDING =====
async function startRecording() {

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

    // ===== BLOCK DOUBLE PLAY =====
    if (playing) return;

    playing = true;

    const text =
      textInput.value.trim();

    if (!text) {

      alert(
        "पहले लेख लिखें"
      );

      playing = false;

      return;
    }

    // ===== IMAGE CHECK =====
    if (!img.src) {

      alert(
        "पहले फोटो चुनें"
      );

      playing = false;

      return;
    }

    // ===== WATERMARK =====
    watermark.innerText =
      userName.value
        ? "© " +
          userName.value
        : "";

    // ===== HIDE UI =====
    fileInput.style.display =
      "none";

    textInput.style.display =
      "none";

    userName.style.display =
      "none";

    playBtn.style.display =
      "none";

    document.querySelector(
      ".voice-controls"
    ).style.display =
      "none";

    // ===== SPLIT =====
    lines =
      splitLines(text);

    index = 0;

    // ===== START CANVAS =====
    if (
      typeof startTalkingEffect ===
      "function"
    ) {

      startTalkingEffect();
    }

    // ===== START RECORDING =====
    await startRecording();

    // ===== WAIT =====
    setTimeout(() => {

      speakNext();

    }, 1000);
  }
);

// ===== DOWNLOAD =====
downloadBtn.addEventListener(
  "click",
  function () {

    speechSynthesis.cancel();

    speaking = false;

    playing = false;

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

    speechSynthesis.cancel();

    speaking = false;

    index = 0;

    setTimeout(() => {

      speakNext();

    }, 600);
  }
);

// ===== SPEAK NEXT =====
function speakNext() {

  // ===== END =====
  if (
    index >= lines.length
  ) {

    speaking = false;

    playing = false;

    // ===== STOP RECORDER =====
    setTimeout(() => {

      if (
        typeof stopCanvasRecording ===
        "function"
      ) {

        stopCanvasRecording();
      }

    }, 1500);

    return;
  }

  const line =
    lines[index];

  // ===== WORDS =====
  const words =
    line.split(" ");

  // ===== MULTICOLOR =====
  const colored =
    words.map((word, i) => {

      return `
      <span style="
      color:
      ${
        colors[
          i %
          colors.length
        ]
      };
      ">
      ${word}
      </span>
      `;

    }).join(" ");

  textBox.innerHTML =
    colored;

  // ===== STOP OLD =====
  speechSynthesis.cancel();

  // ===== CREATE =====
  const speech =
    new SpeechSynthesisUtterance(
      line
    );

  // ===== GET VOICES =====
  let voices =
    speechSynthesis.getVoices();

  // ===== WAIT VOICES =====
  if (
    voices.length === 0
  ) {

    setTimeout(() => {

      speakNext();

    }, 500);

    return;
  }

  // ===== HINDI =====
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
    hindiVoices.find(v =>

      v.name
        .toLowerCase()
        .includes("female")
    ) ||
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
        .includes("ravi")
    );

  if (!maleVoice) {

    maleVoice =
      hindiVoices[1] ||
      hindiVoices[0];
  }

  // ===== FEMALE =====
  if (
    voiceMode ===
    "female"
  ) {

    speech.voice =
      femaleVoice;

    speech.pitch =
      1.1;

    speech.rate =
      0.96;
  }

  // ===== MALE =====
  else if (
    voiceMode ===
    "male"
  ) {

    speech.voice =
      maleVoice;

    speech.pitch =
      0.72;

    speech.rate =
      0.86;
  }

  // ===== AUTO =====
  else {

    speech.voice =
      index % 2 === 0
        ? femaleVoice
        : maleVoice;

    speech.pitch =
      index % 2 === 0
        ? 1.1
        : 0.72;

    speech.rate =
      index % 2 === 0
        ? 0.96
        : 0.86;
  }

  // ===== LANGUAGE =====
  speech.lang =
    "hi-IN";

  speech.volume = 1;

  speaking = true;

  // ===== NEXT =====
  speech.onend = () => {

    index++;

    setTimeout(() => {

      speakNext();

    }, 700);
  };

  // ===== ERROR =====
  speech.onerror = () => {

    index++;

    setTimeout(() => {

      speakNext();

    }, 700);
  };

  // ===== SPEAK =====
  speechSynthesis.speak(
    speech
  );
}

// ===== LOAD VOICES =====
speechSynthesis.onvoiceschanged =
  function () {

    speechSynthesis.getVoices();
  };
