// 1) Playlist — HTTPS manzillar (CORS muammosiz)
const TRACKS = [
  {
    title: "Night Drive",
    artist: "B-Play",
    url: "https://filesamples.com/samples/audio/mp3/sample3.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=700&auto=format&fit=crop"
  },
  {
    title: "Neon Skies",
    artist: "Cyber Bloom",
    url: "https://filesamples.com/samples/audio/mp3/sample1.mp3",
    cover: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=700&auto=format&fit=crop"
  },
  {
    title: "Soft Lights",
    artist: "Lo Vibe",
    url: "https://filesamples.com/samples/audio/mp3/sample2.mp3",
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=700&auto=format&fit=crop"
  }
];

// 2) Elementlar
const audio   = document.getElementById("audio");
const cover   = document.getElementById("cover");
const titleEl = document.getElementById("title");
const artistEl= document.getElementById("artist");
const seek    = document.getElementById("seek");
const cur     = document.getElementById("current");
const dur     = document.getElementById("duration");
const vol     = document.getElementById("vol");
const bPlay   = document.getElementById("btn-play");
const iPlay   = document.getElementById("ico-play");
const iPause  = document.getElementById("ico-pause");
const bPrev   = document.getElementById("btn-prev");
const bNext   = document.getElementById("btn-next");
const bRep    = document.getElementById("btn-repeat");
const bShuf   = document.getElementById("btn-shuffle");
const list    = document.getElementById("playlist");
const bClose  = document.getElementById("btn-close");
const tgUser  = document.getElementById("tgUser");

// 3) Telegram salom (fallback bilan)
try{
  const tg = window.Telegram?.WebApp;
  tg?.expand?.();
  if (tg?.initDataUnsafe?.user){
    tgUser.textContent = `👋 ${tg.initDataUnsafe.user.first_name}`;
  } else {
    tgUser.textContent = "🎧 BorPlay";
  }
}catch(e){ tgUser.textContent = "🎧 BorPlay"; }

// 4) State
let i = 0;
let repeat = false;
let shuffle = false;

// 5) Yordamchilar
const fmt = t => isNaN(t) ? "0:00" : `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,"0")}`;
const setIcon = paused => {
  iPlay.style.display  = paused ? "block" : "none";
  iPause.style.display = paused ? "none"  : "block";
};

function highlight(){
  [...document.querySelectorAll(".track")].forEach((el, idx)=>{
    el.classList.toggle("active", idx===i);
  });
}

// 6) Trek yuklash
function load(idx){
  i = (idx + TRACKS.length) % TRACKS.length;
  const t = TRACKS[i];
  audio.src = t.url;
  cover.src = t.cover;
  titleEl.textContent = t.title;
  artistEl.textContent = t.artist;
  highlight();
}

// 7) Playlist UI
function buildList(){
  list.innerHTML = "";
  TRACKS.forEach((t, idx)=>{
    const row = document.createElement("div");
    row.className = "track";
    row.innerHTML = `
      <img src="${t.cover}" alt="">
      <div class="t-meta">
        <span class="t-title">${t.title}</span>
        <span class="t-artist">${t.artist}</span>
      </div>
    `;
    row.addEventListener("click", ()=>{ load(idx); audio.play(); });
    list.appendChild(row);
  });
}

// 8) Eventlar
bPlay.addEventListener("click", ()=> audio.paused ? audio.play() : audio.pause());
audio.addEventListener("play", ()=> setIcon(false));
audio.addEventListener("pause",()=> setIcon(true));

bPrev.addEventListener("click", ()=>{
  if (shuffle){ i = Math.floor(Math.random()*TRACKS.length); }
  else { i = (i - 1 + TRACKS.length) % TRACKS.length; }
  load(i); audio.play();
});
bNext.addEventListener("click", ()=>{
  if (shuffle){ i = Math.floor(Math.random()*TRACKS.length); }
  else { i = (i + 1) % TRACKS.length; }
  load(i); audio.play();
});

bRep.addEventListener("click", ()=>{
  repeat = !repeat;
  bRep.style.opacity = repeat ? 1 : .75;
});
bShuf.addEventListener("click", ()=>{
  shuffle = !shuffle;
  bShuf.style.opacity = shuffle ? 1 : .75;
});

audio.addEventListener("timeupdate", ()=>{
  seek.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  cur.textContent = fmt(audio.currentTime);
  dur.textContent = fmt(audio.duration || 0);
});
seek.addEventListener("input", ()=>{
  if (audio.duration) audio.currentTime = (seek.value/100) * audio.duration;
});
vol.addEventListener("input", ()=> audio.volume = +vol.value);

audio.addEventListener("ended", ()=>{
  if (repeat){ audio.currentTime = 0; audio.play(); return; }
  bNext.click();
});

bClose.addEventListener("click", ()=> { try{ window.Telegram?.WebApp?.close(); }catch(e){} });

// 9) Init
buildList();
load(0);
setIcon(true);
audio.volume = +vol.value;
