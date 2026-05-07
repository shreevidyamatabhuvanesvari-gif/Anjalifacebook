// ======================================
// CANVAS
// ======================================

const canvas =
  document.getElementById(
    "reelCanvas"
  );

const ctx =
  canvas.getContext("2d");

// ======================================
// SIZE
// ======================================

canvas.width = 1080;
canvas.height = 1920;

// ======================================
// RECORDING
// ======================================

let canvasRecorder = null;

let canvasChunks = [];

let canvasStream = null;

let mergedStream = null;

let screenAudioStream = null;

let isRecording = false;

let recordingStopped = false;

// ======================================
// TALKING EFFECT
// ======================================

let talkingAnimation;

let mouthFrame = 0;

// ======================================
// COLORS
// ======================================

const canvasColors = [
  "#ff4d4d",
  "#ffd633",
  "#66ff66",
  "#66ccff",
  "#ff66cc",
  "#ffffff"
];

// ======================================
// START TALKING EFFECT
// ======================================

function startTalkingEffect() {

  cancelAnimationFrame(
    talkingAnimation
  );

  animateCanvas();
}

// ======================================
// ANIMATION LOOP
// ======================================

function animateCanvas() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // ======================================
  // BG
  // ======================================

  ctx.fillStyle = "black";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // ======================================
  // IMAGE
  // ======================================

  if (
    img &&
    img.complete &&
    img.naturalWidth > 0
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

    // ======================================
    // DRAW IMAGE
    // ======================================

    ctx.drawImage(
      img,
      x,
      y,
      imgWidth,
      imgHeight
    );

    // ======================================
    // TALKING EFFECT
    // ======================================

    mouthFrame += 0.35;

    const mouthMove =
      Math.sin(mouthFrame) * 10;

    // ======================================
    // SHADOW
    // ======================================

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

    // ======================================
    // INNER LIP
    // ======================================

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

  // ======================================
  // TEXT BOX
  // ======================================

  ctx.fillStyle =
    "rgba(0,0,0,0.60)";

  roundRect(
    ctx,
    60,
    700,
    960,
    520,
    28,
    true
  );

  // ======================================
  // TEXT
  // ======================================

  ctx.font =
    "bold 54px sans-serif";

  ctx.textAlign =
    "center";

  drawColoredText(
    textBox.innerText,
    canvas.width / 2,
    820,
    820,
    82
  );

  // ======================================
  // WATERMARK
  // ======================================

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

  // ======================================
  // LOOP
  // ======================================

  talkingAnimation =
    requestAnimationFrame(
      animateCanvas
    );
}

// ======================================
// DRAW TEXT
// ======================================

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
      line +
      words[i] +
      " ";

    const width =
      ctx.measureText(
        testLine
      ).width;

    if (
      width > maxWidth &&
      i > 0
    ) {

      drawLine(
        line,
        centerX,
        y
      );

      line =
        words[i] + " ";

      y += lineHeight;
    }

    else {

      line = testLine;
    }
  }

  drawLine(
    line,
    centerX,
    y
  );
}

// ======================================
// DRAW SINGLE LINE
// ======================================

function drawLine(
  line,
  centerX,
  y
) {

  const words =
    line.trim().split(" ");

  let totalWidth = 0;

  words.forEach(word => {

    totalWidth +=
      ctx.measureText(
        word + " "
      ).width;
  });

  let x =
    centerX -
    totalWidth / 2;

  for (
    let i = 0;
    i < words.length;
    i++
  ) {

    const word =
      words[i];

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

    x +=
      ctx.measureText(
        word + " "
      ).width;
  }
}

// ======================================
// ROUND RECT
// ======================================

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

// ======================================
// START RECORDING
// ======================================

async function startCanvasRecording() {

  try {

    // ======================================
    // BLOCK DOUBLE START
    // ======================================

    if (isRecording)
      return;

    isRecording = true;

    recordingStopped = false;

    // ======================================
    // GET TAB AUDIO
    // ======================================

    screenAudioStream =

      await navigator
        .mediaDevices
        .getDisplayMedia({

          video: true,

          audio: true,

          preferCurrentTab: true
        });

    // ======================================
    // CANVAS STREAM
    // ======================================

    canvasStream =
      canvas.captureStream(30);

    // ======================================
    // AUDIO TRACKS
    // ======================================

    const audioTracks = [];

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

    // ======================================
    // MERGED STREAM
    // ======================================

    mergedStream =
      new MediaStream([

        ...canvasStream
          .getVideoTracks(),

        ...audioTracks
      ]);

    // ======================================
    // RESET CHUNKS
    // ======================================

    canvasChunks = [];

    // ======================================
    // MIME
    // ======================================

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

    // ======================================
    // RECORDER
    // ======================================

    canvasRecorder =
      new MediaRecorder(
        mergedStream,
        options
      );

    // ======================================
    // DATA
    // ======================================

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

    // ======================================
    // ERROR
    // ======================================

    canvasRecorder.onerror =
      function (err) {

        console.log(err);

        alert(
          "Recording error"
        );
      };

    // ======================================
    // STOP
    // ======================================

    canvasRecorder.onstop =
      function () {

        try {

          if (
            recordingStopped
          ) {

            return;
          }

          recordingStopped = true;

          // ======================================
          // CREATE BLOB
          // ======================================

          const blob =
            new Blob(
              canvasChunks,
              {
                type:
                  options.mimeType
              }
            );

          // ======================================
          // URL
          // ======================================

          const videoURL =
            URL.createObjectURL(
              blob
            );

          // ======================================
          // DOWNLOAD
          // ======================================

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

          // ======================================
          // CLEAN
          // ======================================

          setTimeout(() => {

            URL.revokeObjectURL(
              videoURL
            );

            if (
              document.body.contains(
                a
              )
            ) {

              document.body
                .removeChild(a);
            }

          }, 3000);

          // ======================================
          // STOP TRACKS
          // ======================================

          if (
            screenAudioStream
          ) {

            screenAudioStream
              .getTracks()
              .forEach(track => {

                track.stop();
              });
          }

          if (
            mergedStream
          ) {

            mergedStream
              .getTracks()
              .forEach(track => {

                track.stop();
              });
          }

          isRecording = false;

        } catch (err) {

          console.log(err);

          alert(
            "Video export failed"
          );

          isRecording = false;
        }
      };

    // ======================================
    // START
    // ======================================

    canvasRecorder.start(
      1000
    );

  } catch (err) {

    console.log(err);

    isRecording = false;

    alert(
      "Chrome tab + Share tab audio allow करें"
    );
  }
}

// ======================================
// STOP RECORDING
// ======================================

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
