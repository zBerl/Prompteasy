let speedFactor = 2; // Controls the speed of the scrolling
let textElement, videoElement, recordingStatus, timerElement;
let mediaRecorder;
let recordedBlobs = [];
let position = 0;
let isPaused = false;
let scrollInterval;
let holdTimeout;  // Declare a variable for holding the timeout reference
let timerInterval; // Declare a variable for holding the timer interval reference
let startTime; // Declare a variable to store the start time

document.addEventListener('DOMContentLoaded', (event) => {
  textElement = document.getElementById('text');
  videoElement = document.getElementById('video');
  recordingStatus = document.getElementById('recordingStatus');
  timerElement = document.getElementById('timer');
  
  startScrolling();
  initWebcam();
});

// Initialize webcam and audio for recording
function initWebcam() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }) // Requesting audio and video
    .then(stream => {
      videoElement.srcObject = stream;
      setupRecording(stream);
    })
    .catch(error => {
      console.error('Error accessing webcam and microphone', error);
    });
}

function setupRecording(stream) {
  let options = { mimeType: 'video/mp4' };
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    return;
  }
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = onRecordingStop;
}

function startRecording() {
  recordedBlobs = [];
  mediaRecorder.start();
  updateRecordingStatus('Recording started... Recording in process.');
  startTimer();
  console.log('Recording started');
}

function stopRecording() {
  mediaRecorder.stop();
  updateRecordingStatus('Recording stopped. Download of recording is being saved.', true, 12000);
  stopTimer();
  console.log('Recording stopped');
}

function onRecordingStop() {
  const superBuffer = new Blob(recordedBlobs, { type: 'video/mp4' });
  const url = URL.createObjectURL(superBuffer);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'recorded.mp4';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function scrollText() {
  position += speedFactor;
  textElement.style.transform = `translateY(-${position}px)`;

  if (position > textElement.clientHeight) {
    position = 0; // Reset position to loop the text
  }
}

function startScrolling() {
  if (!scrollInterval) {
    scrollInterval = setInterval(scrollText, 100); // Controls the scroll speed
  }
}

function stopScrolling() {
  clearInterval(scrollInterval); // Stop the scrolling
  scrollInterval = null;
}

function setSpeed(newSpeed) {
  speedFactor = newSpeed;
  if (!isPaused) {
    stopScrolling();
    startScrolling(); // Restart scrolling with the new speed
  }
}

function togglePause() {
  isPaused = !isPaused; // Toggle the pause state
  if (isPaused) {
    stopScrolling(); // Stop scrolling when paused
  } else {
    startScrolling(); // Resume scrolling when not paused
  }
}

function holdScroll() {
  if (!isPaused) {
    stopScrolling(); // Ensure scrolling is stopped
    clearTimeout(holdTimeout); // Clear any previous hold timeout to avoid overlaps
    holdTimeout = setTimeout(() => {
      if (!isPaused) { // Check if not paused to resume
        startScrolling(); // Resume scrolling after 5 seconds
      }
    }, 5000); // Hold for 5 seconds
  }
}

function updateText() {
  const inputText = document.getElementById('inputText').value;
  textElement.textContent = ''; // Clear current text
  textElement.innerHTML = inputText; // Insert new formatted text
  position = 0; // Reset scroll position when updating text
}

function changeTheme() {
  const theme = document.getElementById('themeSelector').value;
  document.body.className = theme; // Apply the selected theme class to the body
}

function updateRecordingStatus(message, persist = false, duration = 3000) {
  recordingStatus.textContent = message;
  if (!persist) {
    setTimeout(() => {
      recordingStatus.textContent = '';
    }, duration); // Clear the message after the specified duration
  }
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    timerElement.textContent = `Recording Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, 1000); // Update the timer every second
}

function stopTimer() {
  clearInterval(timerInterval);
  timerElement.textContent = '';
}
