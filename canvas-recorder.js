// ======================================================
// FULL FIXED CANVAS RECORDER
// IMAGE + TTS AUDIO + VIDEO DOWNLOAD
// JPG + PNG + WEBP SUPPORTED
// MOBILE + PC SUPPORTED
// ======================================================

// ======================================================
// REQUIRED HTML
// ======================================================
//
// <canvas id="reelCanvas"></canvas>
//
// <div id="textBox">
//   आपका टेक्स्ट
// </div>
//
// <div id="watermark">
//   @watermark
// </div>
//
// <audio
//   id="ttsAudio"
//   crossorigin="anonymous"
// ></audio>
//
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

// ===== ELEMENTS =====
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

// ===== RECORDING =====
let canvasRecorder;

let canvasChunks = [];

let canvasStream;

let mergedStream;

// ===== ANIMATION =====
let talkingAnimation;

let mouthFrame = 0;

// ===== IMAGE =====
let img = new Image();

img.crossOrigin =
  "anonymous";

img.referrerPolicy =
  "no-referrer";

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
// SUPPORT:
// JPG
// PNG
// WEBP
// ======================================================
function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      img = new Image();

      img.crossOrigin =
        "anonymous";

      img.referrerPolicy =
        "no-referrer";

      img.onload =
        () => {

          console.log(
            "Image Loaded"
          );

          resolve(img);
        };

      img.onerror =
        err => {

          console.log(err);

          reject(
            new Error(
              "Image load failed"
            )
          );
        };

      // ===== CACHE FIX =====
      img.src =
        src +
        "?t=" +
        Date.now();
    }
  );
}

// ======================================================
// START TALKING EFFECT
// ======================================================
function startTalkingEffect() {

  cancelAnimationFrame(
    talkingAnimation
  );

  animateCanvas();
}

// ======================================================
// CANVAS ANIMATION
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

  // ======================================================
  // IMAGE DRAW
  // ======================================================
  if (
    img &&
    img.complete &&
    img.naturalWidth > 0
  ) {

    // ===== ZOOM =====
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

    // ===== DRAW IMAGE =====
    ctx.drawImage(
      img,
      x,
      y,
      imgWidth,
      imgHeight
    );

    // ======================================================
    // TALKING EFFECT
    // ======================================================
    mouthFrame += 0.35;

    const mouthMove =
      Math.sin(
        mouthFrame
      ) * 10;

    // ===== SHADOW =====
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

    // ===== INNER LIP =====
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

  // ======================================================
  // TEXT BOX
  // ======================================================
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

  // ======================================================
  // TEXT
  // ======================================================
  ctx.font =
    "bold 54px sans-serif";

  ctx.textAlign =
    "left";

  drawColoredText(
    textBox.innerText || "",
    110,
    860,
    860,
    82
  );

  // ======================================================
  // WATERMARK
  // ======================================================
  ctx.fillStyle =
    "rgba(255,255,255,0.95)";

  ctx.font =
    "italic bold 34px sans-serif";

  ctx.textAlign =
    "center";

  ctx.fillText(
    watermark.innerText || "",
    canvas.width / 2,
    1320
  );

  // ===== LOOP =====
  talkingAnimation =
    requestAnimationFrame(
      animateCanvas
    );
}

// ======================================================
// DRAW MULTICOLOR TEXT
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

    const wordWidth =
      ctx.measureText(
        word + " "
      ).width;

    // ===== NEW LINE =====
    if (
      x + wordWidth >
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

    x += wordWidth;
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
  imageURL,
  audioURL
) {

  try {

    // ===== RESET =====
    canvasChunks = [];

    // ======================================================
    // LOAD IMAGE
    // ======================================================
    await loadImage(
      imageURL
    );

    // ======================================================
    // LOAD AUDIO
    // ======================================================
    ttsAudio.src =
      audioURL;

    await new Promise(
      resolve => {

        ttsAudio.onloadeddata =
          () => {

            resolve();
          };
      }
    );

    // ======================================================
    // START ANIMATION
    // ======================================================
    startTalkingEffect();

    // ======================================================
    // CAPTURE CANVAS VIDEO
    // ======================================================
    canvasStream =
      canvas.captureStream(
        30
      );

    // ======================================================
    // AUDIO STREAM
    // ======================================================
    let audioStream;

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
        "Audio capture not supported"
      );

      return;
    }

    // ======================================================
    // MERGED STREAM
    // ======================================================
    mergedStream =
      new MediaStream();

    // ===== VIDEO =====
    canvasStream
      .getVideoTracks()
      .forEach(track => {

        mergedStream.addTrack(
          track
        );
      });

    // ===== AUDIO =====
    audioStream
      .getAudioTracks()
      .forEach(track => {

        mergedStream.addTrack(
          track
        );
      });

    // ======================================================
    // MIME TYPE
    // ======================================================
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

    // ======================================================
    // RECORDER
    // ======================================================
    canvasRecorder =
      new MediaRecorder(
        mergedStream,
        {
          mimeType,
          videoBitsPerSecond:
            8000000,
          audioBitsPerSecond:
            128000
        }
      );

    // ======================================================
    // DATA
    // ======================================================
    canvasRecorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size > 0
        ) {

          canvasChunks.push(
            event.data
          );
        }
      };

    // ======================================================
    // ERROR
    // ======================================================
    canvasRecorder.onerror =
      err => {

        console.log(err);

        alert(
          "Recording error"
        );
      };

    // ======================================================
    // STOP EVENT
    // ======================================================
    canvasRecorder.onstop =
      () => {

        try {

          // ===== EMPTY =====
          if (
            canvasChunks.length === 0
          ) {

            alert(
              "Video data नहीं बना"
            );

            return;
          }

          // ===== VIDEO =====
          const blob =
            new Blob(
              canvasChunks,
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

          a.style.display =
            "none";

          a.href =
            videoURL;

          a.download =
            "reel-video.webm";

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
            "Video Downloaded"
          );

        } catch (err) {

          console.log(err);

          alert(
            "Video save error"
          );
        }
      };

    // ======================================================
    // START RECORDING
    // ======================================================
    canvasRecorder.start(
      1000
    );

    // ======================================================
    // PLAY AUDIO
    // ======================================================
    await ttsAudio.play();

    console.log(
      "Recording Started"
    );

    // ======================================================
    // AUTO STOP
    // ======================================================
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
      canvasRecorder &&
      canvasRecorder.state ===
        "recording"
    ) {

      canvasRecorder.stop();
    }

    // ===== STOP AUDIO =====
    if (ttsAudio) {

      ttsAudio.pause();

      ttsAudio.currentTime = 0;
    }

    // ===== STOP ANIMATION =====
    cancelAnimationFrame(
      talkingAnimation
    );

    // ===== STOP STREAMS =====
    if (mergedStream) {

      mergedStream
        .getTracks()
        .forEach(track => {

          track.stop();
        });
    }

    console.log(
      "Recording Stopped"
    );

  } catch (err) {

    console.log(err);
  }
}

// ======================================================
// USAGE
// ======================================================

// startCanvasRecording(
//   "image.png",
//   "tts.mp3"
// );
