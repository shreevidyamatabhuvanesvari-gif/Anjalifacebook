/*
====================================================
REEL CREATOR PRO
FINAL STABLE CONTROLLER
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

    isPlaying: false,

    exportedBlob: null

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

  function initialize() {

    bindEvents();

    bindSceneEvents(
      document.querySelector(
        ".scene-card"
      )
    );

    syncScenes();

    console.log(
      "Reel Creator Pro Ready"
    );

  }

  /*
  ====================================================
  EVENTS
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

  }

  /*
  ====================================================
  ADD SCENE
  ====================================================
  */

  function addScene() {

    const totalScenes =
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
          Scene ${totalScenes}
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
  BIND SCENE EVENTS
  ====================================================
  */

  function bindSceneEvents(scene) {

    const imageInput =
      scene.querySelector(
        ".scene-image-input"
      );

    const previewImage =
      scene.querySelector(
        ".scene-preview img"
      );

    const textarea =
      scene.querySelector(
        ".scene-text-input"
      );

    const removeBtn =
      scene.querySelector(
        ".scene-remove-btn"
      );

    /*
    ================================================
    IMAGE CHANGE
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

        previewImage.src =
          URL.createObjectURL(file);

        syncScenes();

      }
    );

    /*
    ================================================
    TEXT CHANGE
    ================================================
    */

    textarea.addEventListener(
      "input",
      syncScenes
    );

    /*
    ================================================
    REMOVE
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

        updateSceneTitles();

        syncScenes();

      }
    );

  }

  /*
  ====================================================
  UPDATE TITLES
  ====================================================
  */

  function updateSceneTitles() {

    const scenes =
      sceneContainer.querySelectorAll(
        ".scene-card"
      );

    scenes.forEach(
      (scene, index) => {

        scene.querySelector(
          ".scene-title"
        ).textContent =
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

    AppState.scenes = [];

    const cards =
      sceneContainer.querySelectorAll(
        ".scene-card"
      );

    cards.forEach((card) => {

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

      const lines =
        splitLines(text);

      AppState.scenes.push({

        image: file,

        imageURL:
          file
            ? URL.createObjectURL(file)
            : "",

        text,

        lines

      });

    });

  }

  /*
  ====================================================
  SPLIT LINES
  ====================================================
  */

  function splitLines(text) {

    return text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

  }

  /*
  ====================================================
  VALIDATE
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
          "हर scene में फोटो आवश्यक है।"
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
          "Narration lines नहीं मिलीं।"
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

    /*
    ================================================
    DEPENDENCY CHECK
    ================================================
    */

    if (
      !window.CanvasRecorder
    ) {

      alert(
        "CanvasRecorder उपलब्ध नहीं है।"
      );

      return;

    }

    if (
      !window.TimelineEngine
    ) {

      alert(
        "TimelineEngine उपलब्ध नहीं है।"
      );

      return;

    }

    try {

      AppState.isPlaying = true;

      /*
      ================================================
      ENTER PLAYBACK MODE
      ================================================
      */

      document.body.classList.add(
        "playback-mode"
      );

      /*
      ================================================
      INIT RENDER ENGINE
      ================================================
      */

      await window.CanvasRecorder
        .initialize({

          canvas:
            renderCanvas,

          previewElement:
            cinematicPreview,

          watermark:
            watermarkInput.value.trim()

        });

      /*
      ================================================
      START RECORDING
      ================================================
      */

      await window.CanvasRecorder
        .startRecording();

      /*
      ================================================
      PLAY TIMELINE
      ================================================
      */

      /*
      IMPORTANT:
      TimelineEngine.start()
      MUST complete only after
      all scenes finish playback.
      */

      await window.TimelineEngine
        .start(
          AppState.scenes,
          voiceSelect.value
        );

      /*
      ================================================
      STOP RECORDING
      ================================================
      */

      const blob =
        await window.CanvasRecorder
          .stopRecording();

      /*
      ================================================
      SAVE EXPORT
      ================================================
      */

      AppState.exportedBlob =
        blob;

      /*
      ================================================
      AUTO DOWNLOAD
      ================================================
      */

      if (blob) {

        triggerDownload(blob);

      }

    } catch (error) {

      console.error(error);

      alert(
        "Playback failed."
      );

    } finally {

      AppState.isPlaying = false;

      document.body.classList.remove(
        "playback-mode"
      );

    }

  }

  /*
  ====================================================
  RESTART
  ====================================================
  */

  async function restartPlayback() {

    AppState.isPlaying = false;

    /*
    ================================================
    STOP TTS
    ================================================
    */

    if (
      window.speechSynthesis
    ) {

      speechSynthesis.cancel();

    }

    /*
    ================================================
    EXIT PLAYBACK MODE
    ================================================
    */

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
      !AppState.exportedBlob
    ) {

      alert(
        "डाउनलोड के लिए वीडियो उपलब्ध नहीं है।"
      );

      return;

    }

    triggerDownload(
      AppState.exportedBlob
    );

  }

  /*
  ====================================================
  TRIGGER DOWNLOAD
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
