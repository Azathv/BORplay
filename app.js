
// ✅ Supabase ma'lumotlarini yashirin o'zgaruvchilardan olamiz
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Supabase'ni ulaymiz
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// HTML elementlar
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");

// Xatolikni chiqazish uchun funksiya
function showError(message) {
  alert(`Xatolik: ${message}`);
}

// 🔼 Fayl yuklash
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    showError("Iltimos, fayl tanlang!");
    return;
  }

  try {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("songs").upload(fileName, file);

    if (error) throw error;

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/songs/${fileName}`;

    // Jadvalga yozuv qo‘shamiz (stats uchun)
    const { error: insertError } = await supabase
      .from("stats")
      .insert([{ song_name: file.name, url: publicUrl, play_count: 0, favorite_count: 0 }]);

    if (insertError) throw insertError;

    alert("🎵 Fayl muvaffaqiyatli yuklandi!");
    loadSongs();
  } catch (err) {
    showError(err.message || "Faylni yuklashda xatolik!");
  }
});

// 🔁 Qo‘shiqlarni ro‘yxatga yuklash
async function loadSongs() {
  const { data, error } = await supabase.from("stats").select("*");
  if (error) {
    showError("Qo‘shiqlarni yuklashda xatolik!");
    return;
  }

  songList.innerHTML = "";
  data.forEach((song) => {
    const li = document.createElement("li");
    li.textContent = `${song.song_name} 🎧 — Tinglangan: ${song.play_count} marta ❤️: ${song.favorite_count}`;
    songList.appendChild(li);
  });
}

// Boshlanishda yuklab olish
loadSongs();
