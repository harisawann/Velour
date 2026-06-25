# Velour Furniture — Full Stack Setup Guide

A professional e-commerce platform for UK furniture retail.
**Stack:** React + Vite · Node/Express · MongoDB Atlas · Cloudinary · Vercel

---

## Project Structure

```
velour/
├── frontend/          ← React app (deploy to Vercel)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── vercel.json
└── api/               ← Node/Express API (deploy to Railway)
    ├── lib/
    │   ├── models/
    │   ├── auth.js
    │   └── cloudinary.js
    └── server.js
```

---

## Step 1 — Set Up MongoDB Atlas (Free)

1. Go to **https://cloud.mongodb.com** and create a free account
2. Create a new project called `velour`
3. Build a free **M0 cluster** (choose any region near UK)
4. Under **Database Access** → Add a user (username + password — save these)
5. Under **Network Access** → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)
6. Click **Connect** → **Connect your application** → copy the connection string

Your connection string looks like:
```
mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/velour?retryWrites=true&w=majority
```

---

## Step 2 — Set Up Cloudinary (Free Image Hosting)

1. Go to **https://cloudinary.com** and create a free account
2. From the Dashboard, copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Step 3 — Deploy the Backend API (Railway — Free)

1. Go to **https://railway.app** and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository → set the **Root Directory** to `api`
4. Add these **Environment Variables** in Railway settings:

```
MONGODB_URI        = your MongoDB connection string
JWT_SECRET         = any_long_random_string_32+_chars
ADMIN_EMAIL        = admin@velour.co.uk
ADMIN_PASSWORD     = YourSecurePassword123!
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY    = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
FRONTEND_URL       = https://your-vercel-app.vercel.app
NODE_ENV           = production
PORT               = 5000
```

5. Railway will give you a URL like: `https://velour-api.railway.app`
6. Test it: visit `https://velour-api.railway.app/api/health` — you should see `{"ok":true}`

> **On first run**, the API automatically creates your admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

---

## Step 4 — Deploy the Frontend (Vercel — Free)

1. Go to **https://vercel.com** and sign up with GitHub
2. Click **Add New Project** → import your repository
3. Set **Root Directory** to `frontend`
4. Add this **Environment Variable**:

```
VITE_API_URL = https://velour-api.railway.app/api
```

5. Click **Deploy**
6. Vercel gives you a URL like: `https://velour.vercel.app`

---

## Step 5 — Update CORS on the Backend

Once you have your Vercel URL, go back to Railway and update:
```
FRONTEND_URL = https://velour.vercel.app
```

Redeploy the backend so the CORS setting takes effect.

---

## Step 6 — Log Into Admin Panel

1. Visit: `https://velour.vercel.app/admin/login`
2. Email: the `ADMIN_EMAIL` you set
3. Password: the `ADMIN_PASSWORD` you set
4. You're in!

---

## Running Locally (Development)

### Backend
```bash
cd api
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
# API runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# Vite automatically proxies /api → localhost:5000
npm run dev
# App runs on http://localhost:5173
```

---

## Admin Panel Guide

**URL:** `/admin/login`

| Section    | What you can do |
|------------|----------------|
| Dashboard  | View total orders, revenue, products, customers. See pending orders alert. |
| Orders     | View all customer orders. Update order status (Pending → Confirmed → Dispatched → Delivered). Filter by status. |
| Products   | Add, edit, delete products. Upload up to 6 images per product. Set sizes, colours, stock, price. |
| Customers  | View all customers derived from orders. See their order count and total spent. |

---

## Customer Experience

| Feature | Detail |
|---------|--------|
| Browse products | /sofas, /beds, /shop |
| Product detail | Images, sizes, colours, add to cart |
| Cart | Persistent across sessions (localStorage) |
| Checkout | Name, email, phone, UK address, postcode |
| Payment | Cash on Delivery — no advance payment |
| Confirmation | Order number shown, you call to confirm |
| WhatsApp | Direct link on every page |

---

## Custom Domain (Optional)

1. Buy a domain at **Namecheap** or **GoDaddy**
2. In Vercel → your project → Settings → Domains → add your domain
3. Follow Vercel's DNS instructions (add CNAME records)
4. Your site is live at `https://velour.co.uk` (or whatever domain)

---

## Pricing

| Service | Cost |
|---------|------|
| MongoDB Atlas M0 | Free (512MB storage) |
| Cloudinary Free | Free (25GB storage, 25GB bandwidth/month) |
| Railway Starter | Free ($5 credit/month, enough for low traffic) |
| Vercel | Free (hobby plan, unlimited deployments) |
| **Total** | **£0/month to start** |

Upgrade when traffic grows.

---

## Security Notes

- Change `ADMIN_PASSWORD` to something strong (12+ chars, mix of letters/numbers/symbols)
- Never commit your `.env` file to GitHub — it's in `.gitignore`
- JWT tokens expire after 7 days — you'll need to log in again
- Rate limiting is enabled (200 requests per 15 minutes per IP)
