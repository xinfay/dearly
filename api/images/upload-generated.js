import { put } from '@vercel/blob';
import crypto from 'node:crypto';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Internal-Secret');
}

export default async function handler(req, res) {
  setCors(res);
  const requestId = crypto.randomUUID();
  const log = (level, obj) => {
    console[level]({
      requestId,
      ts: new Date().toISOString(),
      ...obj
    });
  };

  if (req.method === 'OPTIONS') {
    log('info', { stage: 'preflight', method: req.method, path: req.url });
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    log('warn', { stage: 'method_guard', method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    // Optional shared-secret guard
    const expected = process.env.INTERNAL_UPLOAD_SECRET;
    if (expected && req.headers['x-internal-secret'] !== expected) {
      log('warn', { stage: 'auth_fail' });
      return res.status(401).json({ error: 'Unauthorized', requestId });
    }

    const { base64, ext } = req.body || {};
    if (!base64 || !ext) {
      log('warn', { stage: 'body_validation_fail', hasBase64: Boolean(base64), ext });
      return res.status(400).json({ error: 'Missing base64 or ext', requestId });
    }

    // Accept "png", "jpg", "jpeg"
    const normExt = String(ext || '').toLowerCase().replace('.', '');
    const allowed = new Set(['png', 'jpg', 'jpeg']);
    if (!allowed.has(normExt)) {
      log('warn', { stage: 'ext_validation_fail', normExt });
      return res.status(400).json({ error: 'ext must be png|jpg|jpeg', requestId });
    }

    const contentType = normExt === 'png' ? 'image/png' : 'image/jpeg';

    // Strip data URL prefix if present
    const clean = base64.includes('base64,') ? base64.split('base64,').pop() : base64;

    // Decode to Buffer
    const data = Buffer.from(clean, 'base64');
    if (!data.length) {
      log('warn', { stage: 'decode_fail' });
      return res.status(400).json({ error: 'Invalid base64', requestId });
    }
    log('info', { stage: 'decoded', bytes: data.length });

    // UUID filename
    const filename = `generated/${crypto.randomUUID()}.${normExt}`;
    log('info', { stage: 'upload_start', key: filename, contentType });

    // Upload to Blob with public access
    const { url } = await put(filename, data, {
      access: 'public',
      contentType
    });

    log('info', { stage: 'upload_success', key: filename, url });

    // Vercel Blob returns a stable, unguessable URL
    return res.status(200).json({ url, key: filename, requestId });
  } catch (err) {
    log('error', { stage: 'exception', message: err?.message, stack: err?.stack });
    return res.status(500).json({ error: 'Upload failed', requestId });
  }
}
