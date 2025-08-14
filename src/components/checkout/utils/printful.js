export function buildPrintfulPayload(shippingInfo, itemId, quantity) {
  return {
    name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
    address: shippingInfo.address,
    quantity: quantity,
    variantId: parseInt(shippingInfo.variantId),
    city: shippingInfo.city,
    statecode: shippingInfo.state,
    countrycode: shippingInfo.country,
    zip: shippingInfo.zipCode,
    url: shippingInfo.url,
    productId: itemId,
  };
}


// Small client helpers to talk to our Vercel APIs
export async function uploadGeneratedImage({ base64, ext, internalSecret }) {
  const res = await fetch('/api/images/upload-generated', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(internalSecret ? { 'X-Internal-Secret': internalSecret } : {})
    },
    body: JSON.stringify({ base64, ext })
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Upload failed');
    throw new Error(msg);
  }
  return res.json(); // { url, key }
}

export async function createPrintfulOrder(payload) {
  const res = await fetch('/api/printful/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Printful's error shape often includes { code, result, error }
    const reason = data?.error?.reason || data?.error || JSON.stringify(data);
    throw new Error(`Printful error: ${reason}`);
  }
  return data;
}

// Helper: File/Blob -> base64 string (no data: prefix)
export function blobToBase64(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      const dataUrl = reader.result || '';
      const base64 = String(dataUrl).split('base64,').pop();
      resolve(base64);
    };
    reader.readAsDataURL(fileOrBlob);
  });
}
