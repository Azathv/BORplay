const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const songTitle = document.getElementById("songTitle");
const coverImage = document.getElementById("coverImage");
const progressBar = document.getElementById("progressBar");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const visibilityBtn = document.getElementById("visibilityBtn");
const eyeIcon = document.getElementById("eyeIcon");

let visible = true;

// 🔸 Upload - ochish
uploadBtn.addEventListener("click", () => fileInput.click());

// 🔹 MP3 yuklash
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.type === "audio/mpeg") {
    const fileURL = URL.createObjectURL(file);
    audio.src = fileURL;
    songTitle.textContent = file.name.replace(".mp3", "");
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    coverImage.classList.add("rotate");
  } else {
    alert("❗ Faqat MP3 fayllarni tanlang!");
  }
});

// ▶️ / ⏸ PLAY
playBtn.addEventListener("click", () => {
  if (!audio.src) return alert("Avval MP3 yuklang 🎶");
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    coverImage.classList.add("rotate");
  } else {
    audio.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    coverImage.classList.remove("rotate");
  }
});

// 📊 Progress bar
audio.addEventListener("timeupdate", () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = percent + "%";
});

// 🔁 Tugaganda reset
audio.addEventListener("ended", () => {
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  coverImage.classList.remove("rotate");
  progressBar.style.width = "0%";
});

// 👁 Ko‘rinish tugmasi
visibilityBtn.addEventListener("click", () => {
  visible = !visible;
  if (visible) {
    visibilityBtn.classList.remove("off");
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  } else {
    visibilityBtn.classList.add("off");
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  }
});
