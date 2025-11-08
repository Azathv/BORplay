const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaWRscGt3d3BnaHRsem9jampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDY0MjQsImV4cCI6MjA3NzU4MjQyNH0.40V9blptMQ9pTU8kHAqtlyaduoFevOO12uW563WTToI";

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const playBtn = document.getElementById("playBtn");
const songTitle = document.getElementById("songTitle");
const progressBar = document.getElementById("progressBar");
const coverImage = document.getElementById("coverImage");
const visibilityBtn = document.getElementById("visibilityBtn");
const eyeIcon = document.getElementById("eyeIcon");
const audio = document.getElementById("audio");

let visible = true;
let currentSong = null;
let currentSongId = null;
let hasCounted = false;
let userSeeked = false;

import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm").then(
  async ({ createClient }) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const playlist = document.createElement("div");
    playlist.id = "playlist";
    document.querySelector(".controls-container").appendChild(playlist);

    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file || !/^audio\//.test(file.type)) {
        alert("❗ Faqat MP3 fayl tanlang!");
        return;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      const fileName = `${Date.now()}_${safeName}`;

      const { data, error } = await supabase.storage
        .from("songs")
        .upload(fileName, file);
      if (error) { alert("Xatolik: " + error.message); return; }

      const { data: publicUrl } = supabase.storage.from("songs").getPublicUrl(fileName);
      const songUrl = publicUrl.publicUrl;
      await supabase.from("stats").insert({ song_name: file.name, url: songUrl, play_count: 0 });

      addSongToList(file.name, songUrl);
      playSong(file.name, songUrl);
    });

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

    audio.addEventListener("seeking", () => { userSeeked = true; });
    audio.addEventListener("timeupdate", async () => {
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      progressBar.style.width = `${pct}%`;
      if (pct > 50 && !hasCounted && !userSeeked && currentSongId) {
        hasCounted = true;
        await supabase.rpc("increment_play_count", { song_url: currentSong });
      }
    });

    audio.addEventListener("ended", () => {
      hasCounted = false;
      userSeeked = false;
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      coverImage.classList.remove("rotate");
    });

    visibilityBtn.addEventListener("click", () => {
      visible = !visible;
      visibilityBtn.classList.toggle("off", !visible);
      eyeIcon.classList.toggle("fa-eye", visible);
      eyeIcon.classList.toggle("fa-eye-slash", !visible);
    });

    function addSongToList(name, url) {
      const songItem = document.createElement("div");
      songItem.textContent = "🎵 " + name;
      songItem.addEventListener("click", () => playSong(name, url));
      playlist.appendChild(songItem);
    }

    async function playSong(name, url) {
      currentSong = url;
      hasCounted = false;
      userSeeked = false;
      const { data } = await supabase.from("stats").select("id").eq("url", url).single();
      currentSongId = data?.id;
      audio.src = url;
      songTitle.textContent = name.replace(".mp3", "");
      audio.play();
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      coverImage.classList.add("rotate");
    }
  }
);
