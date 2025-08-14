function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const base = process.env.AGENT_BASE_URL;
  const shared = process.env.AGENT_SHARED_SECRET;
  if (!base) return res.status(500).json({ error: 'AGENT_BASE_URL not configured' });

  try {
    const resp = await fetch(`${base.replace(/\/+$/, '')}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(shared ? { 'X-Agent-Secret': shared } : {})
      },
      body: JSON.stringify(req.body || {})
    });

    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    console.error('Agent proxy error:', err);
    res.status(500).json({ error: 'Agent proxy failed' });
  }
}
