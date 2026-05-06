// ===== CANVAS =====
const canvas = document.getElementById("reelCanvas");
const ctx = canvas.getContext("2d");

// ===== SIZE =====
canvas.width = 1080;
canvas.height = 1920;

// ===== RECORDING =====
let canvasRecorder;
let canvasChunks = [];
let canvasStream;

// ===== TALKING EFFECT =====
let talkingAnimation;
let mouthFrame = 0;

// ===== START TALKING EFFECT =====
function startTalkingEffect() {

  cancelAnimationFrame(talkingAnimation);

  animateCanvas();
}

// ===== ANIMATION LOOP =====
function animateCanvas() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ===== BLACK BG =====
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ===== IMAGE =====
  if (img.src) {

    // 🔥 Breathing Zoom Effect
    const zoom =
      1 +
      Math.sin(Date.now() * 0.0015) * 0.02;

    const imgWidth = canvas.width * zoom;
    const imgHeight = canvas.height * zoom;

    const x =
      (canvas.width - imgWidth) / 2;

    const y =
      (canvas.height - imgHeight) / 2;

    ctx.drawImage(
      img,
      x,
      y,
      imgWidth,
      imgHeight
    );

    // ===== FAKE TALKING MOUTH =====
    mouthFrame += 0.15;

    const mouthMove =
      Math.sin(mouthFrame) * 8;

    ctx.fillStyle =
      "rgba(0,0,0,0.18)";

    ctx.beginPath();

    ctx.ellipse(
      canvas.width / 2,
      canvas.height * 0.67,
      55,
      18 + mouthMove,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // ===== TEXT BOX =====
  ctx.fillStyle =
    "rgba(0,0,0,0.58)";

  roundRect(
    ctx,
    60,
    760,
    960,
    420,
    28,
    true,
    false
  );

  // ===== TEXT =====
  ctx.fillStyle = "white";

  ctx.font =
    "bold 54px sans-serif";

  ctx.textAlign = "center";

  wrapText(
    ctx,
    textBox.innerText,
    canvas.width / 2,
    860,
    850,
    80
  );

  // ===== WATERMARK =====
  ctx.fillStyle =
    "rgba(255,255,255,0.92)";

  ctx.font =
    "italic bold 34px sans-serif";

  ctx.fillText(
    watermark.innerText,
    canvas.width / 2,
    1320
  );

  talkingAnimation =
    requestAnimationFrame(
      animateCanvas
    );
}

// ===== ROUND RECT =====
function roundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius,
  fill,
  stroke
) {

  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  ctx.lineTo(
    x + width - radius,
    y
  );

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + radius
  );

  ctx.lineTo(
    x + width,
    y + height - radius
  );

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );

  ctx.lineTo(
    x + radius,
    y + height
  );

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  );

  ctx.lineTo(
    x,
    y + radius
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + radius,
    y
  );

  ctx.closePath();

  if (fill)
    ctx.fill();

  if (stroke)
    ctx.stroke();
}

// ===== TEXT WRAP =====
function wrapText(
  context,
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {

  const words =
    text.split(" ");

  let line = "";

  for (
    let n = 0;
    n < words.length;
    n++
  ) {

    const testLine =
      line + words[n] + " ";

    const metrics =
      context.measureText(testLine);

    const testWidth =
      metrics.width;

    if (
      testWidth > maxWidth &&
      n > 0
    ) {

      context.fillText(
        line,
        x,
        y
      );

      line =
        words[n] + " ";

      y += lineHeight;

    } else {

      line = testLine;
    }
  }

  context.fillText(
    line,
    x,
    y
  );
}

// ===== START RECORDING =====
function startCanvasRecording() {

  canvasStream =
    canvas.captureStream(30);

  canvasChunks = [];

  canvasRecorder =
    new MediaRecorder(
      canvasStream,
      {
        mimeType:
          "video/webm"
      }
    );

  canvasRecorder.ondataavailable =
    function (e) {

      if (e.data.size > 0) {

        canvasChunks.push(e.data);
      }
    };

  canvasRecorder.onstop =
    function () {

      const blob =
        new Blob(
          canvasChunks,
          {
            type:
              "video/webm"
          }
        );

      const videoURL =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = videoURL;

      a.download =
        "reel-video.webm";

      document.body.appendChild(a);

      a.click();

      setTimeout(() => {

        URL.revokeObjectURL(
          videoURL
        );

        document.body.removeChild(a);

      }, 100);
    };

  canvasRecorder.start();
}

// ===== STOP RECORDING =====
function stopCanvasRecording() {

  if (
    canvasRecorder &&
    canvasRecorder.state ===
      "recording"
  ) {

    canvasRecorder.stop();
  }
}
