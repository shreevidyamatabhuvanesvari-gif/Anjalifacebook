/*
====================================================
REEL CREATOR PRO
FINAL CINEMATIC STABLE TTS ENGINE
ZERO VOICE CUT VERSION
tts-engine.js
====================================================

Features:

✔ No Voice Cut
✔ Multi Scene Stable
✔ Multi Line Stable
✔ Android Chrome Safe
✔ Queue Safe
✔ Long Text Safe
✔ Smart Chunk Engine
✔ Locked Indian Female Voice
✔ Locked Indian Male Voice
✔ Cinematic Timing
✔ No Random Interruptions
✔ No Speech Overlap
✔ No Hard Cancel During Playback

====================================================
*/

window.TTSEngine = (() => {

  /*
  ====================================================
  INTERNAL STATE
  ====================================================
  */

  const synth =
    window.speechSynthesis;

  let voices = [];

  let initialized =
    false;

  let currentVoiceMode =
    "female";

  /*
  ====================================================
  LOCKED VOICES
  ====================================================
  */

  let lockedFemaleVoice =
    null;

  let lockedMaleVoice =
    null;

  let lockedAutoVoice =
    null;

  /*
  ====================================================
  SPEECH STATE
  ====================================================
  */

  let speaking =
    false;

  let activeSpeech =
    null;

  /*
  ====================================================
  INITIALIZE
  ====================================================
  */

  async function initialize() {

    if (initialized) {

      return;

    }

    await loadVoices();

    lockedFemaleVoice =
      resolveFemaleVoice();

    lockedMaleVoice =
      resolveMaleVoice();

    lockedAutoVoice =
      resolveAutoVoice();

    initialized = true;

    console.log(
      "Stable cinematic TTS initialized."
    );

  }

  /*
  ====================================================
  LOAD VOICES
  ====================================================
  */

  function loadVoices() {

    return new Promise((resolve) => {

      let loaded =
        false;

      function finalize() {

        if (loaded) {

          return;

        }

        voices =
          synth.getVoices();

        if (
          voices.length > 0
        ) {

          loaded = true;

          resolve();

        }

      }

      finalize();

      synth.onvoiceschanged =
        finalize;

      setTimeout(
        finalize,
        1500
      );

    });

  }

  /*
  ====================================================
  MAIN SPEAK
  ====================================================
  */

  async function speak(config) {

    await initialize();

    const originalText =
      sanitizeText(
        config.text || ""
      );

    currentVoiceMode =
      config.voiceMode ||
      "female";

    /*
    ================================================
    EMPTY GUARD
    ================================================
    */

    if (!originalText) {

      return;

    }

    /*
    ================================================
    WAIT FOR PREVIOUS SPEECH
    ================================================
    */

    await waitUntilFree();

    /*
    ================================================
    SPLIT INTO SAFE CHUNKS
    ================================================
    */

    const chunks =
      splitIntoChunks(
        originalText
      );

    /*
    ================================================
    SPEAK CHUNKS SEQUENTIALLY
    ================================================
    */

    for (
      const chunk of chunks
    ) {

      await speakChunk(
        chunk
      );

      /*
      ==============================================
      SAFETY GAP
      ==============================================
      */

      await wait(850);

    }

    /*
    ================================================
    FINAL BUFFER CLEANUP
    ================================================
    */

    await wait(1200);

  }

  /*
  ====================================================
  SPEAK CHUNK
  ====================================================
  */

  async function speakChunk(text) {

    return new Promise((resolve, reject) => {

      /*
      ================================================
      CREATE UTTERANCE
      ================================================
      */

      const speech =
        new SpeechSynthesisUtterance(
          text
        );

      activeSpeech =
        speech;

      speaking =
        true;

      /*
      ================================================
      APPLY SETTINGS
      ================================================
      */

      applyVoiceSettings(
        speech,
        currentVoiceMode
      );

      /*
      ================================================
      SAFETY FLAG
      ================================================
      */

      let completed =
        false;

      /*
      ================================================
      START
      ================================================
      */

      speech.onstart =
        () => {

          console.log(
            "Speaking chunk:",
            text
          );

        };

      /*
      ================================================
      END
      ================================================
      */

      speech.onend =
        () => {

          if (completed) {

            return;

          }

          completed =
            true;

          cleanupSpeech();

          resolve();

        };

      /*
      ================================================
      ERROR
      ================================================
      */

      speech.onerror =
        (event) => {

          /*
          ============================================
          IGNORE INTERRUPTED
          ============================================
          */

          if (
            event.error ===
            "interrupted"
          ) {

            return;

          }

          console.error(
            "TTS Error:",
            event.error
          );

          cleanupSpeech();

          reject(
            event.error
          );

        };

      /*
      ================================================
      SPEAK
      ================================================
      */

      synth.speak(
        speech
      );

      /*
      ================================================
      WATCHDOG
      ================================================
      */

      startSpeechWatchdog(
        text,
        resolve,
        completed
      );

    });

  }

  /*
  ====================================================
  APPLY SETTINGS
  ====================================================
  */

  function applyVoiceSettings(
    speech,
    mode
  ) {

    let selectedVoice =
      null;

    /*
    ================================================
    FEMALE
    ================================================
    */

    if (
      mode === "female"
    ) {

      selectedVoice =
        lockedFemaleVoice;

      speech.pitch =
        1.04;

      speech.rate =
        0.88;

      speech.volume =
        1;

    }

    /*
    ================================================
    MALE
    ================================================
    */

    else if (
      mode === "male"
    ) {

      selectedVoice =
        lockedMaleVoice;

      speech.pitch =
        0.92;

      speech.rate =
        0.91;

      speech.volume =
        1;

    }

    /*
    ================================================
    AUTO
    ================================================
    */

    else {

      selectedVoice =
        lockedAutoVoice;

      speech.pitch =
        1;

      speech.rate =
        0.90;

      speech.volume =
        1;

    }

    /*
    ================================================
    APPLY VOICE
    ================================================
    */

    if (selectedVoice) {

      speech.voice =
        selectedVoice;

      speech.lang =
        selectedVoice.lang;

    }

  }

  /*
  ====================================================
  FEMALE VOICE
  ====================================================
  */

  function resolveFemaleVoice() {

    const priority = [

      "swara",
      "heera",
      "google हिन्दी",
      "google hindi",
      "female",
      "woman",
      "zira",
      "samantha"

    ];

    return resolveVoice(
      priority
    );

  }

  /*
  ====================================================
  MALE VOICE
  ====================================================
  */

  function resolveMaleVoice() {

    const priority = [

      "ravi",
      "male",
      "man",
      "david",
      "alex",
      "daniel"

    ];

    return resolveVoice(
      priority
    );

  }

  /*
  ====================================================
  AUTO VOICE
  ====================================================
  */

  function resolveAutoVoice() {

    return (
      lockedFemaleVoice ||
      voices[0] ||
      null
    );

  }

  /*
  ====================================================
  RESOLVE VOICE
  ====================================================
  */

  function resolveVoice(
    keywords
  ) {

    for (
      const keyword
      of keywords
    ) {

      const match =
        voices.find((voice) => {

          return voice.name
            .toLowerCase()
            .includes(
              keyword.toLowerCase()
            );

        });

      if (match) {

        console.log(
          "Locked voice:",
          match.name
        );

        return match;

      }

    }

    /*
    ================================================
    HINDI FALLBACK
    ================================================
    */

    const hindiVoice =
      voices.find((voice) => {

        return voice.lang
          .toLowerCase()
          .includes("hi");

      });

    if (hindiVoice) {

      return hindiVoice;

    }

    return voices[0] || null;

  }

  /*
  ====================================================
  SMART CHUNKING
  ====================================================
  */

  function splitIntoChunks(
    text
  ) {

    /*
    ================================================
    SHORT TEXT SAFE
    ================================================
    */

    if (
      text.length < 120
    ) {

      return [text];

    }

    /*
    ================================================
    SPLIT BY PUNCTUATION
    ================================================
    */

    const chunks = [];

    const parts =
      text.split(
        /([,.!?।])/g
      );

    let current =
      "";

    for (
      let i = 0;
      i < parts.length;
      i++
    ) {

      current +=
        parts[i];

      /*
      ==============================================
      SAFE LENGTH
      ==============================================
      */

      if (
        current.length > 90
      ) {

        chunks.push(
          current.trim()
        );

        current =
          "";

      }

    }

    if (
      current.trim()
    ) {

      chunks.push(
        current.trim()
      );

    }

    return chunks;

  }

  /*
  ====================================================
  WATCHDOG
  ====================================================
  */

  function startSpeechWatchdog(
    text,
    resolve,
    completed
  ) {

    const estimatedTime =
      Math.max(
        5000,
        text.length * 110
      );

    setTimeout(() => {

      /*
      ================================================
      MOBILE RANDOM STOP FIX
      ================================================
      */

      if (
        speaking &&
        !synth.speaking
      ) {

        console.warn(
          "Watchdog recovered speech."
        );

        cleanupSpeech();

        resolve();

      }

    }, estimatedTime);

  }

  /*
  ====================================================
  WAIT UNTIL FREE
  ====================================================
  */

  async function waitUntilFree() {

    return new Promise((resolve) => {

      const interval =
        setInterval(() => {

          if (
            !synth.speaking &&
            !speaking
          ) {

            clearInterval(
              interval
            );

            resolve();

          }

        }, 100);

    });

  }

  /*
  ====================================================
  CLEANUP
  ====================================================
  */

  function cleanupSpeech() {

    activeSpeech =
      null;

    speaking =
      false;

  }

  /*
  ====================================================
  SANITIZE
  ====================================================
  */

  function sanitizeText(
    text
  ) {

    return text
      .replace(/\s+/g, " ")
      .trim();

  }

  /*
  ====================================================
  WAIT
  ====================================================
  */

  function wait(duration) {

    return new Promise((resolve) => {

      setTimeout(
        resolve,
        duration
      );

    });

  }

  /*
  ====================================================
  STOP
  ====================================================
  */

  function stop() {

    try {

      synth.cancel();

    } catch (error) {

      console.warn(
        error
      );

    }

    cleanupSpeech();

  }

  /*
  ====================================================
  IS SPEAKING
  ====================================================
  */

  function isSpeaking() {

    return (
      synth.speaking ||
      speaking
    );

  }

  /*
  ====================================================
  GET VOICES
  ====================================================
  */

  function getVoices() {

    return voices;

  }

  /*
  ====================================================
  CURRENT MODE
  ====================================================
  */

  function getCurrentVoiceMode() {

    return currentVoiceMode;

  }

  /*
  ====================================================
  PUBLIC API
  ====================================================
  */

  return {

    initialize,

    speak,

    stop,

    isSpeaking,

    getVoices,

    getCurrentVoiceMode

  };

})();
