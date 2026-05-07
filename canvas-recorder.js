// ===== START RECORDING =====
async function startCanvasRecording() {

  try {

    // ===== GET SCREEN + AUDIO =====
    screenStream =
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100
        }
      });

    // ===== CANVAS VIDEO =====
    canvasStream = canvas.captureStream(30);

    // ===== GET AUDIO TRACK =====
    const screenAudioTracks =
      screenStream.getAudioTracks();

    // ===== CHECK AUDIO =====
    if (!screenAudioTracks.length) {

      alert(
        "System audio नहीं मिला.\n\nScreen Share करते समय:\n✔ Share tab audio ON करें"
      );

      return;
    }

    // ===== CREATE FINAL STREAM =====
    mergedStream = new MediaStream();

    // ===== ADD CANVAS VIDEO =====
    canvasStream
      .getVideoTracks()
      .forEach(track => {
        mergedStream.addTrack(track);
      });

    // ===== ADD AUDIO =====
    screenAudioTracks
      .forEach(track => {
        mergedStream.addTrack(track);
      });

    // ===== RESET =====
    canvasChunks = [];

    // ===== BEST MIME =====
    let mimeType = "";

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

    } else {

      mimeType = "video/webm";
    }

    // ===== RECORDER =====
    canvasRecorder =
      new MediaRecorder(
        mergedStream,
        {
          mimeType,
          videoBitsPerSecond: 8000000,
          audioBitsPerSecond: 128000
        }
      );

    // ===== DATA =====
    canvasRecorder.ondataavailable =
      (event) => {

        if (
          event.data &&
          event.data.size > 0
        ) {

          canvasChunks.push(
            event.data
          );
        }
      };

    // ===== STOP =====
    canvasRecorder.onstop =
      () => {

        // ===== CREATE VIDEO =====
        const blob =
          new Blob(
            canvasChunks,
            {
              type: mimeType
            }
          );

        // ===== DOWNLOAD =====
        const videoURL =
          URL.createObjectURL(blob);

        const a =
          document.createElement("a");

        a.href = videoURL;

        a.download =
          "canvas-recording.webm";

        document.body.appendChild(a);

        a.click();

        // ===== CLEAN =====
        setTimeout(() => {

          URL.revokeObjectURL(
            videoURL
          );

          a.remove();

        }, 2000);
      };

    // ===== ERROR =====
    canvasRecorder.onerror =
      (e) => {

        console.log(e);

        alert(
          "Recording Error"
        );
      };

    // ===== START =====
    canvasRecorder.start(1000);

    console.log(
      "Recording Started"
    );

  } catch (err) {

    console.log(err);

    alert(
      "Permission denied or screen audio unavailable"
    );
  }
}

// ===== STOP =====
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

    // ===== STOP STREAMS =====
    if (screenStream) {

      screenStream
        .getTracks()
        .forEach(track => {

          track.stop();
        });
    }

    if (canvasStream) {

      canvasStream
        .getTracks()
        .forEach(track => {

          track.stop();
        });
    }

  } catch (err) {

    console.log(err);
  }
}
