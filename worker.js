import { onRequestPost as createOrder } from './functions/api/create-order.js';
import { onRequestPost as verifyPayment } from './functions/api/verify-payment.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/create-order' && request.method === 'POST') {
      return createOrder({ request, env });
    }
    if (url.pathname === '/api/verify-payment' && request.method === 'POST') {
      return verifyPayment({ request, env });
    }

    // Everything else (index.html, assets) is served as a static file
    return env.ASSETS.fetch(request);
  }
};
