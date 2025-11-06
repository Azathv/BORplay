export default async function handler(req, res) {
  // 1️⃣ Telegram yuborayotganini tekshirish (maxfiy token orqali)
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== process.env.TELEGRAM_BOT_SECRET) {
    return res.status(401).end('unauthorized');
  }

  // 2️⃣ Telegramdan kelgan ma’lumot
  const update = req.body || {};
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // 3️⃣ Agar foydalanuvchi MP3 yuborsa
  const msg = update.message;
  if (msg && (msg.audio || (msg.document && msg.document.mime_type === 'audio/mpeg'))) {
    const file = msg.audio || msg.document;
    const fileName = file.file_name || 'track.mp3';

    // 🎵 Foydalanuvchiga so‘rov yuborish
    await sendMessage(token, msg.chat.id,
      `🎵 <b>${fileName}</b>\nUshbu qo‘shiqni BorPlay'ga yuklashni xohlaysizmi?`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Ha', callback_data: JSON.stringify({ a:'upload', fid:file.file_id, name:fileName }) },
            { text: '❌ Yo‘q', callback_data: JSON.stringify({ a:'cancel' }) }
          ]]
        }
      }
    );

    return res.json({ ok: true });
  }

  // 4️⃣ Tugmalar bosilganda (callback_query)
  const cq = update.callback_query;
  if (cq) {
    let data = {};
    try { data = JSON.parse(cq.data); } catch {}
    if (data.a === 'upload') {
      await editMessage(token, cq.message.chat.id, cq.message.message_id, `✅ Qabul qilindi! Yuklanmoqda... 🎶`);
    } else {
      await editMessage(token, cq.message.chat.id, cq.message.message_id, `❌ Bekor qilindi.`);
    }
    return res.json({ ok: true });
  }

  // 5️⃣ Boshqa holatlarda jim qaytadi
  return res.json({ ok: true });
}

// --- yordamchi funksiyalar ---
async function sendMessage(token, chat_id, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:'POST',
    headers:{ 'content-type':'application/json' },
    body: JSON.stringify({ chat_id, text, ...extra })
  });
}

async function editMessage(token, chat_id, message_id, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method:'POST',
    headers:{ 'content-type':'application/json' },
    body: JSON.stringify({ chat_id, message_id, text, ...extra })
  });
}
