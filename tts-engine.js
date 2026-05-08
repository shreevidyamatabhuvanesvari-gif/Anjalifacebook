/*
====================================================
REEL CREATOR PRO
TTS ENGINE
tts-engine.js
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

  let currentVoiceMode = "female";

  let initialized = false;

  /*
  ====================================================
  INITIALIZE VOICES
  ====================================================
  */

  async function initialize() {

    if (initialized) {

      return;

    }

    await loadVoices();

    initialized = true;

  }

  /*
  ====================================================
  LOAD SYSTEM VOICES
  ====================================================
  */

  function loadVoices() {

    return new Promise((resolve) => {

      const availableVoices =
        synth.getVoices();

      /*
      ================================================
      VOICES ALREADY AVAILABLE
      ================================================
      */

      if (availableVoices.length > 0) {

        voices = availableVoices;

        resolve();

        return;

      }

      /*
      ================================================
      WAIT FOR BROWSER VOICES
      ================================================
      */

      synth.onvoiceschanged = () => {

        voices = synth.getVoices();

        resolve();

      };

    });

  }

  /*
  ====================================================
  MAIN SPEAK FUNCTION
  ====================================================
  */

  async function speak(config) {

    await initialize();

    const text =
      config.text || "";

    currentVoiceMode =
      config.voiceMode || "female";

    /*
    ================================================
    EMPTY TEXT GUARD
    ================================================
    */

    if (!text.trim()) {

      return;

    }

    /*
    ================================================
    STOP PREVIOUS SPEECH
    ================================================
    */

    stop();

    /*
    ================================================
    CREATE UTTERANCE
    ================================================
    */

    const utterance =
      new SpeechSynthesisUtterance(text);

    activeUtterance = utterance;

    /*
    ================================================
    VOICE SELECTION
    ================================================
    */

    const selectedVoice =
      selectVoice(currentVoiceMode);

    if (selectedVoice) {

      utterance.voice =
        selectedVoice;

    }

    /*
    ================================================
    CINEMATIC SPEECH SETTINGS
    ================================================
    */

    utterance.rate = 0.92;

    utterance.pitch = 1;

    utterance.volume = 1;

    /*
    ================================================
    RETURN PROMISE
    ================================================
    */

    return new Promise((resolve, reject) => {

      /*
      ==============================================
      SPEECH START
      ==============================================
      */

      utterance.onstart = () => {

        console.log(
          "TTS started:",
          text
        );

      };

      /*
      ==============================================
      SPEECH COMPLETE
      ==============================================
      */

      utterance.onend = () => {

        console.log(
          "TTS completed:",
          text
        );

        activeUtterance = null;

        resolve();

      };

      /*
      ==============================================
      SPEECH ERROR
      ==============================================
      */

      utterance.onerror = (event) => {

        console.error(
          "TTS error:",
          event.error
        );

        activeUtterance = null;

        reject(event.error);

      };

      /*
      ==============================================
      SPEAK
      ==============================================
      */

      synth.speak(utterance);

    });

  }

  /*
  ====================================================
  VOICE SELECTION
  ====================================================
  */

  function selectVoice(mode) {

    if (!voices.length) {

      return null;

    }

    /*
    ================================================
    FEMALE VOICE
    ================================================
    */

    if (mode === "female") {

      return findFemaleVoice();

    }

    /*
    ================================================
    MALE VOICE
    ================================================
    */

    if (mode === "male") {

      return findMaleVoice();

    }

    /*
    ================================================
    AUTO VOICE
    ================================================
    */

    return findAutoVoice();

  }

  /*
  ====================================================
  FEMALE VOICE FINDER
  ====================================================
  */

  function findFemaleVoice() {

    const femaleKeywords = [

      "female",
      "woman",
      "zira",
      "samantha",
      "victoria",
      "karen",
      "moira",
      "google uk english female"

    ];

    return voices.find((voice) => {

      const name =
        voice.name.toLowerCase();

      return femaleKeywords.some(keyword =>
        name.includes(keyword)
      );

    }) || voices[0];

  }

  /*
  ====================================================
  MALE VOICE FINDER
  ====================================================
  */

  function findMaleVoice() {

    const maleKeywords = [

      "male",
      "man",
      "david",
      "alex",
      "daniel",
      "fred",
      "google uk english male"

    ];

    return voices.find((voice) => {

      const name =
        voice.name.toLowerCase();

      return maleKeywords.some(keyword =>
        name.includes(keyword)
      );

    }) || voices[0];

  }

  /*
  ====================================================
  AUTO VOICE
  ====================================================
  */

  function findAutoVoice() {

    /*
    ================================================
    PREFER ENGLISH VOICE
    ================================================
    */

    const englishVoice =
      voices.find((voice) => {

        return voice.lang
          .toLowerCase()
          .includes("en");

      });

    return englishVoice || voices[0];

  }

  /*
  ====================================================
  STOP SPEECH
  ====================================================
  */

  function stop() {

    if (synth.speaking) {

      synth.cancel();

    }

    activeUtterance = null;

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
  GET AVAILABLE VOICES
  ====================================================
  */

  function getVoices() {

    return voices;

  }

  /*
  ====================================================
  CURRENT VOICE MODE
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
