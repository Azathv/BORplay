// === Supabase ulanish ===
const SUPABASE_URL = "https://xeidlpkwwpghtlzocjjh.supabase.co"; //
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaWRscGt3d3BnaHRsem9jampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDY0MjQsImV4cCI6MjA3NzU4MjQyNH0.40V9blptMQ9pTU8kHAqtlyaduoFevOO12uW563WTToI
"; //

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const songTitle = document.getElementById("songTitle");
const progressBar = document.getElementById("progressBar");
const coverImage = document.getElementById("coverImage");
const visibilityBtn = document.getElementById("visibilityBtn");
const eyeIcon = document.getElementById("eyeIcon");

// ❤️ Sevimlilar tugmasi
const favBtn = document.createElement("button");
favBtn.classList.add("btn", "fav");
favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
document.querySelector(".controls").appendChild(favBtn);

// 🎵 Qo‘shiqlar ro‘yxatini chiqarish uchun div
const playlist = document.createElement("div");
playlist.id = "playlist";
playlist.style.marginTop = "20px";
playlist.style.textAlign = "left";
playlist.style.maxHeight = "200px";
playlist.style.overflowY = "auto";
document.querySelector(".controls-container").appendChild(playlist);

let visible = true;
let isFavorite = false;
let currentSong = null;

// Supabase SDK ni yuklaymiz
import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm").then(
  ({ createClient }) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 📤 Upload tugmasi
    uploadBtn.addEventListener("click", () => fileInput.click());

    // Fayl tanlanganda
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file || !/^audio\//.test(file.type)) {
        alert("❗ Faqat MP3 fayllarni tanlang!");
        return;
      }

      // Fayl nomini tozalaymiz (Supabase `[ ] ( ) # ?` belgilarni qabul qilmaydi)
      const safeName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      const fileName = `${Date.now()}_${safeName}`;

      // Faylni Supabase bucket'ga yuklaymiz
      const { data, error } = await supabase.storage
        .from("songs")
        .upload(fileName, file);

      if (error) {
        alert("Xatolik: " + error.message);
        return;
      }

      // URL olish
      const { data: publicUrl } = supabase.storage
        .from("songs")
        .getPublicUrl(fileName);
      const songUrl = publicUrl.publicUrl;

      // Playlistga qo‘shish
      addSongToList(file.name, songUrl);

      // Avtomatik o‘ynatish
      playSong(file.name, songUrl);
    });

    // ▶️ / ⏸ Play tugmasi
    playBtn.addEventListener("click", () => {
      if (!audio.src) return alert("Avval MP3 yuklang 🎶");
      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        coverImage.classList.add("rotate");
      } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        coverImage.classList.remove("rotate");
      }
    });

    // 📊 Progress
    audio.addEventListener("timeupdate", () => {
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      progressBar.style.width = `${pct}%`;
    });

    // ❤️ Sevimlilar tugmasi
    favBtn.addEventListener("click", () => {
      isFavorite = !isFavorite;
      favBtn.innerHTML = isFavorite
        ? '<i class="fa-solid fa-heart" style="color:#ff79c6"></i>'
        : '<i class="fa-regular fa-heart"></i>';
    });

    // 👁 Ko‘rinish tugmasi
    visibilityBtn.addEventListener("click", () => {
      visible = !visible;
      visibilityBtn.classList.toggle("off", !visible);
      eyeIcon.classList.toggle("fa-eye", visible);
      eyeIcon.classList.toggle("fa-eye-slash", !visible);
    });

    // 🎧 Qo‘shiqlar ro‘yxatiga qo‘shish funksiyasi
    function addSongToList(name, url) {
      const songItem = document.createElement("div");
      songItem.textContent = "🎵 " + name;
      songItem.style.padding = "6px 0";
      songItem.style.cursor = "pointer";
      songItem.style.borderBottom = "1px solid #333";
      songItem.addEventListener("click", () => playSong(name, url));
      playlist.appendChild(songItem);
    }

    // 🎶 Qo‘shiqni o‘ynatish funksiyasi
    function playSong(name, url) {
      currentSong = url;
      audio.src = url;
      songTitle.textContent = name.replace(".mp3", "");
      audio.play();
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      coverImage.classList.add("rotate");
    }
  }
);
