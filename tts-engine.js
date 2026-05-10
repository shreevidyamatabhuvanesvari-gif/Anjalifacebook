/*
====================================================
REEL CREATOR PRO
HINDI SEMANTIC STABILIZED TTS ENGINE
FINAL ANTI-VOICE-CUT VERSION
tts-engine.js
====================================================

Features:

✔ Hindi Semantic Chunking
✔ Zero Voice Cut Strategy
✔ Android Chrome Stabilization
✔ Warmup Speech
✔ Adaptive Pause Engine
✔ Locked Indian Voices
✔ Long Suvichar Safe
✔ Multi Scene Stable
✔ Multi Line Stable
✔ Cinematic Narration Timing
✔ No Speech Overlap
✔ Soft Recovery System

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
  CHUNK SETTINGS
  ====================================================
  */

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

    /*
    ================================================
    WARMUP SPEECH
    ================================================
    */

    await warmupSpeech();

    initialized = true;

    console.log(
      "Hindi semantic TTS initialized."
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
  WARMUP
  ====================================================
  */

  async function warmupSpeech() {

    return new Promise((resolve) => {

      const speech =
        new SpeechSynthesisUtterance(
          " "
        );

      speech.volume = 0;

      speech.onend =
        () => {

          resolve();

        };

      synth.speak(speech);

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
    WAIT PREVIOUS
    ================================================
    */

    await waitUntilFree();

    /*
    ================================================
    HINDI SEMANTIC CHUNKS
    ================================================
    */

    const chunks =
      createSemanticChunks(
        originalText
      );

    /*
    ================================================
    SPEAK SEQUENTIALLY
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
      ADAPTIVE PAUSE
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

      softRecover();

    }

    /*
    ================================================
    FINAL RECOVERY
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

      const speech =
        new SpeechSynthesisUtterance(
          text
        );

      activeSpeech =
        speech;

      speaking =
        true;

      applyVoiceSettings(
        speech,
        currentVoiceMode
      );

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
            "Speaking:",
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

          if (
            event.error ===
            "interrupted"
          ) {

            cleanupSpeech();

            resolve();

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

      startWatchdog(
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
        0.84;

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
        0.88;

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
        0.86;

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
      "alex",
      "daniel"

    ]);

  }

  /*
  ====================================================
  AUTO
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
  SEMANTIC CHUNKING
  ====================================================
  */

  function createSemanticChunks(
    text
  ) {

    /*
    ================================================
    SHORT SAFE
    ================================================
    */

    if (
      text.length <=
      MAX_CHUNK_LENGTH
    ) {

      return [text];

    }

    /*
    ================================================
    SPLIT BY HINDI SEMANTICS
    ================================================
    */

    const semanticParts =
      text.split(
        /(,|।|!|\?|…|\.)/g
      );

    const chunks = [];

    let current =
      "";

    for (
      let i = 0;
      i < semanticParts.length;
      i++
    ) {

      const part =
        semanticParts[i];

      /*
      ==============================================
      BUILD CHUNK
      ==============================================
      */

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

    /*
    ================================================
    REMOVE EMPTY
    ================================================
    */

    return chunks.filter(Boolean);

  }

  /*
  ====================================================
  ADAPTIVE PAUSE
  ====================================================
  */

  function getAdaptivePause(
    text
  ) {

    /*
    ================================================
    LONG DRAMATIC
    ================================================
    */

    if (
      text.includes("...")
    ) {

      return 1300;

    }

    /*
    ================================================
    FULL STOP
    ================================================
    */

    if (
      text.includes("।") ||
      text.includes(".")
    ) {

      return 950;

    }

    /*
    ================================================
    COMMA
    ================================================
    */

    if (
      text.includes(",")
    ) {

      return 550;

    }

    /*
    ================================================
    DEFAULT
    ================================================
    */

    return 700;

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
        text.length * 125
      );

    setTimeout(() => {

      if (
        speaking &&
        !synth.speaking
      ) {

        console.warn(
          "Speech recovered by watchdog."
        );

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

      synth.pause();

      synth.resume();

    } catch (error) {

      console.warn(
        error
      );

    }

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

        }, 120);

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
