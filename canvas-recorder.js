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

// ===== AUDIO =====
let audioContext;
let audioDestination;

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
  if (img.src) {

    // 🔥 BREATHING ZOOM EFFECT
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

    // ===== BETTER FAKE TALKING =====
    mouthFrame += 0.22;

    const mouthMove =
      Math.sin(mouthFrame) * 12;

    // 🔥 MOUTH SHADOW
    ctx.fillStyle =
      "rgba(0,0,0,0.28)";

    ctx.beginPath();

    ctx.ellipse(
      canvas.width / 2,
      canvas.height * 0.69,
      75,
      14 + mouthMove,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // 🔥 LIP HIGHLIGHT
    ctx.fillStyle =
      "rgba(255,80,80,0.10)";

    ctx.beginPath();

    ctx.ellipse(
      canvas.width / 2,
      canvas.height * 0.688,
      60,
      8 + mouthMove * 0.4,
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
  ctx.font =
    "bold 54px sans-serif";

  ctx.textAlign = "center";

  drawColoredText(
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

// ===== DRAW COLORED TEXT =====
function drawColoredText(
  text,
  centerX,
  startY,
  maxWidth,
  lineHeight
) {

  const words =
    text.split(" ");

  let line = "";
  let y = startY;

  for (
    let i = 0;
    i < words.length;
    i++
  ) {

    const testLine =
      line + words[i] + " ";

    const testWidth =
      ctx.measureText(testLine).width;

    if (
      testWidth > maxWidth &&
      i > 0
    ) {

      drawLineWords(
        line.trim(),
        centerX,
        y
      );

      line =
        words[i] + " ";

      y += lineHeight;

    } else {

      line = testLine;
    }
  }

  drawLineWords(
    line.trim(),
    centerX,
    y
  );
}

// ===== DRAW LINE WORDS =====
function drawLineWords(
  line,
  centerX,
  y
) {

  const words =
    line.split(" ");

  let totalWidth = 0;

  words.forEach(word => {

    totalWidth +=
      ctx.measureText(word + " ")
        .width;
  });

  let x =
    centerX - totalWidth / 2;

  words.forEach((word, i) => {

    ctx.fillStyle =
      canvasColors[
        i % canvasColors.length
      ];

    ctx.fillText(
      word,
      x,
      y
    );

    x +=
      ctx.measureText(word + " ")
        .width;
  });
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

// ===== START RECORDING =====
function startCanvasRecording() {

  // ===== VIDEO STREAM =====
  canvasStream =
    canvas.captureStream(30);

  // ===== AUDIO CONTEXT =====
  audioContext =
    new AudioContext();

  audioDestination =
    audioContext.createMediaStreamDestination();

  // ===== MERGED STREAM =====
  const mergedStream =
    new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);

  canvasChunks = [];

  canvasRecorder =
    new MediaRecorder(
      mergedStream,
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
