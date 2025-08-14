import { put } from '@vercel/blob';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Internal-Secret');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Optional shared-secret guard
    const expected = process.env.INTERNAL_UPLOAD_SECRET;
    if (expected && req.headers['x-internal-secret'] !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { base64, ext } = req.body || {};
    if (!base64 || !ext) {
      return res.status(400).json({ error: 'Missing base64 or ext' });
    }

    // Accept "png", "jpg", "jpeg"
    const normExt = String(ext || '').toLowerCase().replace('.', '');
    const allowed = new Set(['png', 'jpg', 'jpeg']);
    if (!allowed.has(normExt)) {
      return res.status(400).json({ error: 'ext must be png|jpg|jpeg' });
    }

    const contentType = normExt === 'png' ? 'image/png' : 'image/jpeg';

    // Strip data URL prefix if present
    const clean = base64.includes('base64,') ? base64.split('base64,').pop() : base64;

    // Decode to Buffer
    const data = Buffer.from(clean, 'base64');
    if (!data.length) return res.status(400).json({ error: 'Invalid base64' });

    // UUID filename
    const filename = `generated/${crypto.randomUUID()}.${normExt}`;

    // Upload to Blob with public access
    const { url } = await put(filename, data, {
      access: 'public',
      contentType
    });

    // Vercel Blob returns a stable, unguessable URL
    return res.status(200).json({ url, key: filename });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
