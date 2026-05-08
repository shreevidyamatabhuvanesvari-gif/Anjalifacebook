/*
====================================================
REEL CREATOR PRO
ADVANCED CINEMATIC RENDER ENGINE
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

  let previewCanvas = null;

  let previewCtx = null;

  let previewElement = null;

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

  /*
  ====================================================
  CINEMATIC ZOOM
  ====================================================
  */

  let zoomScale = 1;

  let zoomDirection = 0.00018;

  /*
  ====================================================
  FINAL RENDER SIZE
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
    RESET PREVIEW
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

    /*
    ================================================
    TRUE FULLSCREEN MOBILE FIT
    ================================================
    */

    previewCanvas.style.position =
      "absolute";

    previewCanvas.style.inset = "0";

    previewCanvas.style.width =
      "100vw";

    previewCanvas.style.height =
      "100vh";

    previewCanvas.style.objectFit =
      "contain";

    previewCanvas.style.background =
      "black";

    previewCanvas.style.display =
      "block";

    previewElement.appendChild(
      previewCanvas
    );

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
  RENDER ACTIVE LINE
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

    drawCinematicStrip(context);

    drawText(context);

  }

  /*
  ====================================================
  FULLSCREEN SAFE IMAGE FIT
  NO CROPPING
  ====================================================
  */

  function drawBackground(context) {

    /*
    ================================================
    BASE BLACK
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
    BREATHING MOTION
    ================================================
    */

    zoomScale += zoomDirection;

    if (
      zoomScale > 1.02 ||
      zoomScale < 1
    ) {

      zoomDirection *= -1;

    }

    /*
    ================================================
    IMAGE SIZE
    ================================================
    */

    const imageWidth =
      currentImage.width;

    const imageHeight =
      currentImage.height;

    /*
    ================================================
    SMART FIT
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
    APPLY SUBTLE ZOOM
    ================================================
    */

    drawWidth *= zoomScale;

    drawHeight *= zoomScale;

    /*
    ================================================
    CENTER IMAGE
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
      "rgba(0,0,0,0.10)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.65)"
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
  CINEMATIC GLASS STRIP
  ====================================================
  */

  function drawCinematicStrip(context) {

    const stripHeight = 420;

    const stripY =
      HEIGHT - 620;

    /*
    ================================================
    GLASS STRIP
    ================================================
    */

    context.fillStyle =
      "rgba(0,0,0,0.42)";

    context.fillRect(
      0,
      stripY,
      WIDTH,
      stripHeight
    );

    /*
    ================================================
    TOP HIGHLIGHT
    ================================================
    */

    const gradient =
      context.createLinearGradient(
        0,
        stripY,
        0,
        stripY + stripHeight
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,0.06)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    context.fillStyle =
      gradient;

    context.fillRect(
      0,
      stripY,
      WIDTH,
      stripHeight
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
        "rgba(255,255,255,0.85)";

      context.shadowBlur = 35;

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
      "bold 72px Arial";

    /*
    ================================================
    MULTICOLOR GRADIENT
    ================================================
    */

    const gradient =
      context.createLinearGradient(
        0,
        HEIGHT - 500,
        WIDTH,
        HEIGHT - 300
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
    WRAPPED TEXT
    ================================================
    */

    const lines =
      wrapText(
        context,
        currentText,
        WIDTH * 0.82
      );

    const lineHeight = 92;

    const totalHeight =
      lines.length * lineHeight;

    /*
    ================================================
    TEXT START POSITION
    ================================================
    */

    const startY =
      HEIGHT - 500;

    /*
    ================================================
    DRAW TEXT
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
    COPYRIGHT WATERMARK
    ================================================
    */

    if (watermark) {

      context.shadowBlur = 0;

      context.font =
        "34px Arial";

      context.fillStyle =
        "rgba(255,255,255,0.75)";

      context.fillText(
        `© ${watermark}`,
        WIDTH / 2,
        startY +
        totalHeight +
        90
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
