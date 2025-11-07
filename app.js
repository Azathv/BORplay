// Audio elementlar
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const songTitle = document.getElementById("songTitle");

// Upload funksiyasi
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

uploadBtn.addEventListener("click", () => {
  // Har qanday qurilmada (kompyuter, telefon, iPhone, Android)
  // bu kod avtomatik fayl tanlash oynasini ochadi:
  fileInput.click();
});

// Foydalanuvchi fayl tanlaganda:
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type === "audio/mpeg") {
    const fileURL = URL.createObjectURL(file);
    audio.src = fileURL;
    songTitle.textContent = file.name.replace(".mp3", "");
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    alert("Faqat MP3 formatdagi fayllarni tanlang 🎵");
  }
});

// Play/pause
playBtn.addEventListener("click", () => {
  if (audio.src) {
    if (audio.paused) {
      audio.play();
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      audio.pause();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  } else {
    alert("Avval MP3 yuklang 🎶");
  }
});

// Progress bar yangilash
audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
});

// Progress bar o‘zgartirilsa
progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

// Ko‘rinish (visibility) tugmasi
const visibilityBtn = document.getElementById("visibilityToggle");
const eyeIcon = document.getElementById("eyeIcon");
let isVisible = true;

visibilityBtn.addEventListener("click", () => {
  isVisible = !isVisible;
  if (isVisible) {
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
    visibilityBtn.classList.remove("off");
  } else {
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
    visibilityBtn.classList.add("off");
  }
});
