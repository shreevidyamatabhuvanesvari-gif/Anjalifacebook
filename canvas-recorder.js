/*
====================================================
REEL CREATOR PRO
CANVAS RECORDER ENGINE
UPDATED PRODUCTION VERSION
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

  let previewCanvas = null;

  let previewCtx = null;

  let animationFrame = null;

  let mediaRecorder = null;

  let recordedChunks = [];

  let canvasStream = null;

  let combinedStream = null;

  let audioContext = null;

  let audioDestination = null;

  let currentImage = null;

  let currentText = "";

  let watermark = "";

  let speaking = false;

  let zoomScale = 1;

  let zoomDirection = 0.00025;

  /*
  ====================================================
  FINAL CINEMATIC SIZE
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
    MAIN RENDER CANVAS
    ================================================
    */

    canvas.width = WIDTH;

    canvas.height = HEIGHT;

    ctx = canvas.getContext("2d");

    /*
    ================================================
    CLEAN PREVIEW
    ================================================
    */

    previewElement.innerHTML = "";

    /*
    ================================================
    LIVE PREVIEW CANVAS
    ================================================
    */

    previewCanvas =
      document.createElement("canvas");

    previewCanvas.width = WIDTH;

    previewCanvas.height = HEIGHT;

    previewCanvas.style.width = "100vw";

    previewCanvas.style.height = "100vh";

    previewCanvas.style.objectFit = "contain";

    previewCanvas.style.background = "black";

    previewCanvas.style.display = "block";

    previewElement.appendChild(previewCanvas);

    previewCtx =
      previewCanvas.getContext("2d");

    /*
    ================================================
    AUDIO SYSTEM
    ================================================
    */

    setupAudioSystem();

    /*
    ================================================
    START RENDER LOOP
    ================================================
    */

    startRenderLoop();

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
      audioContext
        .createMediaStreamDestination();

  }

  /*
  ====================================================
  START LOOP
  ====================================================
  */

  function startRenderLoop() {

    function loop() {

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
        requestAnimationFrame(loop);

    }

    loop();

  }

  /*
  ====================================================
  LOAD SCENE
  ====================================================
  */

  async function loadScene(config) {

    currentImage =
      await loadImage(
        config.imageURL
      );

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

    speaking = true;

    setTimeout(() => {

      speaking = false;

    }, 500);

  }

  /*
  ====================================================
  DRAW FRAME
  ====================================================
  */

  function drawFrame(context) {

    context.clearRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    drawBackground(context);

    drawOverlay(context);

    drawText(context);

  }

  /*
  ====================================================
  FULL IMAGE FIT
  NO CROPPING
  ====================================================
  */

  function drawBackground(context) {

    /*
    ================================================
    BLACK BACKGROUND
    ================================================
    */

    context.fillStyle = "black";

    context.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    if (!currentImage) {

      return;

    }

    /*
    ================================================
    BREATHING ANIMATION
    ================================================
    */

    zoomScale += zoomDirection;

    if (
      zoomScale > 1.025 ||
      zoomScale < 1
    ) {

      zoomDirection *= -1;

    }

    /*
    ================================================
    IMAGE DIMENSIONS
    ================================================
    */

    const imageWidth =
      currentImage.width;

    const imageHeight =
      currentImage.height;

    /*
    ================================================
    SAFE CONTAIN FIT
    ================================================
    */

    const imageRatio =
      imageWidth / imageHeight;

    const canvasRatio =
      WIDTH / HEIGHT;

    let drawWidth;

    let drawHeight;

    if (imageRatio > canvasRatio) {

      drawWidth = WIDTH;

      drawHeight =
        WIDTH / imageRatio;

    } else {

      drawHeight = HEIGHT;

      drawWidth =
        HEIGHT * imageRatio;

    }

    /*
    ================================================
    APPLY CINEMATIC ZOOM
    ================================================
    */

    drawWidth *= zoomScale;

    drawHeight *= zoomScale;

    /*
    ================================================
    CENTER POSITION
    ================================================
    */

    const x =
      (WIDTH - drawWidth) / 2;

    const y =
      (HEIGHT - drawHeight) / 2;

    /*
    ================================================
    DRAW IMAGE
    ================================================
    */

    context.drawImage(
      currentImage,
      x,
      y,
      drawWidth,
      drawHeight
    );

  }

  /*
  ====================================================
  CINEMATIC OVERLAY
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
      "rgba(0,0,0,0.12)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.68)"
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
  CENTER MULTICOLOR TEXT
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
        "rgba(255,255,255,0.9)";

      context.shadowBlur = 40;

    } else {

      context.shadowBlur = 0;

    }

    /*
    ================================================
    TEXT STYLE
    ================================================
    */

    context.textAlign = "center";

    context.textBaseline = "middle";

    context.font =
      "bold 74px Arial";

    /*
    ================================================
    MULTICOLOR GRADIENT
    ================================================
    */

    const gradient =
      context.createLinearGradient(
        0,
        HEIGHT / 2,
        WIDTH,
        HEIGHT / 2
      );

    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      0.5,
      "#ffcc00"
    );

    gradient.addColorStop(
      1,
      "#ff4d6d"
    );

    context.fillStyle =
      gradient;

    /*
    ================================================
    WRAP TEXT
    ================================================
    */

    const lines =
      wrapText(
        context,
        currentText,
        WIDTH * 0.78
      );

    const lineHeight = 96;

    const totalHeight =
      lines.length * lineHeight;

    /*
    ================================================
    TRUE CENTER
    ================================================
    */

    const startY =
      (HEIGHT / 2) -
      (totalHeight / 2);

    /*
    ================================================
    DRAW TEXT LINES
    ================================================
    */

    lines.forEach((line, index) => {

      context.fillText(
        line,
        WIDTH / 2,
        startY + (index * lineHeight)
      );

    });

    /*
    ================================================
    WATERMARK BELOW TEXT
    ================================================
    */

    if (watermark) {

      context.shadowBlur = 0;

      context.font =
        "36px Arial";

      context.fillStyle =
        "rgba(255,255,255,0.72)";

      context.fillText(
        watermark,
        WIDTH / 2,
        startY +
        totalHeight +
        80
      );

    }

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
        context.measureText(
          testLine
        ).width;

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
  START RECORDING
  ====================================================
  */

  async function startRecording() {

    canvasStream =
      canvas.captureStream(30);

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
    RECORDER
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
        "Recording completed."
      );

    });

  }

  /*
  ====================================================
  SCENE TRANSITION
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

    if (animationFrame) {

      cancelAnimationFrame(
        animationFrame
      );

    }

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
