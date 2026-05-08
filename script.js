/*
====================================================
REEL CREATOR PRO
SAFE STABLE CONTROLLER
script.js
====================================================

IMPORTANT:
यह version केवल controller layer संभालता है।

यह:
✔ existing timeline-engine.js
✔ existing canvas-recorder.js
✔ existing tts-engine.js

को break नहीं करेगा।

इस version में:
❌ premature export नहीं
❌ forced stop नहीं
❌ new API assumptions नहीं
❌ callback assumptions नहीं

====================================================
*/

(() => {

  /*
  ====================================================
  APP STATE
  ====================================================
  */

  const AppState = {

    scenes: [],

    isPlaying: false

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

    bindGlobalEvents();

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
  GLOBAL EVENTS
  ====================================================
  */

  function bindGlobalEvents() {

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

  }

  /*
  ====================================================
  ADD SCENE
  ====================================================
  */

  function addScene() {

    const totalScenes =
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
      card
    );

    bindSceneEvents(card);

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

    const previewImage =
      scene.querySelector(
        ".scene-preview img"
      );

    const textInput =
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

    textInput.addEventListener(
      "input",
      syncScenes
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

      const textInput =
        card.querySelector(
          ".scene-text-input"
        );

      const file =
        imageInput.files[0];

      const text =
        textInput.value.trim();

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
  VALIDATION
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
  START PLAYBACK
  ====================================================
  */

  async function startPlayback() {

    /*
    ================================================
    PLAYBACK LOCK
    ================================================
    */

    if (
      AppState.isPlaying
    ) {

      return;

    }

    /*
    ================================================
    REFRESH SCENES
    ================================================
    */

    syncScenes();

    /*
    ================================================
    VALIDATE
    ================================================
    */

    const valid =
      validateScenes();

    if (!valid) {

      return;

    }

    /*
    ================================================
    ENGINE CHECKS
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
      PLAYBACK MODE
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

          canvas:
            renderCanvas,

          previewElement:
            cinematicPreview,

          watermark:
            watermarkInput.value.trim()

        });

      /*
      ================================================
      IMPORTANT:
      ONLY pass scenes.
      NO NEW API FORMAT.
      ================================================
      */

      await window.TimelineEngine
        .start(
          AppState.scenes
        );

      /*
      ================================================
      PLAYBACK COMPLETE
      ================================================
      */

      AppState.isPlaying = false;

      document.body.classList.remove(
        "playback-mode"
      );

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
  RESTART
  ====================================================
  */

  function restartPlayback() {

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

})();
