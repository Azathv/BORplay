// ===== Supabase sozlamalari =====
const SUPABASE_URL = "https://jtalufnunoohbykpvyia.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YWx1Zm51bm9vaGJ5a3B2eWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDM4MzgsImV4cCI6MjA3ODE3OTgzOH0.ieZOFdTy9PHeAilxN2twVhMIILDzja_eiXEt5K-niMc"; // bu yerni o‘zingniki bilan almashtir
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== DOM elementlar =====
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const playerTitle = document.getElementById("playerTitle");
const audioPlayer = document.getElementById("audioPlayer");

// ===== Yuklangan fayllarni yuklash =====
async function loadSongs() {
  const { data, error } = await supabase.storage.from("songs").list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    console.error("Xatolik (list):", error.message);
    return;
  }

  songList.innerHTML = "";
  data.forEach((file) => {
    const songURL = `${SUPABASE_URL}/storage/v1/object/public/songs/${file.name}`;

    const li = document.createElement("li");
    li.className = "song-item";
    li.innerHTML = `
      🎵 <b>${file.name.replace(".mp3", "")}</b>
      <button class="play-btn" data-url="${songURL}">▶️ Tinglash</button>
    `;
    songList.appendChild(li);
  });

  // Har bir “Tinglash” tugmasiga bosilganda qo‘shiqni o‘ynatish
  document.querySelectorAll(".play-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.getAttribute("data-url");
      audioPlayer.src = url;
      audioPlayer.play();
      playerTitle.textContent = "Now playing: " + btn.parentNode.textContent.trim();
    });
  });
}

// ===== Fayl yuklash =====
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Iltimos, MP3 fayl tanlang!");
    return;
  }

  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from("songs").upload(fileName, file);

  if (error) {
    alert("Xatolik (upload): " + error.message);
    console.error(error);
  } else {
    alert("Qo‘shiq yuklandi ✅");
    loadSongs(); // yangi ro‘yxatni yangilash
  }
});

// Sahifa ochilganda qo‘shiqlarni yuklash
window.onload = loadSongs;
