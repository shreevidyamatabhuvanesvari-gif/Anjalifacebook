/*
====================================================
REEL CREATOR PRO
ULTRA STABLE INDIAN TTS ENGINE
NO VOICE CUT VERSION
tts-engine.js
====================================================

Features:

✔ No Voice Cutting
✔ Stable Indian Female Voice
✔ Stable Indian Male Voice
✔ Locked Voice System
✔ Queue Safe
✔ Long Text Safe
✔ Mobile Browser Safe
✔ Chrome Android Stable
✔ Cinematic Timing
✔ Safe Speech Cleanup

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

  let initialized = false;

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
  ACTIVE SPEECH
  ====================================================
  */

  let activeSpeech =
    null;

  /*
  ====================================================
  SPEECH LOCK
  ====================================================
  */

  let speaking =
    false;

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
      "TTS initialized."
    );

  }

  /*
  ====================================================
  LOAD VOICES
  ====================================================
  */

  function loadVoices() {

    return new Promise((resolve) => {

      let loaded = false;

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

      /*
      ================================================
      SAFETY FALLBACK
      ================================================
      */

      setTimeout(
        finalize,
        1200
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

    const text =
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

    if (!text.trim()) {

      return;

    }

    /*
    ================================================
    WAIT PREVIOUS SPEECH
    ================================================
    */

    await waitForSpeechFinish();

    /*
    ================================================
    HARD CLEANUP
    ================================================
    */

    hardStop();

    /*
    ================================================
    MOBILE SAFETY DELAY
    ================================================
    */

    await wait(120);

    /*
    ================================================
    CREATE SPEECH
    ================================================
    */

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    activeSpeech =
      speech;

    speaking = true;

    /*
    ================================================
    APPLY VOICE
    ================================================
    */

    applyVoiceSettings(
      speech,
      currentVoiceMode
    );

    /*
    ================================================
    SPEAK PROMISE
    ================================================
    */

    return new Promise((resolve, reject) => {

      let resolved =
        false;

      /*
      ==============================================
      START
      ==============================================
      */

      speech.onstart = () => {

        console.log(
          "Speaking:",
          text
        );

      };

      /*
      ==============================================
      END
      ==============================================
      */

      speech.onend = () => {

        if (resolved) {

          return;

        }

        resolved = true;

        cleanupSpeech();

        /*
        ============================================
        CINEMATIC GAP
        ============================================
        */

        setTimeout(() => {

          resolve();

        }, 260);

      };

      /*
      ==============================================
      ERROR
      ==============================================
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
      ==============================================
      SPEAK
      ==============================================
      */

      synth.speak(speech);

      /*
      ==============================================
      ANDROID SAFETY WATCHDOG
      ==============================================
      */

      startWatchdog(
        speech,
        text,
        resolve
      );

    });

  }

  /*
  ====================================================
  APPLY VOICE SETTINGS
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
        0.90;

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
        0.94;

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
        0.92;

      speech.volume =
        1;

    }

    /*
    ================================================
    APPLY
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

    return resolveVoiceByPriority(
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

    return resolveVoiceByPriority(
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
  PRIORITY MATCHER
  ====================================================
  */

  function resolveVoiceByPriority(
    priority
  ) {

    for (
      const keyword
      of priority
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
  WATCHDOG
  ====================================================
  */

  function startWatchdog(
    speech,
    text,
    resolve
  ) {

    /*
    ================================================
    SOME MOBILE BROWSERS
    RANDOMLY STOP TTS
    ================================================
    */

    const estimatedTime =
      Math.max(
        4000,
        text.length * 90
      );

    setTimeout(() => {

      /*
      ==============================================
      FORCE COMPLETE
      ==============================================
      */

      if (
        speaking &&
        !synth.speaking
      ) {

        console.warn(
          "TTS watchdog recovered speech."
        );

        cleanupSpeech();

        resolve();

      }

    }, estimatedTime);

  }

  /*
  ====================================================
  WAIT FOR SPEECH
  ====================================================
  */

  async function waitForSpeechFinish() {

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

        }, 60);

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
  HARD STOP
  ====================================================
  */

  function hardStop() {

    try {

      synth.cancel();

    } catch (error) {

      console.warn(error);

    }

    cleanupSpeech();

  }

  /*
  ====================================================
  SANITIZE TEXT
  ====================================================
  */

  function sanitizeText(text) {

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

    hardStop();

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
