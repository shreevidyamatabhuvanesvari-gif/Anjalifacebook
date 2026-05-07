/*
====================================================
REEL CREATOR PRO
MAIN APPLICATION CONTROLLER
script.js
====================================================
*/

/*
====================================================
DOM REFERENCES
====================================================
*/

const app = document.querySelector("#app");

const sceneContainer = document.querySelector("#sceneContainer");

const addSceneBtn = document.querySelector("#addSceneBtn");

const playBtn = document.querySelector("#playBtn");

const restartBtn = document.querySelector("#restartBtn");

const downloadBtn = document.querySelector("#downloadBtn");

const voiceSelect = document.querySelector("#voiceSelect");

const watermarkInput = document.querySelector("#watermarkInput");

const cinematicPreview = document.querySelector("#cinematicPreview");

const renderCanvas = document.querySelector("#renderCanvas");

/*
====================================================
APPLICATION STATE
====================================================
*/

const appState = {

  scenes: [],

  playback: {
    isPlaying: false,
    currentSceneIndex: 0,
    currentLineIndex: 0
  },

  voiceMode: "female",

  watermark: "",

  exportedVideoBlob: null

};

/*
====================================================
SCENE MODEL
====================================================
*/

function createSceneObject() {

  return {
    image: null,
    imageURL: "",
    text: "",
    lines: []
  };

}

/*
====================================================
DEFAULT SCENE
====================================================
*/

appState.scenes.push(
  createSceneObject()
);

/*
====================================================
SCENE CARD TEMPLATE
====================================================
*/

function createSceneCard(index) {

  const sceneCard = document.createElement("article");

  sceneCard.className = "scene-card";

  sceneCard.dataset.index = index;

  sceneCard.innerHTML = `
    
    <div class="scene-topbar">

      <div class="scene-title">
        Scene ${index + 1}
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

  attachSceneCardEvents(sceneCard);

  return sceneCard;

}

/*
====================================================
RENDER ALL SCENES
====================================================
*/

function renderScenes() {

  sceneContainer.innerHTML = "";

  appState.scenes.forEach((scene, index) => {

    const sceneCard = createSceneCard(index);

    const imageInput =
      sceneCard.querySelector(".scene-image-input");

    const textInput =
      sceneCard.querySelector(".scene-text-input");

    const previewImage =
      sceneCard.querySelector(".scene-preview img");

    textInput.value = scene.text;

    if (scene.imageURL) {

      previewImage.src = scene.imageURL;

    }

    sceneContainer.appendChild(sceneCard);

  });

}

/*
====================================================
ATTACH EVENTS
====================================================
*/

function attachSceneCardEvents(sceneCard) {

  const index =
    Number(sceneCard.dataset.index);

  const imageInput =
    sceneCard.querySelector(".scene-image-input");

  const textInput =
    sceneCard.querySelector(".scene-text-input");

  const removeBtn =
    sceneCard.querySelector(".scene-remove-btn");

  const previewImage =
    sceneCard.querySelector(".scene-preview img");

  /*
  ================================================
  IMAGE INPUT
  ================================================
  */

  imageInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const imageURL =
      URL.createObjectURL(file);

    appState.scenes[index].image = file;

    appState.scenes[index].imageURL = imageURL;

    previewImage.src = imageURL;

  });

  /*
  ================================================
  TEXT INPUT
  ================================================
  */

  textInput.addEventListener("input", (event) => {

    const text =
      event.target.value;

    appState.scenes[index].text = text;

    appState.scenes[index].lines =
      parseSceneLines(text);

  });

  /*
  ================================================
  REMOVE SCENE
  ================================================
  */

  removeBtn.addEventListener("click", () => {

    removeScene(index);

  });

}

/*
====================================================
LINE PARSER
====================================================
*/

function parseSceneLines(text) {

  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

}

/*
====================================================
ADD SCENE
====================================================
*/

function addScene() {

  const newScene =
    createSceneObject();

  appState.scenes.push(newScene);

  renderScenes();

}

/*
====================================================
REMOVE SCENE
====================================================
*/

function removeScene(index) {

  if (appState.scenes.length === 1) {

    alert("At least one scene is required.");

    return;

  }

  appState.scenes.splice(index, 1);

  renderScenes();

}

/*
====================================================
VALIDATE SCENES
====================================================
*/

function validateScenes() {

  if (appState.scenes.length === 0) {

    alert("No scenes available.");

    return false;

  }

  for (const scene of appState.scenes) {

    if (!scene.image) {

      alert("Every scene requires an image.");

      return false;

    }

    if (!scene.text.trim()) {

      alert("Every scene requires narration text.");

      return false;

    }

    if (scene.lines.length === 0) {

      alert("Narration lines missing.");

      return false;

    }

  }

  return true;

}

/*
====================================================
PLAYBACK MODE
====================================================
*/

function enablePlaybackMode() {

  document.body.classList.add(
    "playback-mode"
  );

}

function disablePlaybackMode() {

  document.body.classList.remove(
    "playback-mode"
  );

}

/*
====================================================
PLAYBACK START
====================================================
*/

async function startPlayback() {

  if (appState.playback.isPlaying) {

    return;

  }

  const valid =
    validateScenes();

  if (!valid) {

    return;

  }

  appState.playback.isPlaying = true;

  appState.playback.currentSceneIndex = 0;

  appState.playback.currentLineIndex = 0;

  appState.voiceMode =
    voiceSelect.value;

  appState.watermark =
    watermarkInput.value.trim();

  enablePlaybackMode();

  /*
  ================================================
  START RENDER ENGINE
  ================================================
  */

  if (
    window.CanvasRecorder &&
    typeof window.CanvasRecorder.initialize === "function"
  ) {

    await window.CanvasRecorder.initialize({
      canvas: renderCanvas,
      previewElement: cinematicPreview,
      watermark: appState.watermark
    });

  }

  /*
  ================================================
  START RECORDING
  ================================================
  */

  if (
    window.CanvasRecorder &&
    typeof window.CanvasRecorder.startRecording === "function"
  ) {

    await window.CanvasRecorder.startRecording();

  }

  /*
  ================================================
  START TIMELINE ENGINE
  ================================================
  */

  if (
    window.TimelineEngine &&
    typeof window.TimelineEngine.start === "function"
  ) {

    await window.TimelineEngine.start({
      scenes: appState.scenes,
      playbackState: appState.playback,
      voiceMode: appState.voiceMode
    });

  }

}

/*
====================================================
PLAYBACK COMPLETE
====================================================
*/

async function handlePlaybackComplete() {

  /*
  ================================================
  STOP RECORDING
  ================================================
  */

  if (
    window.CanvasRecorder &&
    typeof window.CanvasRecorder.stopRecording === "function"
  ) {

    const videoBlob =
      await window.CanvasRecorder.stopRecording();

    appState.exportedVideoBlob =
      videoBlob;

  }

  disablePlaybackMode();

  appState.playback.isPlaying = false;

  appState.playback.currentSceneIndex = 0;

  appState.playback.currentLineIndex = 0;

}

/*
====================================================
RESTART PLAYBACK
====================================================
*/

async function restartPlayback() {

  if (
    appState.playback.isPlaying
  ) {

    location.reload();

    return;

  }

}

/*
====================================================
DOWNLOAD VIDEO
====================================================
*/

function downloadVideo() {

  if (!appState.exportedVideoBlob) {

    alert("No exported video available.");

    return;

  }

  const url =
    URL.createObjectURL(
      appState.exportedVideoBlob
    );

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `reel-${Date.now()}.webm`;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

}

/*
====================================================
GLOBAL CALLBACKS
====================================================
*/

window.ReelCreatorApp = {

  appState,

  handlePlaybackComplete

};

/*
====================================================
BUTTON EVENTS
====================================================
*/

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
====================================================
INITIAL RENDER
====================================================
*/

renderScenes();
