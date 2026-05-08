/*
====================================================
REEL CREATOR PRO
FINAL PRODUCTION CONTROLLER
script.js
====================================================
*/

(() => {

  /*
  ====================================================
  APPLICATION STATE
  ====================================================
  */

  const AppState = {

    scenes: [],

    playbackState: "idle",

    isPlaying: false,

    currentBlob: null

  };

  /*
  ====================================================
  DOM REFERENCES
  ====================================================
  */

  const sceneContainer =
    document.getElementById(
      "sceneContainer"
    );

  const addSceneBtn =
    document.getElementById(
      "addSceneBtn"
    );

  const playBtn =
    document.getElementById(
      "playBtn"
    );

  const restartBtn =
    document.getElementById(
      "restartBtn"
    );

  const downloadBtn =
    document.getElementById(
      "downloadBtn"
    );

  const voiceSelect =
    document.getElementById(
      "voiceSelect"
    );

  const watermarkInput =
    document.getElementById(
      "watermarkInput"
    );

  const cinematicPreview =
    document.getElementById(
      "cinematicPreview"
    );

  const renderCanvas =
    document.getElementById(
      "renderCanvas"
    );

  /*
  ====================================================
  INITIALIZE
  ====================================================
  */

  initialize();

  /*
  ====================================================
  INITIALIZE APP
  ====================================================
  */

  function initialize() {

    bindEvents();

    syncScenes();

    console.log(
      "Reel Creator Pro Initialized"
    );

  }

  /*
  ====================================================
  EVENT BINDINGS
  ====================================================
  */

  function bindEvents() {

    addSceneBtn.addEventListener(
      "click",
      addScene
    );

    playBtn.addEventListener(
      "click",
      startPlayback
    );

    restartBtn.addEventListener(
      "click",
      restartPlayback
    );

    downloadBtn.addEventListener(
      "click",
      downloadVideo
    );

    /*
    ================================================
    DEFAULT SCENE EVENTS
    ================================================
    */

    bindSceneEvents(
      document.querySelector(
        ".scene-card"
      )
    );

  }

  /*
  ====================================================
  ADD NEW SCENE
  ====================================================
  */

  function addScene() {

    const sceneIndex =
      sceneContainer.children.length + 1;

    const scene =
      document.createElement(
        "article"
      );

    scene.className =
      "scene-card";

    scene.innerHTML = `

      <div class="scene-topbar">

        <div class="scene-title">
          Scene ${sceneIndex}
        </div>

        <button
          type="button"
          class="scene-remove-btn"
        >
          Remove
        </button>

      </div>

      <div class="scene-field">

        <label>
          Upload Photo
        </label>

        <input
          type="file"
          accept="image/*"
          class="scene-image-input"
        />

      </div>

      <div class="scene-field">

        <label>
          Scene Narration
        </label>

        <textarea
          class="scene-text-input"
          placeholder="Write cinematic narration..."
        ></textarea>

      </div>

      <div class="scene-preview">

        <img
          src=""
          alt="Scene Preview"
        />

      </div>

    `;

    sceneContainer.appendChild(
      scene
    );

    bindSceneEvents(scene);

    syncScenes();

  }

  /*
  ====================================================
  SCENE EVENTS
  ====================================================
  */

  function bindSceneEvents(scene) {

    const imageInput =
      scene.querySelector(
        ".scene-image-input"
      );

    const removeBtn =
      scene.querySelector(
        ".scene-remove-btn"
      );

    const previewImage =
      scene.querySelector(
        ".scene-preview img"
      );

    /*
    ================================================
    IMAGE PREVIEW
    ================================================
    */

    imageInput.addEventListener(
      "change",
      (event) => {

        const file =
          event.target.files[0];

        if (!file) {

          return;

        }

        const imageURL =
          URL.createObjectURL(file);

        previewImage.src =
          imageURL;

        syncScenes();

      }
    );

    /*
    ================================================
    REMOVE SCENE
    ================================================
    */

    removeBtn.addEventListener(
      "click",
      () => {

        if (
          sceneContainer.children.length <= 1
        ) {

          alert(
            "कम से कम एक scene आवश्यक है।"
          );

          return;

        }

        scene.remove();

        reindexScenes();

        syncScenes();

      }
    );

    /*
    ================================================
    TEXT CHANGE
    ================================================
    */

    const textarea =
      scene.querySelector(
        ".scene-text-input"
      );

    textarea.addEventListener(
      "input",
      syncScenes
    );

  }

  /*
  ====================================================
  REINDEX SCENES
  ====================================================
  */

  function reindexScenes() {

    const scenes =
      sceneContainer.querySelectorAll(
        ".scene-card"
      );

    scenes.forEach(
      (scene, index) => {

        const title =
          scene.querySelector(
            ".scene-title"
          );

        title.textContent =
          `Scene ${index + 1}`;

      }
    );

  }

  /*
  ====================================================
  SYNC SCENES
  ====================================================
  */

  function syncScenes() {

    const sceneCards =
      sceneContainer.querySelectorAll(
        ".scene-card"
      );

    AppState.scenes = [];

    sceneCards.forEach((card) => {

      const imageInput =
        card.querySelector(
          ".scene-image-input"
        );

      const textarea =
        card.querySelector(
          ".scene-text-input"
        );

      const file =
        imageInput.files[0];

      const text =
        textarea.value.trim();

      const imageURL =
        file
          ? URL.createObjectURL(file)
          : "";

      const lines =
        parseLines(text);

      AppState.scenes.push({

        image: file,

        imageURL,

        text,

        lines

      });

    });

  }

  /*
  ====================================================
  PARSE LINES
  ====================================================
  */

  function parseLines(text) {

    return text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

  }

  /*
  ====================================================
  VALIDATE SCENES
  ====================================================
  */

  function validateScenes() {

    if (
      !AppState.scenes.length
    ) {

      alert(
        "कोई scene उपलब्ध नहीं है।"
      );

      return false;

    }

    for (const scene of AppState.scenes) {

      if (!scene.image) {

        alert(
          "हर scene में image आवश्यक है।"
        );

        return false;

      }

      if (!scene.text) {

        alert(
          "हर scene में narration आवश्यक है।"
        );

        return false;

      }

      if (!scene.lines.length) {

        alert(
          "Narration parsing failed."
        );

        return false;

      }

    }

    return true;

  }

  /*
  ====================================================
  START PLAYBACK
  ====================================================
  */

  async function startPlayback() {

    if (
      AppState.isPlaying
    ) {

      return;

    }

    syncScenes();

    const valid =
      validateScenes();

    if (!valid) {

      return;

    }

    try {

      AppState.isPlaying = true;

      AppState.playbackState =
        "loading";

      /*
      ================================================
      FULLSCREEN PLAYBACK
      ================================================
      */

      document.body.classList.add(
        "playback-mode"
      );

      /*
      ================================================
      INITIALIZE RENDER ENGINE
      ================================================
      */

      await window.CanvasRecorder
        .initialize({

          canvas: renderCanvas,

          previewElement:
            cinematicPreview,

          watermark:
            watermarkInput.value.trim()

        });

      /*
      ================================================
      RECORDING START
      ================================================
      */

      await window.CanvasRecorder
        .startRecording();

      /*
      ================================================
      TIMELINE START
      ================================================
      */

      AppState.playbackState =
        "playing";

      await window.TimelineEngine
        .start({

          scenes:
            AppState.scenes,

          voiceMode:
            voiceSelect.value

        });

      /*
      ================================================
      FINALIZE
      ================================================
      */

      AppState.playbackState =
        "exporting";

      const blob =
        await window.CanvasRecorder
          .stopRecording();

      AppState.currentBlob =
        blob;

      await window.CanvasRecorder
        .finalize();

      AppState.playbackState =
        "completed";

      AppState.isPlaying = false;

      /*
      ================================================
      AUTO DOWNLOAD
      ================================================
      */

      if (blob) {

        triggerDownload(blob);

      }

      /*
      ================================================
      EXIT PLAYBACK MODE
      ================================================
      */

      document.body.classList.remove(
        "playback-mode"
      );

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Playback failed."
      );

      AppState.isPlaying = false;

      AppState.playbackState =
        "idle";

      document.body.classList.remove(
        "playback-mode"
      );

    }

  }

  /*
  ====================================================
  RESTART PLAYBACK
  ====================================================
  */

  async function restartPlayback() {

    if (
      AppState.isPlaying
    ) {

      try {

        window.TTSEngine.stop();

        await window.CanvasRecorder
          .finalize();

      } catch (error) {

        console.error(error);

      }

    }

    AppState.isPlaying = false;

    AppState.playbackState =
      "idle";

    document.body.classList.remove(
      "playback-mode"
    );

    console.log(
      "Playback restarted."
    );

  }

  /*
  ====================================================
  DOWNLOAD VIDEO
  ====================================================
  */

  function downloadVideo() {

    if (
      !AppState.currentBlob
    ) {

      alert(
        "डाउनलोड के लिए कोई वीडियो उपलब्ध नहीं है।"
      );

      return;

    }

    triggerDownload(
      AppState.currentBlob
    );

  }

  /*
  ====================================================
  DOWNLOAD TRIGGER
  ====================================================
  */

  function triggerDownload(blob) {

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `reel-${Date.now()}.webm`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

  }

})();
