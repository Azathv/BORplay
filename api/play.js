export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Faqat POST so'rovi bo'lishi kerak" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { track_id } = body;

  console.log("O‘ynalgan qo‘shiq ID:", track_id);

  // hozircha faqat test javobi qaytaramiz
  res.status(200).json({ ok: true, message: "Play sanaldi", track_id });
}
