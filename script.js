/*
====================================================
REEL CREATOR PRO
FINAL STABLE PLAYBACK CONTROLLER
script.js
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

    const firstScene =
      document.querySelector(
        ".scene-card"
      );

    if (firstScene) {

      bindSceneEvents(
        firstScene
      );

    }

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
          placeholder="Write narration..."
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
  FINAL STABLE LINE SPLITTER
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
    SPLIT BY HINDI SENTENCE
    ================================================
    */

    const sentenceParts =
      normalized.split(
        /(?<=[।!?])/
      );

    const finalLines = [];

    sentenceParts.forEach((part) => {

      /*
      ==============================================
      REMOVE PUNCTUATION
      ==============================================
      */

      const cleaned =
        part
          .replace(/[,:;]/g, "")
          .trim();

      if (!cleaned) {

        return;

      }

      /*
      ==============================================
      SHORT SAFE
      ==============================================
      */

      if (
        cleaned.length <= 120
      ) {

        finalLines.push(
          cleaned
        );

        return;

      }

      /*
      ==============================================
      LONG TEXT SAFE SPLIT
      ==============================================
      */

      const words =
        cleaned.split(" ");

      let current =
        "";

      words.forEach((word) => {

        if (
          (
            current + word
          ).length > 100
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

      if (
        current.trim()
      ) {

        finalLines.push(
          current.trim()
        );

      }

    });

    return finalLines;

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

    for (
      const scene
      of AppState.scenes
    ) {

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

      AppState.isPlaying =
        true;

      /*
      ================================================
      ENABLE PLAYBACK MODE
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
      LOOP SCENES
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
        LOAD IMAGE
        ==============================================
        */

        await window.CanvasRecorder
          .loadScene(scene);

        await wait(700);

        /*
        ==============================================
        LOOP LINES
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
          DISPLAY TEXT
          ============================================
          */

          await window.CanvasRecorder
            .renderLine({

              text: line

            });

          /*
          ============================================
          SMALL RENDER BUFFER
          ============================================
          */

          await wait(450);

          /*
          ============================================
          SPEAK
          ============================================
          */

          if (
            window.TTSEngine &&
            typeof window.TTSEngine.speak ===
            "function"
          ) {

            await window.TTSEngine
              .speak({

                text: line,

                voiceMode:
                  voiceSelect.value

              });

          }

          /*
          ============================================
          LINE BUFFER
          ============================================
          */

          await wait(900);

        }

        /*
        ==============================================
        SCENE TRANSITION
        ==============================================
        */

        await wait(1200);

      }

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Playback failed."
      );

    }

    finally {

      AppState.isPlaying =
        false;

      /*
      ================================================
      DISABLE PLAYBACK MODE
      ================================================
      */

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
  RESTART PLAYBACK
  ====================================================
  */

  async function restartPlayback() {

    AppState.isPlaying =
      false;

    /*
    ================================================
    STOP TTS
    ================================================
    */

    if (
      window.TTSEngine &&
      typeof window.TTSEngine.stop ===
      "function"
    ) {

      window.TTSEngine.stop();

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
  DOWNLOAD
  ====================================================
  */

  function manualDownload() {

    if (
      !AppState.currentBlob
    ) {

      return;

    }

    triggerDownload(
      AppState.currentBlob
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

    link.href =
      url;

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
