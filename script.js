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
    audioElement.controls = true;

    let recordingDiv = document.createElement("div");
    recordingDiv.appendChild(audioElement);

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList = "btn btn-danger delBtn";
    deleteButton.addEventListener("click", function () {
      deleteRecording(index);
    });

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
