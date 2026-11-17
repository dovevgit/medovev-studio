// תיבת צור קשר באתר הסטודיו: שומר ליד במערכת ניהול העסק ושולח מייל.
//
// Carried over unchanged from the old site, so a lead reaches the same
// leads screen it always has. The Supabase key here is the publishable one
// and is meant to be in the source; the two Resend values are read from the
// environment, and without them the lead is still saved -- only the email
// notification is skipped.
const SB = 'https://sdkovfzqpzmgipnvadrx.supabase.co';
const KEY = 'sb_publishable_X5tBXfzaCF8Z0VLTBSln1w_YMDU2D6a';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true }); // שדה מלכודת לבוטים
  const name = String(b.name || '').trim().slice(0, 200);
  const phone = String(b.phone || '').trim().slice(0, 40);
  const email = String(b.email || '').trim().slice(0, 200);
  const message = String(b.message || '').trim().slice(0, 3000);
  try {
    const r = await fetch(`${SB}/rest/v1/rpc/site_create_lead`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_name: name, p_phone: phone, p_email: email, p_message: message }),
      signal: AbortSignal.timeout(10000),
    });
    const t = await r.text();
    if (!r.ok) {
      let m = ''; try { m = JSON.parse(t).message || ''; } catch { /* */ }
      return res.status(200).json({ ok: false, reason: m.startsWith('limit') ? 'limit' : m === 'invalid' ? 'invalid' : 'error' });
    }
  } catch {
    return res.status(200).json({ ok: false, reason: 'error' });
  }
  // מייל: רק אם הוגדרו המפתחות ב-Vercel. אם לא, הליד כבר נשמר.
  let sent = false;
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_TO_EMAIL;
  if (key && to) {
    try {
      const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:16px;line-height:1.7">
<h2 style="margin:0 0 8px">פנייה חדשה מאתר הסטודיו</h2>
<p>שם: <b>${esc(name)}</b><br>טלפון: <b dir="ltr">${esc(phone)}</b>${email ? `<br>מייל: <b dir="ltr">${esc(email)}</b>` : ''}</p>
${message ? `<p style="white-space:pre-wrap">${esc(message)}</p>` : ''}
<p style="color:#667">הפנייה נשמרה גם במסך הלידים במערכת ניהול העסק.</p></div>`;
      const m = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key, 'content-type': 'application/json' },
        body: JSON.stringify({ from: 'ניהול העסק <onboarding@resend.dev>', to: [to], subject: `פנייה חדשה מהאתר: ${name}`, html, ...(email ? { reply_to: email } : {}) }),
        signal: AbortSignal.timeout(15000),
      });
      sent = m.ok;
    } catch { /* הליד כבר נשמר */ }
  }
  return res.status(200).json({ ok: true, sent });
}
