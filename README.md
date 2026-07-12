# Digihub Marketing — Site + Razorpay Integration

## What changed
- Instamojo links removed, replaced with **Razorpay Standard Checkout**.
- Two secure serverless functions added (Netlify Functions):
  - `netlify/functions/create-order.js` — creates a Razorpay order server-side
  - `netlify/functions/verify-payment.js` — verifies the payment signature server-side (HMAC-SHA256)
- Frontend (`index.html`) calls `/api/create-order` and `/api/verify-payment` (routed to the functions via `netlify.toml`).
- The Razorpay **Key ID** (public, safe to expose) is in `index.html`. The **Key Secret** is NEVER in any file here — it must be set only in Netlify's dashboard.

## Important: this changes how you deploy
Your site was previously a single HTML file you dragged into Netlify. Serverless functions **cannot** be added that way — Netlify needs to build them, which only happens through a **Git-connected site** (or the Netlify CLI, which needs a terminal).

## One-time setup (no terminal needed)

### 1. Put this project on GitHub
1. Go to [github.com](https://github.com) → sign up/login → click **"New repository"**
2. Name it (e.g. `digihub-site`) → Create repository
3. On the new repo page, click **"uploading an existing file"**
4. Drag in every file/folder from this project (`index.html`, `netlify.toml`, `package.json`, `.gitignore`, `.env.example`, and the whole `netlify` folder with `functions` inside it)
5. Commit the files

### 2. Connect Netlify to that GitHub repo
1. Netlify dashboard → your site → **Site settings** (or "Import an existing project" if starting fresh)
2. Look for **"Link repository"** / **"Build & deploy" → "Link site to Git"**
3. Choose GitHub → authorize → select your new repo
4. Build settings: leave **Build command** empty, **Publish directory** = `.` (it's already set in `netlify.toml`)
5. Deploy

### 3. Add your real Razorpay keys in Netlify (secure — never in code)
1. Netlify dashboard → your site → **Site settings → Environment variables**
2. Add:
   - `RAZORPAY_KEY_ID` = `rzp_test_TCCqKHy28NuF2x`
   - `RAZORPAY_KEY_SECRET` = (your secret key)
3. Save → trigger a new deploy (Deploys tab → "Trigger deploy")

## How to test
1. Open your live site → click any "Book My Slot" → fill the form → click **"Pay ₹2,000 & Confirm Slot"**
2. Razorpay's checkout modal should open
3. Since this is a **test key** (`rzp_test_...`), use Razorpay's test card: `4111 1111 1111 1111`, any future expiry, any CVV, any OTP
4. On success you'll see "Payment verified! Your slot is confirmed."

## Going live for real payments later
Test keys (`rzp_test_...`) never charge real money. When your Razorpay account is fully KYC-approved for live mode, replace both the Key ID (in `index.html`) and Key Secret (in Netlify env vars) with your **live** keys (`rzp_live_...`).

## Notes
- `.env` / `.env.example` are for **local testing only** (`netlify dev`) — not required for the live site once env vars are set in Netlify's dashboard.
- Never commit a real `.env` file — `.gitignore` already excludes it.
<!-- redeploy trigger -->
