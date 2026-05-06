const fileInput = document.getElementById("fileInput");
const textInput = document.getElementById("textInput");
const img = document.getElementById("img");
const textBox = document.getElementById("textBox");
const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");
const watermark = document.getElementById("watermark");
const userName = document.getElementById("userName");
const speedControl = document.getElementById("speedControl");

let voiceMode = "female";
let lines = [];
let index = 0;

function setVoice(type){
  voiceMode = type;
}

// IMAGE
fileInput.addEventListener("change", e=>{
  const file = e.target.files[0];
  if(file){
    img.src = URL.createObjectURL(file);
    img.style.display = "block";
  }
});

// SPLIT
function splitLines(text){
  return text.split(/\n|[।.!?]/).filter(l=>l.trim());
}

// PLAY
playBtn.onclick = ()=>{
  const text = textInput.value.trim();
  if(!text) return alert("लेख लिखें");

  watermark.innerText = "© " + userName.value;

  lines = splitLines(text);
  index = 0;

  speakNext();
};

// RESTART
restartBtn.onclick = ()=>{
  index = 0;
  speechSynthesis.cancel();
  speakNext();
};

// TYPING EFFECT
function typeText(text, cb){
  textBox.innerHTML = "";
  let i = 0;
  let interval = setInterval(()=>{
    textBox.innerHTML += text[i];
    i++;
    if(i>=text.length){
      clearInterval(interval);
      cb();
    }
  },30);
}

// MOOD COLOR
function getColor(word){
  if(word.includes("सत्य")) return "red";
  if(word.includes("सफल")) return "yellow";
  return "white";
}

// SPEAK
function speakNext(){

  if(index >= lines.length) return;

  let line = lines[index];

  // highlight
  let words = line.split(" ").map(w=>{
    return `<span style="color:${getColor(w)}">${w}</span>`;
  }).join(" ");

  typeText(words, ()=>{

    const speech = new SpeechSynthesisUtterance(line);

    let voices = speechSynthesis.getVoices();

    let male = voices.find(v=>v.lang==="en-IN") || voices[0];
    let female = voices.find(v=>v.lang.includes("hi")) || voices[0];

    if(voiceMode==="female"){
      speech.voice = female;
      speech.pitch = 1.2;
    }
    else if(voiceMode==="male"){
      speech.voice = male;
      speech.pitch = 0.5;
    }
    else{
      speech.voice = index%2===0 ? female : male;
      speech.pitch = index%2===0 ? 1.2 : 0.5;
    }

    speech.rate = speedControl.value;

    speech.onend = ()=>{
      index++;
      setTimeout(speakNext,600);
    };

    speechSynthesis.speak(speech);
  });
}
