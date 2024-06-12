// Initialize variables
let mediaRecorder;
let recordedChunks = [];

// Access the user's microphone
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(function (stream) {
    // Create a MediaRecorder object to record audio
    mediaRecorder = new MediaRecorder(stream);

    // Event handler when data is available
    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Event handler when recording stops
    mediaRecorder.onstop = function () {
      // Combine all recorded chunks into a single Blob
      let recordedBlob = new Blob(recordedChunks, { type: "audio/wav" });

      // Optionally, you can upload the recorded audio to a server here

      // Example of playing the recorded audio
      let audioElement = new Audio();
      audioElement.src = URL.createObjectURL(recordedBlob);
      audioElement.controls = true;
      document.body.appendChild(audioElement);

      // Update the UI to indicate recording has stopped
      document.getElementById("recordingStatus").textContent =
        "Recording stopped.";
      document.getElementById("startRecording").disabled = false;
      document.getElementById("stopRecording").disabled = true;
    };

    // Start recording when the user clicks a button
    document
      .getElementById("startRecording")
      .addEventListener("click", function () {
        recordedChunks = [];
        mediaRecorder.start();
        document.getElementById("recordingStatus").textContent = "Recording...";
        document.getElementById("startRecording").disabled = true;
        document.getElementById("stopRecording").disabled = false;
      });

    // Stop recording when the user clicks a button
    document
      .getElementById("stopRecording")
      .addEventListener("click", function () {
        mediaRecorder.stop();
      });
  })
  .catch(function (err) {
    console.error("Error accessing microphone: ", err);
  });
