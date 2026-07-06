export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'Phone required' });

  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return res.status(400).json({ error: 'Invalid phone' });

  try {
    const resp = await fetch(
      'https://verify.twilio.com/v2/Services/VA2d6aed7ba565c0011578ba704cc15796/Verifications',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('AC5db7dab650bc03e945481a2f05046d8a:19331a8824c4ef0248ab2c2998ab27bf'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: '+1' + digits, Channel: 'sms' }),
      }
    );
    const data = await resp.json();
    if (data.status === 'pending') {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: data.message || 'Failed to send' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
