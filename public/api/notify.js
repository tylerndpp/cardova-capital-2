module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    await fetch('https://hooks.slack.com/services/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', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed' });
  }
};
