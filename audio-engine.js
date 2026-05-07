// ===== CLEAN AUDIO ENGINE =====

// ✅ GLOBAL AUDIO
let reelAudioContext;
let reelDestination;

let masterGain;

let silentOscillator;
let silentGain;

let audioStarted = false;

// ===== INIT AUDIO =====
function initAudioEngine() {

  if (audioStarted) return;

  // ===== AUDIO CONTEXT =====
  reelAudioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

  // ===== DESTINATION =====
  reelDestination =
    reelAudioContext
      .createMediaStreamDestination();

  // ===== MASTER GAIN =====
  masterGain =
    reelAudioContext
      .createGain();

  masterGain.gain.value =
    1;

  // ===== CONNECT =====
  masterGain.connect(
    reelDestination
  );

  audioStarted = true;
}

// ===== CREATE CLEAN AUDIO TRACK =====
function createSilentAudioTrack() {

  // ===== SILENT OSCILLATOR =====
  silentOscillator =
    reelAudioContext
      .createOscillator();

  // ===== CLEAN SINE =====
  silentOscillator.type =
    "sine";

  // ===== SAFE FREQUENCY =====
  silentOscillator.frequency.value =
    440;

  // ===== SILENT GAIN =====
  silentGain =
    reelAudioContext
      .createGain();

  // 🔥 VERY LOW
  silentGain.gain.value =
    0.0001;

  // ===== CONNECT =====
  silentOscillator.connect(
    silentGain
  );

  silentGain.connect(
    masterGain
  );

  // ===== START =====
  silentOscillator.start();
}

// ===== START AUDIO =====
function startAudioEngine() {

  if (audioStarted) return;

  initAudioEngine();

  createSilentAudioTrack();
}

// ===== STOP AUDIO =====
function stopAudioEngine() {

  try {

    audioStarted = false;

    if (silentOscillator) {

      silentOscillator.stop();

      silentOscillator.disconnect();
    }

    if (silentGain) {

      silentGain.disconnect();
    }

    if (masterGain) {

      masterGain.disconnect();
    }

  } catch (e) {

    console.log(e);
  }
}

// ===== GET STREAM =====
function getAudioStream() {

  if (!reelDestination)
    return null;

  return reelDestination.stream;
}
