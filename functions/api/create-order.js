function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const amount = body.amount; // amount in paise
  const currency = body.currency || 'INR';
  const receipt = body.receipt || ('slot_' + Date.now());

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return jsonResponse({ error: 'Amount must be a number of at least 100 paise (₹1)' }, 400);
  }

  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return jsonResponse({ error: 'Razorpay keys are not configured on the server' }, 500);
  }

  const auth = btoa(keyId + ':' + keySecret);

  try {
    const rpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency, receipt })
    });

    const data = await rpRes.json();

    if (!rpRes.ok) {
      const isAuthError = rpRes.status === 401;
      return jsonResponse({
        error: 'Razorpay order creation failed',
        details: (data.error && data.error.description) || 'Unknown error'
      }, isAuthError ? 401 : 500);
    }

    return jsonResponse({ order_id: data.id, amount: data.amount, currency: data.currency });
  } catch (err) {
    return jsonResponse({ error: 'Razorpay order creation failed', details: err.message || 'Unknown error' }, 500);
  }
}
