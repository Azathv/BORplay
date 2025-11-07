// Elementlar
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const songTitle = document.getElementById('songTitle');
const coverImage = document.getElementById('coverImage');
const progressBar = document.getElementById('progressBar');

const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

const visibilityBtn = document.getElementById('visibilityBtn');
const eyeIcon = document.getElementById('eyeIcon');

let visible = true;

// 📤 Upload: har qanday qurilmada fayl tanlash oynasini ochadi
uploadBtn.addEventListener('click', () => fileInput.click());

// MP3 tanlanganda avtomatik yuklab, o‘ynatamiz
fileInput.addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!/^audio\//.test(file.type)) {
    alert('❗ Faqat audio (MP3) fayl tanlang'); return;
  }
  const url = URL.createObjectURL(file);
  audio.src = url;
  songTitle.textContent = (file.name || 'MP3').replace(/\.mp3$/i, '');
  audio.play().catch(()=>{}); // iOS autoplay cheklovlariga yumshoq urinish
  playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  coverImage.classList.add('rotate');
});

// ▶️/⏸ Play-Pause
playBtn.addEventListener('click', () => {
  if (!audio.src) { fileInput.click(); return; }
  if (audio.paused) {
    audio.play().catch(()=>{});
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    coverImage.classList.add('rotate');
  } else {
    audio.pause();
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    coverImage.classList.remove('rotate');
  }
});

// 📊 Progress (silliq animatsiya)
audio.addEventListener('timeupdate', () => {
  const pct = (audio.currentTime / (audio.duration || 1)) * 100;
  progressBar.style.width = `${pct}%`;
});
audio.addEventListener('ended', () => {
  playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  coverImage.classList.remove('rotate');
  progressBar.style.width = '0%';
});

// 👁 Ko‘rinish tugmasi (hozircha UI state)
visibilityBtn.addEventListener('click', () => {
  visible = !visible;
  visibilityBtn.classList.toggle('off', !visible);
  eyeIcon.classList.toggle('fa-eye',  visible);
  eyeIcon.classList.toggle('fa-eye-slash', !visible);
});
