const crypto = require('crypto');

const PIXEL_ID = '1537113287765972';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, phone, fbp, fbc, event_source_url, event_id, test_event_code } = req.body || {};

  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const userData = {};
  const normEmail = normalizeEmail(email);
  const normPhone = normalizePhone(phone);
  if (normEmail) userData.em = [sha256(normEmail)];
  if (normPhone) userData.ph = [sha256(normPhone)];
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;

  const event = {
    event_name: 'CompleteRegistration',
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: event_source_url || '',
    action_source: 'website',
    user_data: userData,
  };
  if (event_id) event.event_id = event_id;

  const requestBody = { data: [event] };
  if (test_event_code) requestBody.test_event_code = test_event_code;

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${process.env.META_CAPI_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );
    const data = await metaRes.json();
    return res.status(metaRes.ok ? 200 : 502).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed', message: e.message });
  }
};
