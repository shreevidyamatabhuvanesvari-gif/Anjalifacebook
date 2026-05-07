// ======================================================
// CANVAS VIDEO + TTS AUDIO RECORDER
// MOBILE + PC SUPPORT
// ======================================================

// ===== CANVAS =====
const canvas =
  document.getElementById(
    "reelCanvas"
  );

const ctx =
  canvas.getContext("2d");

// ===== SIZE =====
canvas.width = 1080;
canvas.height = 1920;

// ===== UI =====
const textBox =
  document.getElementById(
    "textBox"
  );

const watermark =
  document.getElementById(
    "watermark"
  );

const ttsAudio =
  document.getElementById(
    "ttsAudio"
  );

// ===== IMAGE =====
let img = new Image();

img.crossOrigin =
  "anonymous";

// ===== RECORDING =====
let mediaRecorder;
let recordedChunks = [];

let animationId;

// ===== COLORS =====
const canvasColors = [
  "#ff4d4d",
  "#ffd633",
  "#66ff66",
  "#66ccff",
  "#ff66cc",
  "#ffffff"
];

// ======================================================
// LOAD IMAGE
// ======================================================
function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      img.onload = resolve;

      img.onerror = reject;

      img.src = src;
    }
  );
}

// ======================================================
// START ANIMATION
// ======================================================
function startCanvasAnimation() {

  cancelAnimationFrame(
    animationId
  );

  animateCanvas();
}

// ======================================================
// ANIMATE
// ======================================================
function animateCanvas() {

  // ===== CLEAR =====
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // ===== BG =====
  ctx.fillStyle = "black";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // ===== IMAGE =====
  if (
    img &&
    img.complete
  ) {

    const zoom =
      1 +
      Math.sin(
        Date.now() * 0.0015
      ) * 0.02;

    const imgWidth =
      canvas.width * zoom;

    const imgHeight =
      canvas.height * zoom;

    const x =
      (canvas.width -
        imgWidth) / 2;

    const y =
      (canvas.height -
        imgHeight) / 2;

    ctx.drawImage(
      img,
      x,
      y,
      imgWidth,
      imgHeight
    );
  }

  // ===== TEXT BOX =====
  ctx.fillStyle =
    "rgba(0,0,0,0.55)";

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

  ctx.textAlign =
    "left";

  drawColoredText(
    textBox.value ||
      textBox.innerText ||
      "",
    110,
    860,
    850,
    82
  );

  // ===== WATERMARK =====
  ctx.fillStyle =
    "white";

  ctx.font =
    "italic bold 34px sans-serif";

  ctx.textAlign =
    "center";

  ctx.fillText(
    watermark.value ||
      watermark.innerText ||
      "",
    canvas.width / 2,
    1320
  );

  // ===== LOOP =====
  animationId =
    requestAnimationFrame(
      animateCanvas
    );
}

// ======================================================
// DRAW TEXT
// ======================================================
function drawColoredText(
  text,
  startX,
  startY,
  maxWidth,
  lineHeight
) {

  if (!text) return;

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

    const width =
      ctx.measureText(
        word + " "
      ).width;

    // ===== NEW LINE =====
    if (
      x + width >
      startX + maxWidth
    ) {

      x = startX;

      y += lineHeight;
    }

    // ===== COLOR =====
    ctx.fillStyle =
      canvasColors[
        i %
          canvasColors.length
      ];

    ctx.fillText(
      word,
      x,
      y
    );

    x += width;
  }
}

// ======================================================
// ROUND RECT
// ======================================================
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

  if (fill) {

    ctx.fill();
  }
}

// ======================================================
// START RECORDING
// ======================================================
async function startCanvasRecording(
  ttsAudioURL
) {

  try {

    // ===== RESET =====
    recordedChunks = [];

    // ===== LOAD AUDIO =====
    ttsAudio.src =
      ttsAudioURL;

    ttsAudio.crossOrigin =
      "anonymous";

    // ===== WAIT AUDIO =====
    await ttsAudio.load();

    // ===== START CANVAS =====
    startCanvasAnimation();

    // ===== CANVAS STREAM =====
    const canvasStream =
      canvas.captureStream(30);

    // ===== AUDIO STREAM =====
    let audioStream;

    // ===== MOBILE SUPPORT =====
    if (
      ttsAudio.captureStream
    ) {

      audioStream =
        ttsAudio.captureStream();

    } else if (
      ttsAudio.mozCaptureStream
    ) {

      audioStream =
        ttsAudio.mozCaptureStream();

    } else {

      alert(
        "Audio stream capture not supported"
      );

      return;
    }

    // ===== FINAL STREAM =====
    const finalStream =
      new MediaStream();

    // ===== ADD VIDEO =====
    canvasStream
      .getVideoTracks()
      .forEach(track => {

        finalStream.addTrack(
          track
        );
      });

    // ===== ADD AUDIO =====
    audioStream
      .getAudioTracks()
      .forEach(track => {

        finalStream.addTrack(
          track
        );
      });

    // ===== MIME =====
    let mimeType =
      "video/webm";

    if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus"
      )
    ) {

      mimeType =
        "video/webm;codecs=vp9,opus";

    } else if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8,opus"
      )
    ) {

      mimeType =
        "video/webm;codecs=vp8,opus";
    }

    // ===== RECORDER =====
    mediaRecorder =
      new MediaRecorder(
        finalStream,
        {
          mimeType,
          videoBitsPerSecond:
            8000000,
          audioBitsPerSecond:
            128000
        }
      );

    // ===== DATA =====
    mediaRecorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size > 0
        ) {

          recordedChunks.push(
            event.data
          );
        }
      };

    // ===== STOP =====
    mediaRecorder.onstop =
      () => {

        // ===== BLOB =====
        const blob =
          new Blob(
            recordedChunks,
            {
              type: mimeType
            }
          );

        // ===== URL =====
        const videoURL =
          URL.createObjectURL(
            blob
          );

        // ===== DOWNLOAD =====
        const a =
          document.createElement(
            "a"
          );

        a.href = videoURL;

        a.download =
          "tts-video.webm";

        document.body.appendChild(
          a
        );

        a.click();

        // ===== CLEAN =====
        setTimeout(() => {

          URL.revokeObjectURL(
            videoURL
          );

          a.remove();

        }, 3000);

        console.log(
          "Video Saved"
        );
      };

    // ===== ERROR =====
    mediaRecorder.onerror =
      e => {

        console.log(e);

        alert(
          "Recording Error"
        );
      };

    // ===== START =====
    mediaRecorder.start(
      1000
    );

    // ===== PLAY AUDIO =====
    await ttsAudio.play();

    console.log(
      "Recording Started"
    );

    // ===== AUTO STOP =====
    ttsAudio.onended =
      () => {

        stopCanvasRecording();
      };

  } catch (err) {

    console.log(err);

    alert(
      err.message
    );
  }
}

// ======================================================
// STOP RECORDING
// ======================================================
function stopCanvasRecording() {

  try {

    // ===== STOP RECORDER =====
    if (
      mediaRecorder &&
      mediaRecorder.state ===
        "recording"
    ) {

      mediaRecorder.stop();
    }

    // ===== STOP AUDIO =====
    if (ttsAudio) {

      ttsAudio.pause();

      ttsAudio.currentTime = 0;
    }

    // ===== STOP ANIMATION =====
    cancelAnimationFrame(
      animationId
    );

    console.log(
      "Recording Stopped"
    );

  } catch (err) {

    console.log(err);
  }
}

// ======================================================
// EXAMPLE
// ======================================================

// startCanvasRecording(
//   "tts-audio.mp3"
// );
