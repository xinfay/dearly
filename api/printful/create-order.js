function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) return res.status(500).json({ error: 'PRINTFUL_API_TOKEN not configured' });

  try {
    const payload = req.body;
    const resp = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await resp.json().catch(() => ({}));
    // Forward Printful status+body so you see exact errors (e.g., bad variant_id)
    res.status(resp.status).json(json);
  } catch (err) {
    console.error('Printful proxy error:', err);
    res.status(500).json({ error: 'Printful proxy failed' });
  }
}
