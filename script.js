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

      // Convert Blob to base64 for local storage
      let reader = new FileReader();
      reader.readAsDataURL(recordedBlob);
      reader.onloadend = function () {
        let base64data = reader.result;
        saveRecording(base64data);
        displayRecordings();
      };

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

    // Display saved recordings on page load
    displayRecordings();
  })
  .catch(function (err) {
    console.error("Error accessing microphone: ", err);
  });

// Save the recording to local storage
function saveRecording(base64data) {
  let recordings = JSON.parse(localStorage.getItem("recordings")) || [];
  recordings.push(base64data);
  localStorage.setItem("recordings", JSON.stringify(recordings));
}

// Display saved recordings
function displayRecordings() {
  let recordings = JSON.parse(localStorage.getItem("recordings")) || [];
  let savedRecordingsDiv = document.getElementById("savedRecordings");
  savedRecordingsDiv.innerHTML = "";

  recordings.forEach((recording, index) => {
    let audioElement = new Audio();
    audioElement.src = recording;

    let recordingDiv = document.createElement("div");

    let playButton = document.createElement("button");
    playButton.textContent = "Play";
    playButton.classList = "btn btn-success";
    playButton.addEventListener("click", function () {
      audioElement.play();
      playButton.style.display = "none";
      stopButton.style.display = "inline";
    });

    let stopButton = document.createElement("button");
    stopButton.textContent = "Stop";
    stopButton.style.display = "none";
    stopButton.classList = "btn btn-danger";
    stopButton.addEventListener("click", function () {
      audioElement.pause();
      audioElement.currentTime = 0;
      playButton.style.display = "inline";
      stopButton.style.display = "none";
    });

    audioElement.addEventListener("ended", function () {
      playButton.style.display = "inline";
      stopButton.style.display = "none";
    });

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList = "btn btn-warning";
    deleteButton.addEventListener("click", function () {
      deleteRecording(index);
    });

    // Create the progress bar
    let progressBar = document.createElement("input");
    progressBar.type = "range";
    progressBar.min = 0;
    progressBar.max = 100;
    progressBar.value = 0;

    // Update the progress bar as the audio plays
    audioElement.addEventListener("timeupdate", function () {
      let progress = (audioElement.currentTime / audioElement.duration) * 100;
      progressBar.value = progress;
    });

    // Allow seeking by clicking on the progress bar
    progressBar.addEventListener("input", function () {
      let seekTime = (progressBar.value / 100) * audioElement.duration;
      audioElement.currentTime = seekTime;
    });

    recordingDiv.appendChild(playButton);
    recordingDiv.appendChild(stopButton);
    recordingDiv.appendChild(progressBar);
    recordingDiv.appendChild(deleteButton);
    savedRecordingsDiv.appendChild(recordingDiv);
  });
}

// Delete a recording from local storage
function deleteRecording(index) {
  let recordings = JSON.parse(localStorage.getItem("recordings")) || [];
  recordings.splice(index, 1);
  localStorage.setItem("recordings", JSON.stringify(recordings));
  displayRecordings();
}
