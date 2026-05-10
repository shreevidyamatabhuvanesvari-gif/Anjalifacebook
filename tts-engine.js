/*
====================================================
REEL CREATOR PRO
STABLE HINDI CINEMATIC TTS ENGINE
FIRST SPEECH FIX VERSION
tts-engine.js
====================================================
*/

window.TTSEngine = (() => {

  const synth =
    window.speechSynthesis;

  let voices = [];

  let initialized =
    false;

  let currentVoiceMode =
    "female";

  let lockedFemaleVoice =
    null;

  let lockedMaleVoice =
    null;

  let lockedAutoVoice =
    null;

  let speaking =
    false;

  const MAX_CHUNK_LENGTH =
    52;

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
      "Stable Hindi TTS ready."
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

    if (!originalText) {

      return;

    }

    await waitUntilFree();

    /*
    ================================================
    ANDROID STABILIZATION
    ================================================
    */

    await wait(180);

    const chunks =
      createSemanticChunks(
        originalText
      );

    for (
      let i = 0;
      i < chunks.length;
      i++
    ) {

      const chunk =
        chunks[i];

      await speakChunk(
        chunk
      );

      /*
      ==============================================
      PAUSE
      ==============================================
      */

      await wait(
        getAdaptivePause(
          chunk
        )
      );

      /*
      ==============================================
      SOFT RECOVERY
      ==============================================
      */

      if (i > 0) {

        softRecover();

      }

    }

    await wait(500);

  }

  /*
  ====================================================
  SPEAK CHUNK
  ====================================================
  */

  async function speakChunk(text) {

    return new Promise((resolve, reject) => {

      const speech =
        new SpeechSynthesisUtterance(
          text
        );

      speaking = true;

      applyVoiceSettings(
        speech,
        currentVoiceMode
      );

      let completed =
        false;

      speech.onstart =
        () => {

          console.log(
            "Speaking:",
            text
          );

        };

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

      speech.onerror =
        (event) => {

          if (
            event.error ===
            "interrupted"
          ) {

            cleanupSpeech();

            resolve();

            return;

          }

          console.error(
            event.error
          );

          cleanupSpeech();

          reject(
            event.error
          );

        };

      synth.speak(
        speech
      );

      startWatchdog(
        text,
        resolve
      );

    });

  }

  /*
  ====================================================
  APPLY VOICE
  ====================================================
  */

  function applyVoiceSettings(
    speech,
    mode
  ) {

    let selectedVoice =
      null;

    if (
      mode === "female"
    ) {

      selectedVoice =
        lockedFemaleVoice;

      speech.pitch =
        1.04;

      speech.rate =
        0.84;

    }

    else if (
      mode === "male"
    ) {

      selectedVoice =
        lockedMaleVoice;

      speech.pitch =
        0.92;

      speech.rate =
        0.88;

    }

    else {

      selectedVoice =
        lockedAutoVoice;

      speech.pitch =
        1;

      speech.rate =
        0.86;

    }

    speech.volume = 1;

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

    return resolveVoice([

      "swara",
      "heera",
      "google हिन्दी",
      "google hindi",
      "female",
      "zira",
      "samantha"

    ]);

  }

  /*
  ====================================================
  MALE VOICE
  ====================================================
  */

  function resolveMaleVoice() {

    return resolveVoice([

      "ravi",
      "male",
      "david",
      "alex"

    ]);

  }

  /*
  ====================================================
  AUTO VOICE
  ====================================================
  */

  function resolveAutoVoice() {

    return (
      lockedFemaleVoice ||
      voices[0]
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

        return match;

      }

    }

    const hindiVoice =
      voices.find((voice) => {

        return voice.lang
          .toLowerCase()
          .includes("hi");

      });

    return (
      hindiVoice ||
      voices[0]
    );

  }

  /*
  ====================================================
  SEMANTIC CHUNKS
  ====================================================
  */

  function createSemanticChunks(
    text
  ) {

    if (
      text.length <=
      MAX_CHUNK_LENGTH
    ) {

      return [text];

    }

    const parts =
      text.split(
        /(,|।|!|\?|…|\.)/g
      );

    const chunks = [];

    let current =
      "";

    for (
      const part
      of parts
    ) {

      if (
        (
          current + part
        ).length <
        MAX_CHUNK_LENGTH
      ) {

        current += part;

      }

      else {

        if (
          current.trim()
        ) {

          chunks.push(
            current.trim()
          );

        }

        current =
          part;

      }

    }

    if (
      current.trim()
    ) {

      chunks.push(
        current.trim()
      );

    }

    return chunks.filter(Boolean);

  }

  /*
  ====================================================
  PAUSE ENGINE
  ====================================================
  */

  function getAdaptivePause(
    text
  ) {

    if (
      text.includes("।")
    ) {

      return 950;

    }

    if (
      text.includes(",")
    ) {

      return 500;

    }

    return 650;

  }

  /*
  ====================================================
  WATCHDOG
  ====================================================
  */

  function startWatchdog(
    text,
    resolve
  ) {

    const estimated =
      Math.max(
        5000,
        text.length * 130
      );

    setTimeout(() => {

      if (
        speaking &&
        !synth.speaking
      ) {

        cleanupSpeech();

        resolve();

      }

    }, estimated);

  }

  /*
  ====================================================
  SOFT RECOVERY
  ====================================================
  */

  function softRecover() {

    try {

      synth.resume();

    } catch (error) {

      console.warn(error);

    }

  }

  /*
  ====================================================
  WAIT FREE
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

        }, 120);

    });

  }

  /*
  ====================================================
  CLEANUP
  ====================================================
  */

  function cleanupSpeech() {

    speaking = false;

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

      console.warn(error);

    }

    cleanupSpeech();

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

    isSpeaking() {

      return (
        synth.speaking ||
        speaking
      );

    },

    getVoices() {

      return voices;

    },

    getCurrentVoiceMode() {

      return currentVoiceMode;

    }

  };

})();
