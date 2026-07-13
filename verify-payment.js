function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(signatureBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }

  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return jsonResponse({ error: 'Razorpay secret is not configured on the server' }, 500);
  }

  const expectedSignature = await hmacSha256Hex(keySecret, razorpay_order_id + '|' + razorpay_payment_id);

  if (expectedSignature !== razorpay_signature) {
    return jsonResponse({ verified: false, error: 'Signature mismatch' }, 400);
  }

  return jsonResponse({ verified: true });
}
