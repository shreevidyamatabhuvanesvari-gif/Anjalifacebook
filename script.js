/*
====================================================
REEL CREATOR PRO
FINAL PLAYBACK CONTROLLER
script.js
====================================================

Responsibilities:

✔ Scene Management
✔ Scene Playback
✔ Scene Sequencing
✔ Line Rendering
✔ TTS Synchronization
✔ Fullscreen Playback
✔ Recording Lifecycle
✔ Auto Export
✔ Auto Download

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
  INIT
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

  if (!text) {

    return [];

  }

  /*
  ================================================
  NORMALIZE
  ================================================
  */

  const normalized =
    text
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  /*
  ================================================
  SPLIT BY HINDI SEMANTIC PUNCTUATION
  ================================================
  */

  const parts =
    normalized.match(
      /[^।!?]+[।!?]?|[^,]+,/g
    );

  if (!parts) {

    return [normalized];

  }

  /*
  ================================================
  CLEAN
  ================================================
  */

  return parts
    .map(part => {

      return part
        .replace(/,+$/, "")
        .trim();

    })
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
      INIT CANVAS ENGINE
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
      PLAY ALL SCENES
      ================================================
      */

      for (
        let sceneIndex = 0;
        sceneIndex < AppState.scenes.length;
        sceneIndex++
      ) {

        const scene =
          AppState.scenes[
            sceneIndex
          ];

        /*
        ==============================================
        LOAD SCENE IMAGE
        ==============================================
        */

        await window.CanvasRecorder
          .loadScene(scene);

        /*
        ==============================================
        PLAY LINES
        ==============================================
        */

        for (
          let lineIndex = 0;
          lineIndex < scene.lines.length;
          lineIndex++
        ) {

          const line =
            scene.lines[
              lineIndex
            ];

          /*
          ============================================
          RENDER LINE
          ============================================
          */

          await window.CanvasRecorder
            .renderLine({

              text: line

            });

          /*
          ============================================
          TTS SPEAK
          ============================================
          */

          if (
            window.TTSEngine &&
            window.TTSEngine.speak
          ) {

            await window.TTSEngine
              .speak({

                text: line,

                voiceMode:
                  voiceSelect.value

              });

          } else {

            /*
            ==========================================
            FALLBACK DELAY
            ==========================================
            */

            await wait(2500);

          }

        }

        /*
        ==============================================
        SCENE TRANSITION
        ==============================================
        */

        if (
          window.CanvasRecorder
            .playSceneTransition
        ) {

          await window.CanvasRecorder
            .playSceneTransition();

        }

      }

      /*
      ================================================
      STOP RECORDING
      ================================================
      */

      const blob =
        await window.CanvasRecorder
          .stopRecording();

      AppState.currentBlob =
        blob;

      /*
      ================================================
      FINALIZE ENGINE
      ================================================
      */

      if (
        window.CanvasRecorder
          .finalize
      ) {

        await window.CanvasRecorder
          .finalize();

      }

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
    FINALIZE
    ================================================
    */

    if (
      window.CanvasRecorder &&
      window.CanvasRecorder.finalize
    ) {

      await window.CanvasRecorder
        .finalize();

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
  MANUAL DOWNLOAD
  ====================================================
  */

  function manualDownload() {

    if (
      !AppState.currentBlob
    ) {

      alert(
        "कोई exported वीडियो उपलब्ध नहीं है।"
      );

      return;

    }

    triggerDownload(
      AppState.currentBlob
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
