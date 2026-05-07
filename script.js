// ======================================
// DOM
// ======================================

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

// ======================================
// COLORS
// ======================================

const colors = [
  "#ff4d4d",
  "#ffd633",
  "#66ff66",
  "#66ccff",
  "#ff66cc",
  "#ffffff"
];

// ======================================
// DATA
// ======================================

let uploadedImages = [];

let photoArticles = [];

let currentPhotoIndex = 0;

let currentLineIndex = 0;

let currentLines = [];

let voiceMode = "female";

let isPlaying = false;

let activeSpeech = null;

// ======================================
// IMAGE LOAD
// ======================================

fileInput.addEventListener(
  "change",
  function () {

    uploadedImages = [];

    const files =
      Array.from(
        fileInput.files
      );

    if (
      files.length === 0
    ) {

      return;
    }

    files.forEach(file => {

      const url =
        URL.createObjectURL(
          file
        );

      uploadedImages.push(
        url
      );
    });

    img.src =
      uploadedImages[0];

    img.onload = () => {

      img.style.display =
        "block";
    };
  }
);

// ======================================
// VOICE MENU
// ======================================

voiceToggle.onclick = () => {

  voiceOptions.style.display =

    voiceOptions.style.display ===
    "none"

      ? "block"

      : "none";
};

// ======================================
// SET VOICE
// ======================================

function setVoice(type) {

  voiceMode = type;

  voiceOptions.style.display =
    "none";
}

// ======================================
// SPLIT ARTICLES
// ======================================

function parsePhotoArticles(
  text
) {

  return text
    .split("===PHOTO===")
    .map(item => item.trim())
    .filter(
      item => item.length > 0
    );
}

// ======================================
// SPLIT LINES
// ======================================

function splitLines(text) {

  return text

    .split(/\n|[।.!?]/)

    .map(line => line.trim())

    .filter(
      line => line.length > 0
    );
}

// ======================================
// START RECORDING
// ======================================

async function startRecording() {

  if (
    typeof startCanvasRecording ===
    "function"
  ) {

    await startCanvasRecording();
  }
}

// ======================================
// PLAY
// ======================================

playBtn.addEventListener(
  "click",

  async function () {

    if (isPlaying)
      return;

    // ==========================
    // VALIDATION
    // ==========================

    if (
      uploadedImages.length === 0
    ) {

      alert(
        "पहले फोटो चुनें"
      );

      return;
    }

    const fullText =
      textInput.value.trim();

    if (!fullText) {

      alert(
        "पहले लेख लिखें"
      );

      return;
    }

    // ==========================
    // PARSE ARTICLES
    // ==========================

    photoArticles =
      parsePhotoArticles(
        fullText
      );

    // ==========================
    // MATCH CHECK
    // ==========================

    if (
      photoArticles.length !==
      uploadedImages.length
    ) {

      alert(
        "जितनी फोटो हैं उतने ही ===PHOTO=== section रखें"
      );

      return;
    }

    // ==========================
    // PLAY LOCK
    // ==========================

    isPlaying = true;

    // ==========================
    // WATERMARK
    // ==========================

    watermark.innerText =

      userName.value

        ? "© " +
          userName.value

        : "";

    // ==========================
    // HIDE UI
    // ==========================

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

    // ==========================
    // RESET
    // ==========================

    currentPhotoIndex = 0;

    currentLineIndex = 0;

    // ==========================
    // START CANVAS
    // ==========================

    if (
      typeof startTalkingEffect ===
      "function"
    ) {

      startTalkingEffect();
    }

    // ==========================
    // START RECORDING
    // ==========================

    await startRecording();

    // ==========================
    // START FLOW
    // ==========================

    setTimeout(() => {

      loadCurrentPhoto();

    }, 1000);
  }
);

// ======================================
// LOAD CURRENT PHOTO
// ======================================

function loadCurrentPhoto() {

  // ==========================
  // END
  // ==========================

  if (
    currentPhotoIndex >=
    uploadedImages.length
  ) {

    finishVideo();

    return;
  }

  // ==========================
  // IMAGE
  // ==========================

  img.src =
    uploadedImages[
      currentPhotoIndex
    ];

  // ==========================
  // ARTICLE
  // ==========================

  currentLines =
    splitLines(
      photoArticles[
        currentPhotoIndex
      ]
    );

  currentLineIndex = 0;

  // ==========================
  // START SPEECH
  // ==========================

  setTimeout(() => {

    speakCurrentLine();

  }, 1200);
}

// ======================================
// SPEAK CURRENT LINE
// ======================================

function speakCurrentLine() {

  // ==========================
  // NEXT PHOTO
  // ==========================

  if (
    currentLineIndex >=
    currentLines.length
  ) {

    currentPhotoIndex++;

    setTimeout(() => {

      loadCurrentPhoto();

    }, 1200);

    return;
  }

  // ==========================
  // LINE
  // ==========================

  const line =
    currentLines[
      currentLineIndex
    ];

  // ==========================
  // MULTICOLOR
  // ==========================

  renderColoredText(line);

  // ==========================
  // CANCEL OLD
  // ==========================

  speechSynthesis.cancel();

  // ==========================
  // CREATE SPEECH
  // ==========================

  const speech =
    new SpeechSynthesisUtterance(
      line
    );

  activeSpeech = speech;

  // ==========================
  // VOICES
  // ==========================

  const voices =
    speechSynthesis.getVoices();

  let hindiVoices =
    voices.filter(v =>

      v.lang.includes("hi")
    );

  if (
    hindiVoices.length === 0
  ) {

    hindiVoices = voices;
  }

  // ==========================
  // FEMALE
  // ==========================

  const femaleVoice =

    hindiVoices.find(v =>

      v.name
        .toLowerCase()
        .includes("female")
    )

    ||

    hindiVoices[0];

  // ==========================
  // MALE
  // ==========================

  let maleVoice =

    voices.find(v =>

      v.name
        .toLowerCase()
        .includes("male")

      ||

      v.name
        .toLowerCase()
        .includes("david")

      ||

      v.name
        .toLowerCase()
        .includes("ravi")
    );

  if (!maleVoice) {

    maleVoice =

      hindiVoices[1]

      ||

      hindiVoices[0];
  }

  // ==========================
  // APPLY VOICE
  // ==========================

  if (
    voiceMode ===
    "female"
  ) {

    speech.voice =
      femaleVoice;

    speech.pitch = 1.05;

    speech.rate = 0.92;
  }

  else if (
    voiceMode ===
    "male"
  ) {

    speech.voice =
      maleVoice;

    speech.pitch = 0.72;

    speech.rate = 0.84;
  }

  else {

    speech.voice =

      currentLineIndex % 2 === 0

        ? femaleVoice

        : maleVoice;

    speech.pitch =

      currentLineIndex % 2 === 0

        ? 1.05

        : 0.72;

    speech.rate =

      currentLineIndex % 2 === 0

        ? 0.92

        : 0.84;
  }

  // ==========================
  // LANG
  // ==========================

  speech.lang = "hi-IN";

  speech.volume = 1;

  // ==========================
  // ON END
  // ==========================

  speech.onend = () => {

    currentLineIndex++;

    setTimeout(() => {

      speakCurrentLine();

    }, 700);
  };

  // ==========================
  // ERROR
  // ==========================

  speech.onerror = () => {

    currentLineIndex++;

    setTimeout(() => {

      speakCurrentLine();

    }, 700);
  };

  // ==========================
  // SPEAK
  // ==========================

  speechSynthesis.speak(
    speech
  );
}

// ======================================
// RENDER MULTICOLOR TEXT
// ======================================

function renderColoredText(
  line
) {

  const words =
    line.split(" ");

  const colored =
    words.map((word, i) => {

      return `
      <span
      style="
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
}

// ======================================
// FINISH VIDEO
// ======================================

function finishVideo() {

  speechSynthesis.cancel();

  isPlaying = false;

  setTimeout(() => {

    if (
      typeof stopCanvasRecording ===
      "function"
    ) {

      stopCanvasRecording();
    }

  }, 1800);
}

// ======================================
// DOWNLOAD BUTTON
// ======================================

downloadBtn.addEventListener(
  "click",

  function () {

    speechSynthesis.cancel();

    isPlaying = false;

    if (
      typeof stopCanvasRecording ===
      "function"
    ) {

      stopCanvasRecording();
    }
  }
);

// ======================================
// RESTART
// ======================================

restartBtn.addEventListener(
  "click",

  function () {

    speechSynthesis.cancel();

    isPlaying = false;

    currentPhotoIndex = 0;

    currentLineIndex = 0;

    setTimeout(() => {

      playBtn.click();

    }, 800);
  }
);

// ======================================
// LOAD VOICES
// ======================================

speechSynthesis.onvoiceschanged =
  function () {

    speechSynthesis.getVoices();
  };
