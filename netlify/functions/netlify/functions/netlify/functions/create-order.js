const Razorpay = require('razorpay');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const amount = body.amount; // amount in paise
  const currency = body.currency || 'INR';
  const receipt = body.receipt || ('slot_' + Date.now());

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Amount must be a number of at least 100 paise (₹1)' }) };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Razorpay keys are not configured on the server' }) };
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await razorpay.orders.create({ amount, currency, receipt });
    return {
      statusCode: 200,
      body: JSON.stringify({ order_id: order.id, amount: order.amount, currency: order.currency })
    };
  } catch (err) {
    const isAuthError = err && (err.statusCode === 401 || /key/i.test(err.message || ''));
    return {
      statusCode: isAuthError ? 401 : 500,
      body: JSON.stringify({ error: 'Razorpay order creation failed', details: err.message || 'Unknown error' })
    };
  }
};
