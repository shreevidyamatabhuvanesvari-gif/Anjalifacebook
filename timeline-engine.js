/*
====================================================
REEL CREATOR PRO
TIMELINE ENGINE
timeline-engine.js
====================================================
*/

window.TimelineEngine = (() => {

  /*
  ====================================================
  INTERNAL STATE
  ====================================================
  */

  let scenes = [];

  let playbackState = null;

  let voiceMode = "female";

  let isRunning = false;

  /*
  ====================================================
  PUBLIC START
  ====================================================
  */

  async function start(config) {

    scenes = config.scenes || [];

    playbackState =
      config.playbackState;

    voiceMode =
      config.voiceMode || "female";

    if (!scenes.length) {

      console.error(
        "TimelineEngine: No scenes found."
      );

      return;

    }

    isRunning = true;

    await runTimeline();

  }

  /*
  ====================================================
  MAIN TIMELINE LOOP
  ====================================================
  */

  async function runTimeline() {

    for (
      let sceneIndex = 0;
      sceneIndex < scenes.length;
      sceneIndex++
    ) {

      if (!isRunning) {

        return;

      }

      playbackState.currentSceneIndex =
        sceneIndex;

      playbackState.currentLineIndex = 0;

      const scene =
        scenes[sceneIndex];

      await playScene(
        scene,
        sceneIndex
      );

    }

    await completePlayback();

  }

  /*
  ====================================================
  PLAY SINGLE SCENE
  ====================================================
  */

  async function playScene(
    scene,
    sceneIndex
  ) {

    /*
    ================================================
    LOAD SCENE INTO RENDER ENGINE
    ================================================
    */

    await loadSceneIntoRenderer(
      scene,
      sceneIndex
    );

    /*
    ================================================
    PLAY ALL LINES
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
        scene.lines[lineIndex];

      await playLine(
        line,
        scene,
        sceneIndex,
        lineIndex
      );

    }

    /*
    ================================================
    SCENE COMPLETE
    ================================================
    */

    await handleSceneComplete(
      scene,
      sceneIndex
    );

  }

  /*
  ====================================================
  PLAY SINGLE LINE
  ====================================================
  */

  async function playLine(
    line,
    scene,
    sceneIndex,
    lineIndex
  ) {

    /*
    ================================================
    RENDER ACTIVE LINE
    ================================================
    */

    await renderLine({
      line,
      scene,
      sceneIndex,
      lineIndex
    });

    /*
    ================================================
    SPEAK LINE
    ================================================
    */

    await speakLine(line);

  }

  /*
  ====================================================
  LOAD SCENE
  ====================================================
  */

  async function loadSceneIntoRenderer(
    scene,
    sceneIndex
  ) {

    if (
      !window.CanvasRecorder ||
      typeof window.CanvasRecorder.loadScene !== "function"
    ) {

      console.warn(
        "CanvasRecorder.loadScene missing."
      );

      return;

    }

    await window.CanvasRecorder.loadScene({
      imageURL: scene.imageURL,
      sceneIndex
    });

  }

  /*
  ====================================================
  RENDER LINE
  ====================================================
  */

  async function renderLine(data) {

    if (
      !window.CanvasRecorder ||
      typeof window.CanvasRecorder.renderLine !== "function"
    ) {

      console.warn(
        "CanvasRecorder.renderLine missing."
      );

      return;

    }

    await window.CanvasRecorder.renderLine({
      text: data.line,
      sceneIndex: data.sceneIndex,
      lineIndex: data.lineIndex
    });

  }

  /*
  ====================================================
  SPEAK LINE
  ====================================================
  */

  async function speakLine(line) {

    if (
      !window.TTSEngine ||
      typeof window.TTSEngine.speak !== "function"
    ) {

      console.warn(
        "TTSEngine.speak missing."
      );

      return;

    }

    await window.TTSEngine.speak({
      text: line,
      voiceMode
    });

  }

  /*
  ====================================================
  SCENE COMPLETE
  ====================================================
  */

  async function handleSceneComplete(
    scene,
    sceneIndex
  ) {

    /*
    ================================================
    OPTIONAL SCENE TRANSITION
    ================================================
    */

    if (
      window.CanvasRecorder &&
      typeof window.CanvasRecorder.playSceneTransition === "function"
    ) {

      await window.CanvasRecorder.playSceneTransition({
        sceneIndex
      });

    }

  }

  /*
  ====================================================
  COMPLETE PLAYBACK
  ====================================================
  */

  async function completePlayback() {

    isRunning = false;

    /*
    ================================================
    FINALIZE CANVAS
    ================================================
    */

    if (
      window.CanvasRecorder &&
      typeof window.CanvasRecorder.finalize === "function"
    ) {

      await window.CanvasRecorder.finalize();

    }

    /*
    ================================================
    NOTIFY APP
    ================================================
    */

    if (
      window.ReelCreatorApp &&
      typeof window.ReelCreatorApp
        .handlePlaybackComplete === "function"
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
    STOP ACTIVE TTS
    ================================================
    */

    if (
      window.TTSEngine &&
      typeof window.TTSEngine.stop === "function"
    ) {

      window.TTSEngine.stop();

    }

  }

  /*
  ====================================================
  GETTERS
  ====================================================
  */

  function getCurrentSceneIndex() {

    return playbackState
      ?.currentSceneIndex || 0;

  }

  function getCurrentLineIndex() {

    return playbackState
      ?.currentLineIndex || 0;

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
