module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    const slackRes = await fetch(process.env.slack_webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const slackBody = await slackRes.text();
    return res.status(200).json({ success: slackBody === 'ok', slackStatus: slackRes.status, slackResponse: slackBody });
  } catch (e) {
    return res.status(500).json({ error: 'Failed', message: e.message });
  }
};
