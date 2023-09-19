const canvas = document.querySelector("#plot");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const analyser = audioCtx.createAnalyser();
analyser.fftSize = 512;

const width = 1024;
const height = 500;

const bufferLength = analyser.frequencyBinCount;

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    audioCtx.resume();
    const microphone = audioCtx.createMediaStreamSource(stream);
    microphone.connect(analyser);
  })
  .catch((err) => {});

const canvasCtx = canvas.getContext("2d");

const history = [];

const addToHistory = (arr) => {
  history.push(arr);
  if (history.length > height / 2) {
    history.shift();
  }
};

const buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);

// Start the buffer source to begin scheduling
const scheduleNext = () => {
  const currentTime = audioCtx.currentTime;
  const bufferSource = audioCtx.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.loop = true;

  // Schedule the evaluation function to be called every 50ms
  bufferSource.connect(audioCtx.destination);
  bufferSource.start(currentTime);
  bufferSource.stop(currentTime + 0.01); // 50ms interval

  bufferSource.onended = () => {
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    analyser.getByteFrequencyData(dataArray);
    addToHistory(dataArray);
    draw();
    scheduleNext();
  };
};
scheduleNext();

console.log(bufferLength)

function draw() {
  canvasCtx.fillStyle = "rgb(0, 0, 0)";
  canvasCtx.fillRect(0, 0, width, height);

  for(let i = 0; i < history.length; i++){
    for(let j = 0; j < history[i].length; j++) {
        const value = history[history.length - 1 - i][j];
        const maxHue = 120;
        const minHue = 0;
        canvasCtx.fillStyle = `hsl(${value * (maxHue - minHue) + minHue}, 100%, ${value}%)`
        canvasCtx.fillRect(j*(width/bufferLength), i*2, width/bufferLength, 2);
    }
   
  }
}
