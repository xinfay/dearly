// api/agent/image.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const base = process.env.AGENT_BASE_URL;
  if (!base) {
    res.status(500).send('AGENT_BASE_URL not configured');
    return;
  }

  try {
    // Forward query string (e.g., ts=...)
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const url = `${base.replace(/\/+$/, '')}/image${qs}`;

    const upstream = await fetch(url);
    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => '');
      res.status(upstream.status).send(txt || 'Upstream error');
      return;
    }

    // Pass through content-type & cache hints
    const ct = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'no-store'); // or short-lived cache if you prefer

    // Stream body
    const reader = upstream.body.getReader();
    const encoder = new TextEncoder();
    const write = async (chunk) =>
      new Promise((resolve, reject) => {
        res.write(chunk, (err) => (err ? reject(err) : resolve()));
      });

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      await write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    console.error('agent/image proxy failed:', err);
    res.status(500).send('Agent image proxy failed');
  }
}
