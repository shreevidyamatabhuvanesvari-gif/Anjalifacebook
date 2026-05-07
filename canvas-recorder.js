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

// ===== RECORDING =====
let canvasRecorder;

let canvasChunks = [];

let canvasStream;

let mergedStream;

let screenAudioStream;

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

  cancelAnimationFrame(
    talkingAnimation
  );

  animateCanvas();
}

// ===== ANIMATION LOOP =====
function animateCanvas() {

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
    img.complete &&
    img.naturalWidth > 0
  ) {

    // ===== BREATHING =====
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

    // ===== TALKING =====
    mouthFrame += 0.35;

    const mouthMove =
      Math.sin(mouthFrame) * 10;

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

  ctx.textAlign =
    "left";

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

  ctx.textAlign =
    "center";

  ctx.fillText(
    watermark.innerText,
    canvas.width / 2,
    1320
  );

  // ===== LOOP =====
  talkingAnimation =
    requestAnimationFrame(
      animateCanvas
    );
}

// ===== DRAW TEXT =====
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
async function startCanvasRecording() {

  try {

    // =====================================
    // CAPTURE TAB AUDIO
    // =====================================

    screenAudioStream =
      await navigator
        .mediaDevices
        .getDisplayMedia({

          video: true,

          audio: true
        });

    // =====================================
    // CANVAS VIDEO STREAM
    // =====================================

    canvasStream =
      canvas.captureStream(30);

    // =====================================
    // AUDIO TRACKS
    // =====================================

    let audioTracks = [];

    if (
      screenAudioStream &&
      screenAudioStream
        .getAudioTracks()
        .length > 0
    ) {

      audioTracks.push(
        ...screenAudioStream
          .getAudioTracks()
      );
    }

    // =====================================
    // MERGED STREAM
    // =====================================

    mergedStream =
      new MediaStream([

        ...canvasStream
          .getVideoTracks(),

        ...audioTracks
      ]);

    // =====================================
    // RESET CHUNKS
    // =====================================

    canvasChunks = [];

    // =====================================
    // MIME TYPE
    // =====================================

    let options = {

      mimeType:
        "video/webm"
    };

    if (
      MediaRecorder
        .isTypeSupported(
          "video/webm;codecs=vp9,opus"
        )
    ) {

      options.mimeType =
        "video/webm;codecs=vp9,opus";
    }

    else if (
      MediaRecorder
        .isTypeSupported(
          "video/webm;codecs=vp8,opus"
        )
    ) {

      options.mimeType =
        "video/webm;codecs=vp8,opus";
    }

    // =====================================
    // CREATE RECORDER
    // =====================================

    canvasRecorder =
      new MediaRecorder(
        mergedStream,
        options
      );

    // =====================================
    // DATA
    // =====================================

    canvasRecorder.ondataavailable =
      function (event) {

        if (
          event.data &&
          event.data.size > 0
        ) {

          canvasChunks.push(
            event.data
          );
        }
      };

    // =====================================
    // ERROR
    // =====================================

    canvasRecorder.onerror =
      function (err) {

        console.log(
          "Recorder Error:",
          err
        );

        alert(
          "Recording error आया"
        );
      };

    // =====================================
    // STOP
    // =====================================

    canvasRecorder.onstop =
      function () {

        try {

          // ===== CREATE BLOB =====
          const blob =
            new Blob(
              canvasChunks,
              {
                type:
                  options.mimeType
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

          document.body
            .appendChild(a);

          a.click();

          // ===== CLEAN =====
          setTimeout(() => {

            URL.revokeObjectURL(
              videoURL
            );

            document.body
              .removeChild(a);

          }, 2000);

          // ===== STOP STREAMS =====
          if (
            screenAudioStream
          ) {

            screenAudioStream
              .getTracks()
              .forEach(track => {

                track.stop();
              });
          }

        } catch (err) {

          console.log(err);

          alert(
            "Video export failed"
          );
        }
      };

    // =====================================
    // START RECORDER
    // =====================================

    canvasRecorder.start(
      1000
    );

  } catch (err) {

    console.log(err);

    alert(
      "Screen/tab audio permission allow करें"
    );
  }
}

// ===== STOP RECORDING =====
function stopCanvasRecording() {

  try {

    if (
      canvasRecorder &&
      canvasRecorder.state ===
        "recording"
    ) {

      canvasRecorder.stop();
    }

  } catch (err) {

    console.log(err);
  }
}
