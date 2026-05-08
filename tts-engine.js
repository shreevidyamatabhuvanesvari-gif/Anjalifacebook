/*
====================================================
REEL CREATOR PRO
ADVANCED INDIAN VOICE ENGINE
tts-engine.js
====================================================

Features:

✔ Locked Voice System
✔ Stable Indian Female Voice
✔ Stable Indian Male Voice
✔ Auto Voice Mode
✔ Cinematic Speech Tuning
✔ No Robotic Voice Switching
✔ Same Voice Across Entire Reel
✔ Hindi Priority System

====================================================
*/

window.TTSEngine = (() => {

  /*
  ====================================================
  INTERNAL STATE
  ====================================================
  */

  let synth =
    window.speechSynthesis;

  let voices = [];

  let activeUtterance = null;

  let currentVoiceMode =
    "female";

  let initialized = false;

  /*
  ====================================================
  LOCKED VOICES
  ====================================================
  */

  let lockedFemaleVoice = null;

  let lockedMaleVoice = null;

  let lockedAutoVoice = null;

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

    /*
    ================================================
    LOCK VOICES
    ================================================
    */

    lockedFemaleVoice =
      resolveFemaleVoice();

    lockedMaleVoice =
      resolveMaleVoice();

    lockedAutoVoice =
      resolveAutoVoice();

    initialized = true;

    console.log(
      "TTS voices initialized."
    );

  }

  /*
  ====================================================
  LOAD VOICES
  ====================================================
  */

  function loadVoices() {

    return new Promise((resolve) => {

      const availableVoices =
        synth.getVoices();

      /*
      ================================================
      IMMEDIATE LOAD
      ================================================
      */

      if (
        availableVoices.length > 0
      ) {

        voices =
          availableVoices;

        resolve();

        return;

      }

      /*
      ================================================
      WAIT FOR BROWSER
      ================================================
      */

      synth.onvoiceschanged =
        () => {

          voices =
            synth.getVoices();

          resolve();

        };

    });

  }

  /*
  ====================================================
  SPEAK
  ====================================================
  */

  async function speak(config) {

    await initialize();

    const text =
      config.text || "";

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
    STOP PREVIOUS
    ================================================
    */

    stop();

    /*
    ================================================
    CREATE UTTERANCE
    ================================================
    */

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    activeUtterance =
      speech;

    /*
    ================================================
    SELECT LOCKED VOICE
    ================================================
    */

    let selectedVoice =
      null;

    if (
      currentVoiceMode ===
      "female"
    ) {

      selectedVoice =
        lockedFemaleVoice;

      /*
      ==============================================
      INDIAN FEMALE STYLE
      ==============================================
      */

      speech.pitch =
        1.06;

      speech.rate =
        0.93;

      speech.volume =
        1;

    }

    else if (
      currentVoiceMode ===
      "male"
    ) {

      selectedVoice =
        lockedMaleVoice;

      /*
      ==============================================
      INDIAN MALE STYLE
      ==============================================
      */

      speech.pitch =
        0.92;

      speech.rate =
        0.96;

      speech.volume =
        1;

    }

    else {

      selectedVoice =
        lockedAutoVoice;

      /*
      ==============================================
      AUTO STYLE
      ==============================================
      */

      speech.pitch =
        1;

      speech.rate =
        0.95;

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

    /*
    ================================================
    PROMISE
    ================================================
    */

    return new Promise((resolve, reject) => {

      /*
      ==============================================
      START
      ==============================================
      */

      speech.onstart = () => {

        console.log(
          "TTS started:",
          text
        );

      };

      /*
      ==============================================
      END
      ==============================================
      */

      speech.onend = () => {

        activeUtterance =
          null;

        /*
        ============================================
        CINEMATIC GAP
        ============================================
        */

        setTimeout(() => {

          resolve();

        }, 350);

      };

      /*
      ==============================================
      ERROR
      ==============================================
      */

      speech.onerror =
        (event) => {

          console.error(
            "TTS error:",
            event.error
          );

          activeUtterance =
            null;

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

    });

  }

  /*
  ====================================================
  FEMALE VOICE RESOLVER
  ====================================================
  */

  function resolveFemaleVoice() {

    /*
    ================================================
    PRIORITY ORDER
    ================================================
    */

    const femalePriority = [

      "swara",
      "heera",
      "google हिन्दी",
      "google hindi",
      "female",
      "woman",
      "zira",
      "samantha",
      "victoria",
      "karen"

    ];

    /*
    ================================================
    HINDI FEMALE
    ================================================
    */

    for (const keyword of femalePriority) {

      const match =
        voices.find((voice) => {

          const name =
            voice.name
              .toLowerCase();

          return name.includes(
            keyword.toLowerCase()
          );

        });

      if (match) {

        console.log(
          "Female voice locked:",
          match.name
        );

        return match;

      }

    }

    /*
    ================================================
    HINDI LANGUAGE FALLBACK
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

    /*
    ================================================
    FINAL FALLBACK
    ================================================
    */

    return voices[0] || null;

  }

  /*
  ====================================================
  MALE VOICE RESOLVER
  ====================================================
  */

  function resolveMaleVoice() {

    const malePriority = [

      "ravi",
      "male",
      "man",
      "david",
      "alex",
      "daniel",
      "fred"

    ];

    for (const keyword of malePriority) {

      const match =
        voices.find((voice) => {

          const name =
            voice.name
              .toLowerCase();

          return name.includes(
            keyword.toLowerCase()
          );

        });

      if (match) {

        console.log(
          "Male voice locked:",
          match.name
        );

        return match;

      }

    }

    /*
    ================================================
    HINDI VOICE FALLBACK
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
  AUTO VOICE RESOLVER
  ====================================================
  */

  function resolveAutoVoice() {

    /*
    ================================================
    PREFER FEMALE
    ================================================
    */

    return (
      lockedFemaleVoice ||
      voices[0] ||
      null
    );

  }

  /*
  ====================================================
  STOP
  ====================================================
  */

  function stop() {

    if (
      synth.speaking
    ) {

      synth.cancel();

    }

    activeUtterance =
      null;

  }

  /*
  ====================================================
  IS SPEAKING
  ====================================================
  */

  function isSpeaking() {

    return synth.speaking;

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
