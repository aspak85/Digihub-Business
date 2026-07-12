# Digihub Marketing — Cloudflare Pages version

## Why Cloudflare Pages instead of Netlify
- Free tier allows **commercial use** (Netlify/Vercel free tiers restrict or meter this differently)
- **Unlimited bandwidth and deploys** on the free plan — no "credits" system to run out of
- Functions (serverless, for Razorpay) are free up to 100,000 requests/day — more than enough for a small business site

No other functionality changed — same site, same look, same booking flow.

## What's different technically (you don't need to do anything about this — just for reference)
- The Razorpay backend functions were rewritten for Cloudflare's runtime (`functions/api/create-order.js`, `functions/api/verify-payment.js`) using standard Web APIs instead of Node-specific libraries. They do exactly the same job as before: create an order, and verify the payment signature server-side.
- No `netlify.toml` or `package.json` needed this time — Cloudflare Pages auto-detects the `/functions` folder and routes `/api/*` to it automatically.

## One-time setup (no terminal needed)

### 1. Put this project on GitHub
Same as before — either:
- Update your existing `Digihub-Business` GitHub repo: delete the `netlify` folder and `netlify.toml`/`package.json` (no longer needed), then upload this `functions` folder and `index.html` instead
- Or create a fresh repo and upload everything in this folder

### 2. Create the Cloudflare Pages project
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → sign up/login (free)
2. Left sidebar → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
3. Authorize GitHub → select your repo
4. Build settings: **Framework preset** = None, **Build command** = (leave empty), **Build output directory** = `/`
5. Click **Save and Deploy**

### 3. Add your Razorpay keys (secure — never in code)
1. In your new Pages project → **Settings** → **Environment variables**
2. Add:
   - `RAZORPAY_KEY_ID` = `rzp_test_TCCqKHy28NuF2x`
   - `RAZORPAY_KEY_SECRET` = (your secret key)
3. Save → go to **Deployments** tab → **Retry deployment** (so the new variables apply)

### 4. Connect your domain
1. Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `digihub.business`
3. Since your domain's nameservers already point to Netlify DNS, you'll need to either:
   - Move DNS to Cloudflare (Cloudflare will give you nameservers, same process as you did for Netlify), or
   - Just add a CNAME record pointing to the `*.pages.dev` address, if your current DNS provider allows editing records directly

## Testing
Same as before — test card `4111 1111 1111 1111`, any future expiry, any CVV/OTP, since the Razorpay key is still in test mode.
