const fileInput = document.getElementById("fileInput");
const textInput = document.getElementById("textInput");
const img = document.getElementById("img");
const textBox = document.getElementById("textBox");
const playBtn = document.getElementById("playBtn");
const watermark = document.getElementById("watermark");
const userName = document.getElementById("userName");

let lines = [];
let index = 0;
let voices = [];

// voices load fix
speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
};

// image load
fileInput.onchange = () => {
  const file = fileInput.files[0];
  if(file){
    img.src = URL.createObjectURL(file);
    img.style.display = "block";
  }
};

// split text
function split(text){
  return text.split(/\n|[।.!?]/).filter(t => t.trim());
}

// play
playBtn.onclick = () => {
  if(!textInput.value) return alert("लेख लिखें");

  watermark.innerText = "© " + userName.value;

  lines = split(textInput.value);
  index = 0;

  speak();
};

// speak
function speak(){

  if(index >= lines.length) return;

  let line = lines[index];

  textBox.innerText = line; // safe (no html conflict)

  let speech = new SpeechSynthesisUtterance(line);

  let female = voices.find(v => v.lang.includes("hi")) || voices[0];
  let male = voices.find(v => v.lang === "en-IN") || voices[0];

  // auto voice change
  speech.voice = index % 2 === 0 ? female : male;

  speech.rate = 0.9;
  speech.pitch = index % 2 === 0 ? 1.2 : 0.6;

  speech.onend = () => {
    index++;
    setTimeout(speak, 500);
  };

  speechSynthesis.speak(speech);
}
