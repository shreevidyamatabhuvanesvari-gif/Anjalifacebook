// ======================================================
// REAL WORKING MOBILE SAFE RECORDER
// ======================================================

// ===== ELEMENTS =====
const canvas =
  document.getElementById(
    "reelCanvas"
  );

const ctx =
  canvas.getContext("2d");

const audio =
  document.getElementById(
    "ttsAudio"
  );

const imageInput =
  document.getElementById(
    "imageInput"
  );

const textBox =
  document.getElementById(
    "textBox"
  );

const watermark =
  document.getElementById(
    "watermark"
  );

// ===== SIZE =====
canvas.width = 1080;
canvas.height = 1920;

// ===== IMAGE =====
let img = null;

// ===== RECORDER =====
let recorder;

let chunks = [];

let animationId;

// ======================================================
// LOAD IMAGE FROM INPUT
// ======================================================
imageInput.addEventListener(
  "change",
  function (e) {

    const file =
      e.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload =
      function (event) {

        img = new Image();

        img.onload =
          function () {

            console.log(
              "Image loaded"
            );

            drawCanvas();
          };

        img.src =
          event.target.result;
      };

    reader.readAsDataURL(
      file
    );
  }
);

// ======================================================
// DRAW CANVAS
// ======================================================
function drawCanvas() {

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
  if (img) {

    ctx.drawImage(
      img,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  // ===== TEXT BOX =====
  ctx.fillStyle =
    "rgba(0,0,0,0.5)";

  ctx.fillRect(
    60,
    760,
    960,
    420
  );

  // ===== TEXT =====
  ctx.fillStyle = "white";

  ctx.font =
    "bold 54px sans-serif";

  ctx.fillText(
    textBox.value || "",
    100,
    860
  );

  // ===== WATERMARK =====
  ctx.font =
    "bold 32px sans-serif";

  ctx.fillText(
    watermark.value || "",
    100,
    1300
  );

  animationId =
    requestAnimationFrame(
      drawCanvas
    );
}

// ======================================================
// START RECORDING
// ======================================================
async function startRecording() {

  try {

    if (!img) {

      alert(
        "पहले image upload करें"
      );

      return;
    }

    // ===== RESET =====
    chunks = [];

    // ===== START DRAW =====
    drawCanvas();

    // ===== VIDEO STREAM =====
    const videoStream =
      canvas.captureStream(30);

    // ===== AUDIO STREAM =====
    let audioStream;

    if (
      audio.captureStream
    ) {

      audioStream =
        audio.captureStream();

    } else {

      alert(
        "captureStream not supported"
      );

      return;
    }

    // ===== FINAL STREAM =====
    const finalStream =
      new MediaStream();

    // ===== VIDEO =====
    videoStream
      .getVideoTracks()
      .forEach(track => {

        finalStream.addTrack(
          track
        );
      });

    // ===== AUDIO =====
    audioStream
      .getAudioTracks()
      .forEach(track => {

        finalStream.addTrack(
          track
        );
      });

    // ===== RECORDER =====
    recorder =
      new MediaRecorder(
        finalStream,
        {
          mimeType:
            "video/webm"
        }
      );

    // ===== DATA =====
    recorder.ondataavailable =
      e => {

        if (
          e.data.size > 0
        ) {

          chunks.push(
            e.data
          );
        }
      };

    // ===== STOP =====
    recorder.onstop =
      function () {

        const blob =
          new Blob(
            chunks,
            {
              type:
                "video/webm"
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const a =
          document.createElement(
            "a"
          );

        a.href = url;

        a.download =
          "video.webm";

        a.click();

        URL.revokeObjectURL(
          url
        );
      };

    // ===== START =====
    recorder.start();

    // ===== PLAY AUDIO =====
    await audio.play();

    // ===== AUTO STOP =====
    audio.onended =
      function () {

        stopRecording();
      };

  } catch (err) {

    console.log(err);

    alert(err.message);
  }
}

// ======================================================
// STOP
// ======================================================
function stopRecording() {

  if (
    recorder &&
    recorder.state ===
      "recording"
  ) {

    recorder.stop();
  }

  cancelAnimationFrame(
    animationId
  );
}
