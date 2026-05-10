/*
====================================================
REEL CREATOR PRO
FINAL ULTRA STABLE TTS ENGINE
tts-engine.js
====================================================
*/

window.TTSEngine = (() => {

  const synth =
    window.speechSynthesis;

  let voices = [];

  let initialized =
    false;

  let femaleVoice =
    null;

  let maleVoice =
    null;

  let speaking =
    false;

  /*
  ====================================================
  INIT
  ====================================================
  */

  async function initialize() {

    if (initialized) {

      return;

    }

    await loadVoices();

    femaleVoice =
      resolveFemaleVoice();

    maleVoice =
      resolveMaleVoice();

    initialized = true;

  }

  /*
  ====================================================
  LOAD VOICES
  ====================================================
  */

  function loadVoices() {

    return new Promise((resolve) => {

      const load = () => {

        voices =
          synth.getVoices();

        if (
          voices.length > 0
        ) {

          resolve();

        }

      };

      load();

      speechSynthesis.onvoiceschanged =
        load;

      setTimeout(
        load,
        1200
      );

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
      sanitize(
        config.text || ""
      );

    if (!text) {

      return;

    }

    await waitUntilFree();

    return new Promise((resolve) => {

      const speech =
        new SpeechSynthesisUtterance(
          text
        );

      speaking = true;

      /*
      ================================================
      VOICE
      ================================================
      */

      if (
        config.voiceMode ===
        "male"
      ) {

        speech.voice =
          maleVoice;

        speech.pitch =
          0.94;

        speech.rate =
          0.90;

      }

      else {

        speech.voice =
          femaleVoice;

        speech.pitch =
          1.03;

        speech.rate =
          0.88;

      }

      speech.volume = 1;

      /*
      ================================================
      LANGUAGE
      ================================================
      */

      speech.lang =
        "hi-IN";

      /*
      ================================================
      EVENTS
      ================================================
      */

      speech.onend =
        () => {

          speaking = false;

          resolve();

        };

      speech.onerror =
        () => {

          speaking = false;

          resolve();

        };

      synth.speak(speech);

    });

  }

  /*
  ====================================================
  FEMALE VOICE
  ====================================================
  */

  function resolveFemaleVoice() {

    return findVoice([

      "swara",
      "heera",
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

    return findVoice([

      "ravi",
      "david",
      "male"

    ]);

  }

  /*
  ====================================================
  FIND VOICE
  ====================================================
  */

  function findVoice(keywords) {

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

    return voices[0];

  }

  /*
  ====================================================
  WAIT
  ====================================================
  */

  async function waitUntilFree() {

    return new Promise((resolve) => {

      const interval =
        setInterval(() => {

          if (
            !speechSynthesis.speaking &&
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
  SANITIZE
  ====================================================
  */

  function sanitize(text) {

    return text
      .replace(/[,:;]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  }

  /*
  ====================================================
  STOP
  ====================================================
  */

  function stop() {

    speaking = false;

    synth.cancel();

  }

  /*
  ====================================================
  API
  ====================================================
  */

  return {

    initialize,

    speak,

    stop

  };

})();
