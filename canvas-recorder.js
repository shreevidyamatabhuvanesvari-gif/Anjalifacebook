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

// ===== COLORS =====
const canvasColors = [
  "#ff4d4d",
  "#ffd633",
  "#66ff66",
  "#66ccff",
  "#ff66cc",
  "#ffffff"
];

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
  if (img.complete && img.naturalWidth > 0) {

    // 🔥 BREATHING EFFECT
    const zoom =
      1 +
      Math.sin(Date.now() * 0.0015) * 0.02;

    const imgWidth =
      canvas.width * zoom;

    const imgHeight =
      canvas.height * zoom;

    const x =
      (canvas.width - imgWidth) / 2;

    const y =
      (canvas.height - imgHeight) / 2;

    // ===== MAIN IMAGE =====
    ctx.drawImage(
      img,
      x,
      y,
      imgWidth,
      imgHeight
    );

    // ===== FAKE TALKING EFFECT =====
    mouthFrame += 0.35;

    const mouthMove =
      Math.sin(mouthFrame) * 10;

    // 🔥 DARK LIP SHADOW
    ctx.fillStyle =
      "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
      canvas.width / 2,
      canvas.height * 0.69,
      70,
      12 + mouthMove,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // 🔥 RED INNER LIP
    ctx.fillStyle =
      "rgba(255,70,70,0.22)";

    ctx.beginPath();

    ctx.ellipse(
      canvas.width / 2,
      canvas.height * 0.688,
      48,
      5 + mouthMove * 0.4,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // ===== TEXT BOX =====
  ctx.fillStyle =
    "rgba(0,0,0,0.60)";

  roundRect(
    ctx,
    60,
    760,
    960,
    420,
    28,
    true
  );

  // ===== TEXT =====
  ctx.font =
    "bold 54px sans-serif";

  ctx.textAlign = "left";

  drawColoredText(
    textBox.innerText,
    110,
    860,
    860,
    82
  );

  // ===== WATERMARK =====
  ctx.fillStyle =
    "rgba(255,255,255,0.95)";

  ctx.font =
    "italic bold 34px sans-serif";

  ctx.textAlign = "center";

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

// ===== DRAW COLORED TEXT =====
function drawColoredText(
  text,
  startX,
  startY,
  maxWidth,
  lineHeight
) {

  const words =
    text.split(" ");

  let x = startX;
  let y = startY;

  for (
    let i = 0;
    i < words.length;
    i++
  ) {

    const word =
      words[i];

    const wordWidth =
      ctx.measureText(
        word + " "
      ).width;

    // ===== LINE BREAK =====
    if (
      x + wordWidth >
      startX + maxWidth
    ) {

      x = startX;
      y += lineHeight;
    }

    // ===== WORD COLOR =====
    ctx.fillStyle =
      canvasColors[
        i % canvasColors.length
      ];

    ctx.fillText(
      word,
      x,
      y
    );

    x += wordWidth;
  }
}

// ===== ROUND RECT =====
function roundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius,
  fill
) {

  ctx.beginPath();

  ctx.moveTo(
    x + radius,
    y
  );

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
}

// ===== START RECORDING =====
function startCanvasRecording() {

  // ✅ ONLY VIDEO
  canvasStream =
    canvas.captureStream(30);

  canvasChunks = [];

  // ✅ SAFE MIME TYPE
  let options = {};

  if (
    MediaRecorder.isTypeSupported(
      "video/webm;codecs=vp9"
    )
  ) {

    options.mimeType =
      "video/webm;codecs=vp9";
  }

  else if (
    MediaRecorder.isTypeSupported(
      "video/webm;codecs=vp8"
    )
  ) {

    options.mimeType =
      "video/webm;codecs=vp8";
  }

  else {

    options.mimeType =
      "video/webm";
  }

  canvasRecorder =
    new MediaRecorder(
      canvasStream,
      options
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
              options.mimeType
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
