/* POST /api/contact: validates the contact form, checks Turnstile, and emails it via Resend.
   Env vars (Pages project settings): RESEND_API_KEY and TURNSTILE_SECRET_KEY (secrets),
   optional CONTACT_TO and CONTACT_FROM (default kris@kristoferpelchat.com). */

const DEFAULT_ADDRESS = 'kris@kristoferpelchat.com';
const TOPICS = {
  'VP / leadership role': 'a VP or engineering leadership role',
  'Contract: mobile app': 'contract work on a mobile app',
  'Contract: agentic AI': 'contract work on agentic AI',
  'Speaking or advising': 'a speaking or advising opportunity',
  'Something else': 'something else',
};
const LIMITS = { name: 100, email: 254, company: 100, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

/* single line, no control characters: keeps user input out of email headers */
function clean(value, max) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}

async function verifyTurnstile(token, secret, ip) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = await res.json();
  return data.success === true;
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'The contact form is not configured yet.' }, 503);
  }

  let form;
  try { form = await request.formData(); } catch { return json({ error: 'Invalid form submission.' }, 400); }

  // honeypot: real visitors never see or fill this field
  if (form.get('website')) return json({ ok: true });

  const name = clean(form.get('name'), LIMITS.name);
  const email = clean(form.get('email'), LIMITS.email);
  const company = clean(form.get('company'), LIMITS.company);
  const type = clean(form.get('type'), 50);
  const message = String(form.get('message') || '').trim().slice(0, LIMITS.message);
  const topic = TOPICS[type];

  if (!name) return json({ error: 'Add your name so I know who is writing.', field: 'name' }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: 'Add an email address I can reply to.', field: 'email' }, 400);
  if (!topic) return json({ error: 'Pick an inquiry type.', field: 'type' }, 400);
  if (!message) return json({ error: 'Add a short message.', field: 'message' }, 400);

  const token = form.get('cf-turnstile-response');
  const ip = request.headers.get('CF-Connecting-IP');
  if (!token || !(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip))) {
    return json({ error: 'The spam check failed. Please try again.' }, 403);
  }

  const text = [
    `${name}${company ? ` (${company})` : ''} wants to talk about ${topic}.`,
    '',
    message,
    '',
    '--',
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    `Inquiry: ${type}`,
    'Sent from the contact form on kristoferpelchat.com. Reply to this email to answer them directly.',
  ].filter((line) => line !== null).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `Website contact form <${env.CONTACT_FROM || DEFAULT_ADDRESS}>`,
      to: [env.CONTACT_TO || DEFAULT_ADDRESS],
      reply_to: email,
      subject: `${type} — ${name}${company ? `, ${company}` : ''}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ error: 'The message could not be sent.' }, 502);
  }
  return json({ ok: true });
}
