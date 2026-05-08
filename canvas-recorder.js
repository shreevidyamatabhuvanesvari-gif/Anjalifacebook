/*
====================================================
REEL CREATOR PRO
CANVAS RECORDER ENGINE
canvas-recorder.js
====================================================
*/

window.CanvasRecorder = (() => {

  /*
  ====================================================
  INTERNAL STATE
  ====================================================
  */

  let canvas = null;

  let ctx = null;

  let previewElement = null;

  let animationFrame = null;

  let mediaRecorder = null;

  let recordedChunks = [];

  let combinedStream = null;

  let canvasStream = null;

  let audioDestination = null;

  let audioContext = null;

  let watermark = "";

  let currentImage = null;

  let currentText = "";

  let speaking = false;

  let zoomScale = 1;

  let zoomDirection = 0.0004;

  /*
  ====================================================
  CANVAS SIZE
  ====================================================
  */

  const WIDTH = 1080;

  const HEIGHT = 1920;

  /*
  ====================================================
  INITIALIZE
  ====================================================
  */

  async function initialize(config) {

    canvas = config.canvas;

    previewElement =
      config.previewElement;

    watermark =
      config.watermark || "";

    /*
    ================================================
    CANVAS SETUP
    ================================================
    */

    canvas.width = WIDTH;

    canvas.height = HEIGHT;

    ctx = canvas.getContext("2d");

    /*
    ================================================
    PREVIEW CLEAN
    ================================================
    */

    previewElement.innerHTML = "";

    /*
    ================================================
    LIVE PREVIEW CANVAS
    ================================================
    */

    const previewCanvas =
      document.createElement("canvas");

    previewCanvas.width = WIDTH;

    previewCanvas.height = HEIGHT;

    previewCanvas.style.width = "100%";

    previewCanvas.style.height = "100%";

    previewCanvas.style.display = "block";

    previewElement.appendChild(previewCanvas);

    /*
    ================================================
    MIRROR CONTEXT
    ================================================
    */

    const previewCtx =
      previewCanvas.getContext("2d");

    /*
    ================================================
    CONTINUOUS RENDER LOOP
    ================================================
    */

    function renderLoop() {

      drawFrame(ctx);

      previewCtx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      previewCtx.drawImage(
        canvas,
        0,
        0
      );

      animationFrame =
        requestAnimationFrame(renderLoop);

    }

    renderLoop();

    /*
    ================================================
    AUDIO CONTEXT
    ================================================
    */

    setupAudioSystem();

  }

  /*
  ====================================================
  AUDIO SYSTEM
  ====================================================
  */

  function setupAudioSystem() {

    audioContext =
      new AudioContext();

    audioDestination =
      audioContext.createMediaStreamDestination();

  }

  /*
  ====================================================
  LOAD SCENE
  ====================================================
  */

  async function loadScene(config) {

    const imageURL =
      config.imageURL;

    currentImage =
      await loadImage(imageURL);

  }

  /*
  ====================================================
  LOAD IMAGE
  ====================================================
  */

  function loadImage(src) {

    return new Promise((resolve, reject) => {

      const img = new Image();

      img.onload = () => {

        resolve(img);

      };

      img.onerror = reject;

      img.src = src;

    });

  }

  /*
  ====================================================
  RENDER LINE
  ====================================================
  */

  async function renderLine(config) {

    currentText =
      config.text || "";

    /*
    ================================================
    TALKING EFFECT
    ================================================
    */

    speaking = true;

    setTimeout(() => {

      speaking = false;

    }, 300);

  }

  /*
  ====================================================
  DRAW FRAME
  ====================================================
  */

  function drawFrame(context) {

    /*
    ================================================
    CLEAR
    ================================================
    */

    context.clearRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    /*
    ================================================
    BACKGROUND
    ================================================
    */

    drawBackground(context);

    /*
    ================================================
    OVERLAY
    ================================================
    */

    drawOverlay(context);

    /*
    ================================================
    TEXT
    ================================================
    */

    drawText(context);

    /*
    ================================================
    WATERMARK
    ================================================
    */

    drawWatermark(context);

  }

  /*
  ====================================================
  DRAW BACKGROUND
  ====================================================
  */

  function drawBackground(context) {

    if (!currentImage) {

      context.fillStyle = "black";

      context.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      return;

    }

    /*
    ================================================
    BREATHING ZOOM
    ================================================
    */

    zoomScale += zoomDirection;

    if (
      zoomScale > 1.08 ||
      zoomScale < 1
    ) {

      zoomDirection *= -1;

    }

    const scaledWidth =
      WIDTH * zoomScale;

    const scaledHeight =
      HEIGHT * zoomScale;

    const x =
      (WIDTH - scaledWidth) / 2;

    const y =
      (HEIGHT - scaledHeight) / 2;

    context.drawImage(
      currentImage,
      x,
      y,
      scaledWidth,
      scaledHeight
    );

  }

  /*
  ====================================================
  DRAW OVERLAY
  ====================================================
  */

  function drawOverlay(context) {

    const gradient =
      context.createLinearGradient(
        0,
        0,
        0,
        HEIGHT
      );

    gradient.addColorStop(
      0,
      "rgba(0,0,0,0.15)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.75)"
    );

    context.fillStyle =
      gradient;

    context.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

  }

  /*
  ====================================================
  DRAW TEXT
  ====================================================
  */

  function drawText(context) {

    if (!currentText) {

      return;

    }

    /*
    ================================================
    TALKING GLOW
    ================================================
    */

    if (speaking) {

      context.shadowColor =
        "rgba(255,255,255,0.8)";

      context.shadowBlur = 30;

    } else {

      context.shadowBlur = 0;

    }

    /*
    ================================================
    TEXT STYLE
    ================================================
    */

    context.font =
      "bold 72px Arial";

    context.textAlign = "center";

    context.textBaseline = "middle";

    /*
    ================================================
    MULTICOLOR TEXT
    ================================================
    */

    const gradient =
      context.createLinearGradient(
        0,
        HEIGHT * 0.55,
        WIDTH,
        HEIGHT * 0.55
      );

    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      1,
      "#ffcc00"
    );

    context.fillStyle =
      gradient;

    /*
    ================================================
    WRAPPED TEXT
    ================================================
    */

    const lines =
      wrapText(
        context,
        currentText,
        WIDTH * 0.8
      );

    const lineHeight = 92;

    const startY =
      HEIGHT * 0.72 -
      ((lines.length - 1)
        * lineHeight) / 2;

    lines.forEach((line, index) => {

      context.fillText(
        line,
        WIDTH / 2,
        startY + (index * lineHeight)
      );

    });

  }

  /*
  ====================================================
  WRAP TEXT
  ====================================================
  */

  function wrapText(
    context,
    text,
    maxWidth
  ) {

    const words =
      text.split(" ");

    const lines = [];

    let currentLine = "";

    for (const word of words) {

      const testLine =
        currentLine + word + " ";

      const width =
        context.measureText(testLine).width;

      if (
        width > maxWidth &&
        currentLine !== ""
      ) {

        lines.push(
          currentLine.trim()
        );

        currentLine =
          word + " ";

      } else {

        currentLine =
          testLine;

      }

    }

    lines.push(
      currentLine.trim()
    );

    return lines;

  }

  /*
  ====================================================
  DRAW WATERMARK
  ====================================================
  */

  function drawWatermark(context) {

    if (!watermark) {

      return;

    }

    context.shadowBlur = 0;

    context.font =
      "36px Arial";

    context.fillStyle =
      "rgba(255,255,255,0.8)";

    context.textAlign =
      "center";

    context.fillText(
      watermark,
      WIDTH / 2,
      HEIGHT - 80
    );

  }

  /*
  ====================================================
  START RECORDING
  ====================================================
  */

  async function startRecording() {

    /*
    ================================================
    CANVAS VIDEO STREAM
    ================================================
    */

    canvasStream =
      canvas.captureStream(30);

    /*
    ================================================
    MERGED STREAM
    ================================================
    */

    combinedStream =
      new MediaStream();

    /*
    ================================================
    VIDEO TRACKS
    ================================================
    */

    canvasStream
      .getVideoTracks()
      .forEach(track => {

        combinedStream.addTrack(track);

      });

    /*
    ================================================
    AUDIO TRACKS
    ================================================
    */

    if (audioDestination) {

      audioDestination.stream
        .getAudioTracks()
        .forEach(track => {

          combinedStream.addTrack(track);

        });

    }

    /*
    ================================================
    MEDIA RECORDER
    ================================================
    */

    mediaRecorder =
      new MediaRecorder(
        combinedStream,
        {
          mimeType: "video/webm"
        }
      );

    recordedChunks = [];

    /*
    ================================================
    DATA AVAILABLE
    ================================================
    */

    mediaRecorder.ondataavailable =
      (event) => {

        if (
          event.data &&
          event.data.size > 0
        ) {

          recordedChunks.push(
            event.data
          );

        }

      };

    /*
    ================================================
    START
    ================================================
    */

    mediaRecorder.start();

    console.log(
      "Recording started."
    );

  }

  /*
  ====================================================
  STOP RECORDING
  ====================================================
  */

  async function stopRecording() {

    return new Promise((resolve) => {

      if (!mediaRecorder) {

        resolve(null);

        return;

      }

      mediaRecorder.onstop = () => {

        const blob =
          new Blob(
            recordedChunks,
            {
              type: "video/webm"
            }
          );

        resolve(blob);

      };

      mediaRecorder.stop();

      console.log(
        "Recording stopped."
      );

    });

  }

  /*
  ====================================================
  OPTIONAL SCENE TRANSITION
  ====================================================
  */

  async function playSceneTransition() {

    return new Promise((resolve) => {

      setTimeout(resolve, 400);

    });

  }

  /*
  ====================================================
  FINALIZE
  ====================================================
  */

  async function finalize() {

    speaking = false;

  }

  /*
  ====================================================
  PUBLIC API
  ====================================================
  */

  return {

    initialize,

    loadScene,

    renderLine,

    startRecording,

    stopRecording,

    playSceneTransition,

    finalize

  };

})();
