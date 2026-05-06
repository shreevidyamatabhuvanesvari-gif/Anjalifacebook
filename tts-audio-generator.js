// ===== TTS AUDIO GENERATOR =====

// ✅ GLOBALS
let ttsAudioContext;
let ttsDestination;

let ttsOscillator;
let ttsGain;

let ttsStarted = false;

// ===== INIT =====
function initTTSAudio() {

  if (ttsStarted) return;

  // ✅ AUDIO CONTEXT
  ttsAudioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

  // ✅ DESTINATION STREAM
  ttsDestination =
    ttsAudioContext
      .createMediaStreamDestination();

  ttsStarted = true;
}

// ===== CREATE SIMPLE VOICE =====
function createTTSTone() {

  // ✅ OSCILLATOR
  ttsOscillator =
    ttsAudioContext
      .createOscillator();

  // ✅ GAIN
  ttsGain =
    ttsAudioContext
      .createGain();

  // ===== VOICE STYLE =====
  ttsOscillator.type =
    "triangle";

  // 🔥 HUMAN MALE BASE
  ttsOscillator.frequency.value =
    120;

  // ===== VOLUME =====
  ttsGain.gain.value =
    0.025;

  // ===== CONNECT =====
  ttsOscillator.connect(
    ttsGain
  );

  ttsGain.connect(
    ttsDestination
  );

  // ===== START =====
  ttsOscillator.start();

  // ===== NATURAL MODULATION =====
  setInterval(() => {

    if (!ttsStarted) return;

    const randomFreq =
      118 +
      Math.random() * 8;

    ttsOscillator.frequency
      .setValueAtTime(
        randomFreq,
        ttsAudioContext.currentTime
      );

  }, 120);
}

// ===== START TTS =====
function startTTSAudio() {

  if (!ttsStarted) {

    initTTSAudio();

    createTTSTone();
  }
}

// ===== STOP TTS =====
function stopTTSAudio() {

  try {

    ttsStarted = false;

    if (ttsOscillator) {

      ttsOscillator.stop();

      ttsOscillator.disconnect();
    }

    if (ttsGain) {

      ttsGain.disconnect();
    }

  } catch (e) {

    console.log(e);
  }
}

// ===== GET STREAM =====
function getTTSAudioStream() {

  if (!ttsDestination)
    return null;

  return ttsDestination.stream;
}
