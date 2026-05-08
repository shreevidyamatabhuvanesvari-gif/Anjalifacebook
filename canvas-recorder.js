/*
====================================================
REEL CREATOR PRO
FINAL CINEMATIC RENDER ENGINE V3
PHOTO-INNER TEXT LAYOUT UPDATE
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
  IMAGE BOUNDS
  ====================================================
  */

  let currentImageBounds = {

    x: 0,
    y: 0,
    width: 0,
    height: 0

  };

  /*
  ====================================================
  BREATHING
  ====================================================
  */

  let zoomScale = 1;
  let zoomDirection = 0.00015;

  /*
  ====================================================
  VIDEO SIZE
  ====================================================
  */

  const WIDTH = 1080;
  const HEIGHT = 1920;

  /*
  ====================================================
  TYPOGRAPHY
  ====================================================
  */

  const FONT_FAMILY =
    "Inter, Poppins, Montserrat, Arial, sans-serif";

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

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx =
      canvas.getContext("2d");

    previewElement.innerHTML = "";

    previewCanvas =
      document.createElement("canvas");

    previewCanvas.width = WIDTH;
    previewCanvas.height = HEIGHT;

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

    previewElement.appendChild(
      previewCanvas
    );

    previewCtx =
      previewCanvas.getContext("2d");

    setupAudioSystem();

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
  RENDER LOOP
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
  MAIN FRAME
  ====================================================
  */

  function drawFrame(context) {

    context.clearRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    drawBlurBackground(context);

    drawForegroundImage(context);

    drawOverlay(context);

    const layout =
      measureTextLayout(context);

    drawGlassStrip(
      context,
      layout
    );

    drawAdaptiveText(
      context,
      layout
    );

    drawWatermark(
      context,
      layout
    );

  }

  /*
  ====================================================
  BACKGROUND
  ====================================================
  */

  function drawBlurBackground(context) {

    if (!currentImage) {

      context.fillStyle =
        "black";

      context.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      return;

    }

    context.save();

    context.filter =
      "blur(14px) brightness(0.55)";

    const imageRatio =
      currentImage.width /
      currentImage.height;

    const canvasRatio =
      WIDTH / HEIGHT;

    let drawWidth;
    let drawHeight;

    if (imageRatio > canvasRatio) {

      drawHeight = HEIGHT;
      drawWidth =
        HEIGHT * imageRatio;

    } else {

      drawWidth = WIDTH;
      drawHeight =
        WIDTH / imageRatio;

    }

    const x =
      (WIDTH - drawWidth) / 2;

    const y =
      (HEIGHT - drawHeight) / 2;

    context.drawImage(
      currentImage,
      x,
      y,
      drawWidth,
      drawHeight
    );

    context.restore();

  }

  /*
  ====================================================
  FOREGROUND IMAGE
  ====================================================
  */

  function drawForegroundImage(context) {

    if (!currentImage) {

      return;

    }

    zoomScale += zoomDirection;

    if (
      zoomScale > 1.02 ||
      zoomScale < 1
    ) {

      zoomDirection *= -1;

    }

    const imageWidth =
      currentImage.width;

    const imageHeight =
      currentImage.height;

    const imageRatio =
      imageWidth / imageHeight;

    const maxWidth =
      WIDTH * 0.92;

    const maxHeight =
      HEIGHT * 0.72;

    let drawWidth;
    let drawHeight;

    if (
      imageWidth > imageHeight
    ) {

      drawWidth = maxWidth;

      drawHeight =
        drawWidth / imageRatio;

    } else {

      drawHeight = maxHeight;

      drawWidth =
        drawHeight * imageRatio;

    }

    drawWidth *= zoomScale;
    drawHeight *= zoomScale;

    const x =
      (WIDTH - drawWidth) / 2;

    const y =
      (HEIGHT * 0.40) -
      (drawHeight / 2);

    /*
    ================================================
    SAVE IMAGE BOUNDS
    ================================================
    */

    currentImageBounds = {

      x,
      y,
      width: drawWidth,
      height: drawHeight

    };

    context.save();

    context.shadowColor =
      "rgba(0,0,0,0.45)";

    context.shadowBlur = 40;

    context.drawImage(
      currentImage,
      x,
      y,
      drawWidth,
      drawHeight
    );

    context.restore();

  }

  /*
  ====================================================
  OVERLAY
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
      "rgba(0,0,0,0.50)"
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
  MEASURE TEXT
  ====================================================
  */

  function measureTextLayout(context) {

    const fontSize =
      calculateFontSize(
        currentText
      );

    context.font =
      `500 ${fontSize}px ${FONT_FAMILY}`;

    const lines =
      wrapText(
        context,
        currentText,
        currentImageBounds.width * 0.80
      );

    const lineHeight =
      fontSize * 1.35;

    const textHeight =
      lines.length * lineHeight;

    const watermarkHeight = 60;

    const padding = 90;

    let stripHeight =
      textHeight +
      watermarkHeight +
      padding;

    stripHeight =
      Math.max(
        200,
        stripHeight
      );

    stripHeight =
      Math.min(
        420,
        stripHeight
      );

    return {

      fontSize,
      lines,
      lineHeight,
      textHeight,
      stripHeight

    };

  }

  /*
  ====================================================
  GLASS STRIP
  ====================================================
  */

  function drawGlassStrip(
    context,
    layout
  ) {

    if (!currentImage) {

      return;

    }

    const stripWidth =
      currentImageBounds.width * 0.92;

    const stripHeight =
      layout.stripHeight;

    const x =
      currentImageBounds.x +
      (
        currentImageBounds.width -
        stripWidth
      ) / 2;

    /*
    ================================================
    INSIDE IMAGE BOTTOM
    ================================================
    */

    const y =
      currentImageBounds.y +
      currentImageBounds.height -
      stripHeight -
      35;

    const radius = 40;

    context.save();

    context.fillStyle =
      "rgba(0,0,0,0.45)";

    roundRect(
      context,
      x,
      y,
      stripWidth,
      stripHeight,
      radius
    );

    context.fill();

    const gradient =
      context.createLinearGradient(
        0,
        y,
        0,
        y + stripHeight
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,0.08)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    context.fillStyle =
      gradient;

    roundRect(
      context,
      x,
      y,
      stripWidth,
      stripHeight,
      radius
    );

    context.fill();

    context.restore();

  }

  /*
  ====================================================
  TEXT
  ====================================================
  */

  function drawAdaptiveText(
    context,
    layout
  ) {

    if (!currentText) {

      return;

    }

    const stripWidth =
      currentImageBounds.width * 0.92;

    const stripHeight =
      layout.stripHeight;

    const stripX =
      currentImageBounds.x +
      (
        currentImageBounds.width -
        stripWidth
      ) / 2;

    const stripY =
      currentImageBounds.y +
      currentImageBounds.height -
      stripHeight -
      35;

    context.save();

    context.font =
      `500 ${layout.fontSize}px ${FONT_FAMILY}`;

    context.textAlign =
      "center";

    context.textBaseline =
      "middle";

    const gradient =
      context.createLinearGradient(
        stripX,
        stripY,
        stripX + stripWidth,
        stripY + stripHeight
      );

    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      0.25,
      "#ffd166"
    );

    gradient.addColorStop(
      0.50,
      "#fca311"
    );

    gradient.addColorStop(
      0.75,
      "#ff4d8d"
    );

    gradient.addColorStop(
      1,
      "#4cc9f0"
    );

    context.fillStyle =
      gradient;

    context.shadowColor =
      "rgba(0,0,0,0.45)";

    context.shadowBlur = 14;

    if (speaking) {

      context.shadowColor =
        "rgba(255,255,255,0.22)";

      context.shadowBlur = 22;

    }

    context.strokeStyle =
      "rgba(0,0,0,0.30)";

    context.lineWidth = 2;

    const startY =
      stripY + 90;

    layout.lines.forEach(
      (line, index) => {

        const y =
          startY +
          (
            index *
            layout.lineHeight
          );

        context.strokeText(
          line,
          WIDTH / 2,
          y
        );

        context.fillText(
          line,
          WIDTH / 2,
          y
        );

      }
    );

    context.restore();

  }

  /*
  ====================================================
  WATERMARK
  ====================================================
  */

  function drawWatermark(
    context,
    layout
  ) {

    if (!watermark) {

      return;

    }

    const stripHeight =
      layout.stripHeight;

    const stripY =
      currentImageBounds.y +
      currentImageBounds.height -
      stripHeight -
      35;

    context.save();

    context.font =
      `400 30px ${FONT_FAMILY}`;

    context.textAlign =
      "center";

    context.fillStyle =
      "rgba(255,255,255,0.74)";

    const y =
      stripY +
      stripHeight -
      45;

    context.fillText(
      `© ${watermark}`,
      WIDTH / 2,
      y
    );

    context.restore();

  }

  /*
  ====================================================
  FONT SIZE
  ====================================================
  */

  function calculateFontSize(text) {

    const length =
      text.length;

    if (length < 40) {

      return 76;

    }

    if (length < 90) {

      return 68;

    }

    if (length < 150) {

      return 60;

    }

    return 54;

  }

  /*
  ====================================================
  WRAP
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
        currentLine +
        word +
        " ";

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

    return lines.slice(0, 4);

  }

  /*
  ====================================================
  ROUND RECT
  ====================================================
  */

  function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
  ) {

    context.beginPath();

    context.moveTo(
      x + radius,
      y
    );

    context.lineTo(
      x + width - radius,
      y
    );

    context.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + radius
    );

    context.lineTo(
      x + width,
      y + height - radius
    );

    context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );

    context.lineTo(
      x + radius,
      y + height
    );

    context.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - radius
    );

    context.lineTo(
      x,
      y + radius
    );

    context.quadraticCurveTo(
      x,
      y,
      x + radius,
      y
    );

    context.closePath();

  }

  /*
  ====================================================
  RECORDING
  ====================================================
  */

  async function startRecording() {

    canvasStream =
      canvas.captureStream(30);

    combinedStream =
      new MediaStream();

    canvasStream
      .getVideoTracks()
      .forEach(track => {

        combinedStream.addTrack(
          track
        );

      });

    mediaRecorder =
      new MediaRecorder(
        combinedStream,
        {
          mimeType:
            "video/webm"
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

      mediaRecorder.onstop =
        () => {

          resolve(
            new Blob(
              recordedChunks,
              {
                type:
                  "video/webm"
              }
            )
          );

        };

      mediaRecorder.stop();

    });

  }

  /*
  ====================================================
  TRANSITION
  ====================================================
  */

  async function playSceneTransition() {

    return new Promise((resolve) => {

      setTimeout(
        resolve,
        350
      );

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
