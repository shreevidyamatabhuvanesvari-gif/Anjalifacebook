/*
====================================================
REEL CREATOR PRO
FINAL DETERMINISTIC TIMELINE ENGINE
timeline-engine.js
====================================================

Features:

✔ Deterministic Playback
✔ Zero Line Overlap
✔ Zero Scene Skip
✔ Await Safe
✔ TTS Synchronization
✔ Cinematic Pacing
✔ Stable Multi Scene Playback
✔ Stable Multi Line Playback
✔ Android Safe
✔ Playback Lock System
✔ Transition Buffering
✔ Sequential Execution

====================================================
*/

window.TimelineEngine = (() => {

  /*
  ====================================================
  INTERNAL STATE
  ====================================================
  */

  let scenes = [];

  let voiceMode =
    "female";

  let isRunning =
    false;

  /*
  ====================================================
  PLAYBACK STATE
  ====================================================
  */

  const playbackState = {

    currentSceneIndex: 0,

    currentLineIndex: 0

  };

  /*
  ====================================================
  TIMING CONFIG
  ====================================================
  */

  const TIMING = {

    SCENE_LOAD_DELAY: 700,

    LINE_RENDER_DELAY: 450,

    LINE_COMPLETE_DELAY: 900,

    SCENE_COMPLETE_DELAY: 1200,

    FINAL_COMPLETE_DELAY: 1500

  };

  /*
  ====================================================
  START PLAYBACK
  ====================================================
  */

  async function start(config) {

    /*
    ================================================
    VALIDATE CONFIG
    ================================================
    */

    if (!config) {

      console.error(
        "Timeline config missing."
      );

      return;

    }

    scenes =
      config.scenes || [];

    voiceMode =
      config.voiceMode ||
      "female";

    /*
    ================================================
    EMPTY CHECK
    ================================================
    */

    if (!scenes.length) {

      console.error(
        "No scenes available."
      );

      return;

    }

    /*
    ================================================
    PLAYBACK LOCK
    ================================================
    */

    if (isRunning) {

      return;

    }

    isRunning = true;

    console.log(
      "Timeline playback started."
    );

    /*
    ================================================
    RUN TIMELINE
    ================================================
    */

    try {

      await runTimeline();

    } catch (error) {

      console.error(
        "Timeline playback failed:",
        error
      );

      stop();

    }

  }

  /*
  ====================================================
  MAIN TIMELINE
  ====================================================
  */

  async function runTimeline() {

    /*
    ================================================
    LOOP SCENES
    ================================================
    */

    for (
      let sceneIndex = 0;
      sceneIndex < scenes.length;
      sceneIndex++
    ) {

      /*
      ==============================================
      PLAYBACK STOP CHECK
      ==============================================
      */

      if (!isRunning) {

        return;

      }

      playbackState.currentSceneIndex =
        sceneIndex;

      playbackState.currentLineIndex =
        0;

      const scene =
        scenes[sceneIndex];

      /*
      ==============================================
      PLAY SCENE
      ==============================================
      */

      await playScene(
        scene,
        sceneIndex
      );

    }

    /*
    ================================================
    COMPLETE PLAYBACK
    ================================================
    */

    await completePlayback();

  }

  /*
  ====================================================
  PLAY SCENE
  ====================================================
  */

  async function playScene(
    scene,
    sceneIndex
  ) {

    /*
    ================================================
    LOAD SCENE
    ================================================
    */

    await loadScene(
      scene,
      sceneIndex
    );

    /*
    ================================================
    SAFETY DELAY
    ================================================
    */

    await wait(
      TIMING.SCENE_LOAD_DELAY
    );

    /*
    ================================================
    LOOP LINES
    ================================================
    */

    for (
      let lineIndex = 0;
      lineIndex < scene.lines.length;
      lineIndex++
    ) {

      if (!isRunning) {

        return;

      }

      playbackState.currentLineIndex =
        lineIndex;

      const line =
        sanitizeLine(
          scene.lines[lineIndex]
        );

      /*
      ==============================================
      EMPTY LINE GUARD
      ==============================================
      */

      if (!line) {

        continue;

      }

      /*
      ==============================================
      PLAY LINE
      ==============================================
      */

      await playLine(
        line,
        sceneIndex,
        lineIndex
      );

    }

    /*
    ================================================
    SCENE COMPLETE
    ================================================
    */

    await completeScene(
      sceneIndex
    );

  }

  /*
  ====================================================
  PLAY LINE
  ====================================================
  */

  async function playLine(
    line,
    sceneIndex,
    lineIndex
  ) {

    /*
    ================================================
    RENDER TEXT
    ================================================
    */

    await renderLine({
      text: line,
      sceneIndex,
      lineIndex
    });

    /*
    ================================================
    RENDER BUFFER
    ================================================
    */

    await wait(
      TIMING.LINE_RENDER_DELAY
    );

    /*
    ================================================
    SPEAK LINE
    ================================================
    */

    await speakLine(
      line
    );

    /*
    ================================================
    POST SPEECH BUFFER
    ================================================
    */

    await wait(
      TIMING.LINE_COMPLETE_DELAY
    );

  }

  /*
  ====================================================
  LOAD SCENE
  ====================================================
  */

  async function loadScene(
    scene,
    sceneIndex
  ) {

    if (
      !window.CanvasRecorder
    ) {

      console.warn(
        "CanvasRecorder missing."
      );

      return;

    }

    if (
      typeof window.CanvasRecorder
        .loadScene !== "function"
    ) {

      console.warn(
        "CanvasRecorder.loadScene missing."
      );

      return;

    }

    await window.CanvasRecorder
      .loadScene({

        imageURL:
          scene.imageURL,

        sceneIndex

      });

  }

  /*
  ====================================================
  RENDER LINE
  ====================================================
  */

  async function renderLine(
    config
  ) {

    if (
      !window.CanvasRecorder
    ) {

      return;

    }

    if (
      typeof window.CanvasRecorder
        .renderLine !== "function"
    ) {

      return;

    }

    await window.CanvasRecorder
      .renderLine({

        text:
          config.text,

        sceneIndex:
          config.sceneIndex,

        lineIndex:
          config.lineIndex

      });

  }

  /*
  ====================================================
  SPEAK LINE
  ====================================================
  */

  async function speakLine(
    line
  ) {

    if (
      !window.TTSEngine
    ) {

      console.warn(
        "TTSEngine missing."
      );

      return;

    }

    if (
      typeof window.TTSEngine
        .speak !== "function"
    ) {

      console.warn(
        "TTSEngine.speak missing."
      );

      return;

    }

    await window.TTSEngine
      .speak({

        text: line,

        voiceMode

      });

  }

  /*
  ====================================================
  COMPLETE SCENE
  ====================================================
  */

  async function completeScene(
    sceneIndex
  ) {

    /*
    ================================================
    TRANSITION
    ================================================
    */

    if (
      window.CanvasRecorder &&
      typeof window.CanvasRecorder
        .playSceneTransition ===
      "function"
    ) {

      await window.CanvasRecorder
        .playSceneTransition({

          sceneIndex

        });

    }

    /*
    ================================================
    SCENE BUFFER
    ================================================
    */

    await wait(
      TIMING.SCENE_COMPLETE_DELAY
    );

  }

  /*
  ====================================================
  COMPLETE PLAYBACK
  ====================================================
  */

  async function completePlayback() {

    console.log(
      "Timeline playback complete."
    );

    /*
    ================================================
    FINAL BUFFER
    ================================================
    */

    await wait(
      TIMING.FINAL_COMPLETE_DELAY
    );

    isRunning = false;

    /*
    ================================================
    FINALIZE RENDERER
    ================================================
    */

    if (
      window.CanvasRecorder &&
      typeof window.CanvasRecorder
        .finalize === "function"
    ) {

      await window.CanvasRecorder
        .finalize();

    }

    /*
    ================================================
    APP CALLBACK
    ================================================
    */

    if (
      window.ReelCreatorApp &&
      typeof window.ReelCreatorApp
        .handlePlaybackComplete ===
      "function"
    ) {

      await window.ReelCreatorApp
        .handlePlaybackComplete();

    }

  }

  /*
  ====================================================
  STOP PLAYBACK
  ====================================================
  */

  function stop() {

    isRunning = false;

    /*
    ================================================
    STOP TTS
    ================================================
    */

    if (
      window.TTSEngine &&
      typeof window.TTSEngine
        .stop === "function"
    ) {

      window.TTSEngine.stop();

    }

    console.log(
      "Timeline stopped."
    );

  }

  /*
  ====================================================
  SANITIZE LINE
  ====================================================
  */

  function sanitizeLine(
    line
  ) {

    if (!line) {

      return "";

    }

    return line
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
  GETTERS
  ====================================================
  */

  function getCurrentSceneIndex() {

    return playbackState
      .currentSceneIndex;

  }

  function getCurrentLineIndex() {

    return playbackState
      .currentLineIndex;

  }

  /*
  ====================================================
  PUBLIC API
  ====================================================
  */

  return {

    start,

    stop,

    getCurrentSceneIndex,

    getCurrentLineIndex

  };

})();
