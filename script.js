/*
====================================================
REEL CREATOR PRO
STABLE PLAYBACK CONTROLLER
script.js
====================================================
*/

(() => {

  /*
  ====================================================
  STATE
  ====================================================
  */

  const AppState = {

    scenes: [],

    isPlaying: false,

    exportedBlob: null

  };

  /*
  ====================================================
  DOM
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
  INIT
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
      "Application Ready"
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
      manualDownload
    );

  }

  /*
  ====================================================
  ADD SCENE
  ====================================================
  */

  function addScene() {

    const total =
      sceneContainer.children.length + 1;

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "scene-card";

    card.innerHTML = `

      <div class="scene-topbar">

        <div class="scene-title">
          Scene ${total}
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
      card
    );

    bindSceneEvents(card);

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

    textarea.addEventListener(
      "input",
      syncScenes
    );

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

      AppState.scenes.push({

        image: file,

        imageURL:
          file
            ? URL.createObjectURL(file)
            : "",

        text,

        lines:
          splitLines(text)

      });

    });

  }

  /*
  ====================================================
  SPLIT
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

    }

    return true;

  }

  /*
  ====================================================
  PLAYBACK
  ====================================================
  */

  async function startPlayback() {

    if (
      AppState.isPlaying
    ) {

      return;

    }

    syncScenes();

    if (!validateScenes()) {

      return;

    }

    try {

      AppState.isPlaying = true;

      /*
      ================================================
      FULLSCREEN
      ================================================
      */

      document.body.classList.add(
        "playback-mode"
      );

      /*
      ================================================
      INIT RENDER
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
      RECORD START
      ================================================
      */

      await window.CanvasRecorder
        .startRecording();

      /*
      ================================================
      TIMELINE
      ================================================
      */

      /*
      IMPORTANT:
      TimelineEngine controls playback lifecycle.
      */

      await window.TimelineEngine
        .start(
          AppState.scenes,
          voiceSelect.value
        );

      /*
      DO NOT FORCE EXPORT HERE
      */

    } catch (error) {

      console.error(error);

      alert(
        "Playback failed."
      );

      AppState.isPlaying = false;

      document.body.classList.remove(
        "playback-mode"
      );

    }

  }

  /*
  ====================================================
  COMPLETE EXPORT
  ====================================================
  */

  window.completeReelExport =
    async function () {

      try {

        const blob =
          await window.CanvasRecorder
            .stopRecording();

        AppState.exportedBlob =
          blob;

        if (blob) {

          triggerDownload(blob);

        }

      } catch (error) {

        console.error(error);

      } finally {

        AppState.isPlaying = false;

        document.body.classList.remove(
          "playback-mode"
        );

      }

    };

  /*
  ====================================================
  RESTART
  ====================================================
  */

  function restartPlayback() {

    AppState.isPlaying = false;

    document.body.classList.remove(
      "playback-mode"
    );

    if (
      window.speechSynthesis
    ) {

      speechSynthesis.cancel();

    }

  }

  /*
  ====================================================
  MANUAL DOWNLOAD
  ====================================================
  */

  function manualDownload() {

    if (
      !AppState.exportedBlob
    ) {

      alert(
        "कोई exported वीडियो उपलब्ध नहीं है।"
      );

      return;

    }

    triggerDownload(
      AppState.exportedBlob
    );

  }

  /*
  ====================================================
  DOWNLOAD
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
