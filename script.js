/*
====================================================
REEL CREATOR PRO
FINAL STABLE PLAYBACK CONTROLLER
script.js
====================================================
*/

(() => {

  const AppState = {

    scenes: [],

    isPlaying: false,

    currentBlob: null

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

    bindGlobalEvents();

    bindSceneEvents(
      document.querySelector(
        ".scene-card"
      )
    );

    syncScenes();

  }

  /*
  ====================================================
  EVENTS
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
          placeholder="Write narration..."
        ></textarea>

      </div>

      <div class="scene-preview">

        <img src="" />

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

    textInput.addEventListener(
      "input",
      syncScenes
    );

    removeBtn.addEventListener(
      "click",
      () => {

        if (
          sceneContainer.children.length <= 1
        ) {

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
  FINAL STABLE SPLITTER
  ====================================================
  */

  function splitLines(text) {

    if (!text) {

      return [];

    }

    const normalized =
      text
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const rawParts =
      normalized.split(/(?<=[।!?])/);

    const finalLines = [];

    rawParts.forEach((part) => {

      const cleaned =
        part
          .replace(/[,:;]+/g, "")
          .trim();

      if (!cleaned) {

        return;

      }

      if (cleaned.length <= 120) {

        finalLines.push(cleaned);

        return;

      }

      const words =
        cleaned.split(" ");

      let current = "";

      words.forEach((word) => {

        if (
          (current + word).length > 100
        ) {

          finalLines.push(
            current.trim()
          );

          current =
            word + " ";

        }

        else {

          current +=
            word + " ";

        }

      });

      if (current.trim()) {

        finalLines.push(
          current.trim()
        );

      }

    });

    return finalLines;

  }

  /*
  ====================================================
  START PLAYBACK
  ====================================================
  */

  async function startPlayback() {

    if (AppState.isPlaying) {

      return;

    }

    syncScenes();

    AppState.isPlaying = true;

    try {

      await window.CanvasRecorder
        .initialize({

          canvas:
            renderCanvas,

          previewElement:
            cinematicPreview,

          watermark:
            watermarkInput.value.trim()

        });

      for (
        let sceneIndex = 0;
        sceneIndex < AppState.scenes.length;
        sceneIndex++
      ) {

        const scene =
          AppState.scenes[
            sceneIndex
          ];

        await window.CanvasRecorder
          .loadScene(scene);

        await wait(700);

        for (
          let lineIndex = 0;
          lineIndex < scene.lines.length;
          lineIndex++
        ) {

          const line =
            scene.lines[
              lineIndex
            ];

          await window.CanvasRecorder
            .renderLine({

              text: line

            });

          await wait(450);

          await window.TTSEngine
            .speak({

              text: line,

              voiceMode:
                voiceSelect.value

            });

          await wait(900);

        }

        await wait(1200);

      }

    } catch (error) {

      console.error(error);

    }

    AppState.isPlaying = false;

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

    if (
      window.TTSEngine
    ) {

      window.TTSEngine.stop();

    }

  }

  /*
  ====================================================
  DOWNLOAD
  ====================================================
  */

  function manualDownload() {}

})();
