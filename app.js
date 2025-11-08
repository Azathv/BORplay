const SUPABASE_URL = "https://jtalufnunoohbykpvyia.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YWx1Zm51bm9vaGJ5a3B2eWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDM4MzgsImV4cCI6MjA3ODE3OTgzOH0.ieZOFdTy9PHeAilxN2twVhMIILDzja_eiXEt5K-niMc";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const songTitle = document.getElementById("songTitle");
const progressBar = document.getElementById("progressBar");
const coverImage = document.getElementById("coverImage");
const visibilityBtn = document.getElementById("visibilityBtn");
const eyeIcon = document.getElementById("eyeIcon");
const favBtn = document.getElementById("favBtn");
const favIcon = document.getElementById("favIcon");
const statsLine = document.getElementById("statsLine");
const playlistEl = document.getElementById("playlist");
const audio = document.getElementById("audio");

let visible = true;
let hasCounted = false;
let userSeeked = false;
let currentIndex = -1;
let tracks = [];

const sanitize = (name) => name.replace(/[^a-zA-Z0-9_\-.]/g, "_");
const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(n);

function renderPlaylist() {
  playlistEl.innerHTML = "";
  tracks.forEach((s, i) => {
    const d = document.createElement("div");
    d.className = "track";
    d.innerHTML = `<div class="t">
      <span>🎵 ${s.name}</span>
      <span class="muted small">▶️ ${fmt(s.play_count)} • ❤️ ${fmt(s.favorite_count)}</span>
    </div>`;
    d.addEventListener("click", () => playAt(i));
    playlistEl.appendChild(d);
  });
}

async function playAt(i) {
  if (i < 0 || i >= tracks.length) return;
  currentIndex = i;
  const s = tracks[i];
  audio.src = s.url;
  songTitle.textContent = s.name.replace(/\.mp3$/i, "");
  statsLine.textContent = `Tinglangan: ${fmt(s.play_count)} • ❤️: ${fmt(s.favorite_count)}`;
  coverImage.classList.add("spin");
  hasCounted = false;
  userSeeked = false;
  await audio.play();
  playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

playBtn.addEventListener("click", () => {
  if (!audio.src) return;
  if (audio.paused) { audio.play(); playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
  else { audio.pause(); playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; }
});
prevBtn.addEventListener("click", () => playAt((currentIndex - 1 + tracks.length) % tracks.length));
nextBtn.addEventListener("click", () => playAt((currentIndex + 1) % tracks.length));

visibilityBtn.addEventListener("click", () => {
  visible = !visible;
  visibilityBtn.classList.toggle("danger", !visible);
  eyeIcon.classList.toggle("fa-eye", visible);
  eyeIcon.classList.toggle("fa-eye-slash", !visible);
});

favBtn.addEventListener("click", async () => {
  if (currentIndex < 0) return;
  const s = tracks[currentIndex];
  const delta = favIcon.classList.contains("fa-regular") ? 1 : -1;
  if (delta === 1) favIcon.classList.replace("fa-regular", "fa-solid");
  else favIcon.classList.replace("fa-solid", "fa-regular");
  try {
    const { error } = await supabase.rpc("adjust_favorite_count", { song_url: s.url, delta });
    if (error) throw error;
    s.favorite_count += delta;
    statsLine.textContent = `Tinglangan: ${fmt(s.play_count)} • ❤️: ${fmt(s.favorite_count)}`;
    renderPlaylist();
  } catch (e) { alert("Xatolik (favorite): " + e.message); }
});

audio.addEventListener("seeking", () => { userSeeked = true; });
audio.addEventListener("timeupdate", async () => {
  const pct = (audio.currentTime / (audio.duration || 1)) * 100;
  progressBar.style.width = pct + "%";
  if (pct > 50 && !hasCounted && !userSeeked && currentIndex >= 0) {
    hasCounted = true;
    const s = tracks[currentIndex];
    try {
      const { error } = await supabase.rpc("increment_play_count", { song_url: s.url });
      if (error) throw error;
      s.play_count += 1;
      statsLine.textContent = `Tinglangan: ${fmt(s.play_count)} • ❤️: ${fmt(s.favorite_count)}`;
      renderPlaylist();
    } catch (e) { console.error(e); }
  }
});
audio.addEventListener("ended", () => {
  playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  coverImage.classList.remove("spin");
  hasCounted = false;
  userSeeked = false;
});

uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file || !/^audio\//.test(file.type)) { alert("❗ Faqat audio fayl yuklang (MP3)."); return; }
  const safe = sanitize(file.name);
  const fileName = `${Date.now()}_${safe}`;
  try {
    const { error } = await supabase.storage.from("songs").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/songs/${fileName}`;
    await supabase.from("stats").upsert({ song_name: file.name, url: publicUrl }, { onConflict: "url" });
    await fetchTracks();
    const idx = tracks.findIndex(t => t.url === publicUrl);
    if (idx >= 0) playAt(idx);
  } catch (er) { alert("Xatolik (upload): " + er.message); }
  finally { e.target.value = ""; }
});

async function fetchTracks() {
  const { data, error } = await supabase.from("stats").select("id,song_name,url,play_count,favorite_count").order("id", { ascending: false });
  if (error) { alert("Xatolik (playlist): " + error.message); return; }
  tracks = data.map(r => ({ name: r.song_name, url: r.url, play_count: r.play_count ?? 0, favorite_count: r.favorite_count ?? 0 }));
  renderPlaylist();
}
fetchTracks();
