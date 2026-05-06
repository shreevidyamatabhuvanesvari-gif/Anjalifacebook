// ===== ADVANCED AUDIO ENGINE =====

// ✅ GLOBAL AUDIO
let reelAudioContext;
let reelDestination;

let masterGain;

let bassOscillator;
let formantOscillator;
let airOscillator;

let bassGain;
let formantGain;
let airGain;
let noiseGain;

let voiceLFO;
let voiceLFOGain;

let modulationInterval;

let audioStarted = false;

// ===== INIT AUDIO ENGINE =====
function initAudioEngine() {

  if (audioStarted) return;

  // ✅ AUDIO CONTEXT
  reelAudioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

  // ✅ DESTINATION STREAM
  reelDestination =
    reelAudioContext
      .createMediaStreamDestination();

  // ✅ MASTER GAIN
  masterGain =
    reelAudioContext
      .createGain();

  // 🔥 CLEANER MASTER OUTPUT
  masterGain.gain.value = 0.82;

  // ✅ CONNECT
  masterGain.connect(
    reelDestination
  );

  audioStarted = true;
}

// ===== CREATE ADVANCED HUMAN MALE TONE =====
function createHumanMaleTone() {

  // ===== MAIN BASS =====
  bassOscillator =
    reelAudioContext
      .createOscillator();

  bassOscillator.type =
    "sawtooth";

  // 🔥 DEEPER MALE
  bassOscillator.frequency.value =
    96;

  // ===== FORMANT =====
  formantOscillator =
    reelAudioContext
      .createOscillator();

  formantOscillator.type =
    "triangle";

  formantOscillator.frequency.value =
    190;

  // ===== AIR LAYER =====
  airOscillator =
    reelAudioContext
      .createOscillator();

  airOscillator.type =
    "sine";

  airOscillator.frequency.value =
    320;

  // ===== BASS GAIN =====
  bassGain =
    reelAudioContext
      .createGain();

  bassGain.gain.value =
    0.075;

  // ===== FORMANT GAIN =====
  formantGain =
    reelAudioContext
      .createGain();

  formantGain.gain.value =
    0.04;

  // ===== AIR GAIN =====
  airGain =
    reelAudioContext
      .createGain();

  airGain.gain.value =
    0.012;

  // ===== WHITE NOISE =====
  const bufferSize =
    reelAudioContext.sampleRate * 2;

  const noiseBuffer =
    reelAudioContext
      .createBuffer(
        1,
        bufferSize,
        reelAudioContext.sampleRate
      );

  const output =
    noiseBuffer.getChannelData(0);

  for (
    let i = 0;
    i < bufferSize;
    i++
  ) {

    output[i] =
      (Math.random() * 2 - 1) * 0.022;
  }

  const whiteNoise =
    reelAudioContext
      .createBufferSource();

  whiteNoise.buffer =
    noiseBuffer;

  whiteNoise.loop = true;

  // ===== FILTER =====
  const noiseFilter =
    reelAudioContext
      .createBiquadFilter();

  noiseFilter.type =
    "lowpass";

  noiseFilter.frequency.value =
    1200;

  // ===== NOISE GAIN =====
  noiseGain =
    reelAudioContext
      .createGain();

  noiseGain.gain.value =
    0.010;

  // ===== VOICE LFO =====
  voiceLFO =
    reelAudioContext
      .createOscillator();

  voiceLFO.type =
    "sine";

  voiceLFO.frequency.value =
    4.2;

  voiceLFOGain =
    reelAudioContext
      .createGain();

  // 🔥 NATURAL THROAT MOVEMENT
  voiceLFOGain.gain.value =
    3.5;

  // ===== CONNECT LFO =====
  voiceLFO.connect(
    voiceLFOGain
  );

  voiceLFOGain.connect(
    bassOscillator.frequency
  );

  // ===== CONNECT AUDIO =====
  bassOscillator.connect(
    bassGain
  );

  formantOscillator.connect(
    formantGain
  );

  airOscillator.connect(
    airGain
  );

  whiteNoise.connect(
    noiseFilter
  );

  noiseFilter.connect(
    noiseGain
  );

  bassGain.connect(
    masterGain
  );

  formantGain.connect(
    masterGain
  );

  airGain.connect(
    masterGain
  );

  noiseGain.connect(
    masterGain
  );

  // ===== START =====
  bassOscillator.start();

  formantOscillator.start();

  airOscillator.start();

  whiteNoise.start();

  voiceLFO.start();

  // ===== HUMAN MICRO MODULATION =====
  modulationInterval =
    setInterval(() => {

      if (!audioStarted) return;

      const randomBass =
        94 +
        Math.random() * 6;

      const randomFormant =
        185 +
        Math.random() * 10;

      const randomAir =
        315 +
        Math.random() * 15;

      bassOscillator.frequency
        .setTargetAtTime(
          randomBass,
          reelAudioContext.currentTime,
          0.05
        );

      formantOscillator.frequency
        .setTargetAtTime(
          randomFormant,
          reelAudioContext.currentTime,
          0.05
        );

      airOscillator.frequency
        .setTargetAtTime(
          randomAir,
          reelAudioContext.currentTime,
          0.05
        );

    }, 120);
}

// ===== START AUDIO =====
function startAudioEngine() {

  if (!audioStarted) {

    initAudioEngine();

    createHumanMaleTone();
  }
}

// ===== STOP AUDIO =====
function stopAudioEngine() {

  try {

    audioStarted = false;

    clearInterval(
      modulationInterval
    );

    if (bassOscillator) {

      bassOscillator.stop();
      bassOscillator.disconnect();
    }

    if (formantOscillator) {

      formantOscillator.stop();
      formantOscillator.disconnect();
    }

    if (airOscillator) {

      airOscillator.stop();
      airOscillator.disconnect();
    }

    if (voiceLFO) {

      voiceLFO.stop();
      voiceLFO.disconnect();
    }

    if (masterGain) {

      masterGain.disconnect();
    }

  } catch (e) {

    console.log(e);
  }
}

// ===== GET AUDIO STREAM =====
function getAudioStream() {

  if (!reelDestination)
    return null;

  return reelDestination.stream;
}
