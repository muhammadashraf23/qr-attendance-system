# 🚀 Deployment Guide — Attendzo SaaS Attendance System

This guide covers full production deployment:
**MongoDB Atlas (DB) → Render (API) → Vercel (Frontend)**

---

## 1. 🗄️ MongoDB Atlas (Database)

### Step 1 — Create a MongoDB Atlas Cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → **New Cluster** (Free M0 Sandbox)
2. Create database user and save username/password
3. Allow Network Access (0.0.0.0/0 for production hosting)

### Step 2 — Get Connection String
1. Click **Connect** → **Drivers** (Node.js)
2. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/qr_attendance?retryWrites=true&w=majority
   ```
3. Set as `MONGODB_URI` environment variable

### Step 3 — Seed Initial Data (Optional)
Run locally or from server:
```bash
npm run seed:demo
```

---

## 2. ⚙️ Deploy Backend on Vercel (100% Free, No Credit Card)

You can deploy the backend directly to Vercel as a Serverless Function!

### Step 1 — Import Repository to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Select your repository: `muhammadashraf23/qr-attendance-system`
3. Set **Project Name**: `qr-attendance-backend`
4. Set **Root Directory** to `backend`
5. Keep Framework Preset as **Other**

### Step 2 — Set Environment Variables on Vercel
Add the following in the **Environment Variables** section:
* `MONGODB_URI` = `mongodb+srv://<user>:<password>@cluster0.mongodb.net/qr_attendance?retryWrites=true&w=majority`
* `JWT_SECRET` = `<any-strong-secret-key>`
* `CORS_ORIGIN` = `*` (or your frontend Vercel URL once deployed)
* `NODE_ENV` = `production`

### Step 3 — Deploy
* Click **Deploy**
* Your backend API will be live at: `https://qr-attendance-backend.vercel.app`
* Test health endpoint: `https://qr-attendance-backend.vercel.app/health`

---

## 2B. ⚙️ (Alternative) Render (Backend Web Service)

### Step 1 — Push Backend to GitHub
```bash
cd manikstu-agro
git init
git add .
git commit -m "Initial Manikstu Agro deployment"
git remote add origin https://github.com/your-org/manikstu-agro.git
git push origin main
```

### Step 2 — Create Web Service on Render
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   | Field | Value |
   |---|---|
   | **Name** | `manikstu-agro-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | Free (or Starter for production) |

### Step 3 — Set Environment Variables on Render
Add these in **Environment** tab:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/qr_attendance?retryWrites=true&w=majority
JWT_SECRET=<generate with: openssl rand -hex 64>
JWT_EXPIRES_IN=7d
JWT_ADMIN_EXPIRES_IN=8h
NODE_ENV=production
CORS_ORIGIN=https://manikstu-agro.vercel.app
OFFICE_LATITUDE=22.5726
OFFICE_LONGITUDE=88.3639
OFFICE_RADIUS=100
FACE_CONFIDENCE_THRESHOLD=0.85
PORT=5000
```

> **Generate JWT_SECRET:**
> ```bash
> openssl rand -hex 64
> ```

### Step 4 — Deploy
- Click **Deploy** — Render will build and start your API
- Note your service URL: `https://manikstu-agro-api.onrender.com`

### Health check
```bash
curl https://manikstu-agro-api.onrender.com/health
# → {"status":"ok","service":"Manikstu Agro API"}
```

---

## 3. 🌐 Vercel (Frontend)

### Step 1 — Create Vercel Project
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import the same GitHub repository
3. Configure:
   | Field | Value |
   |---|---|
   | **Framework** | `Next.js` |
   | **Root Directory** | `frontend` |
   | **Node.js Version** | `18.x` |

### Step 2 — Set Environment Variables on Vercel
In **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://manikstu-agro-api.onrender.com/api
NEXT_PUBLIC_APP_NAME=Manikstu Agro
NEXT_PUBLIC_OFFICE_LAT=22.5726
NEXT_PUBLIC_OFFICE_LNG=88.3639
```

### Step 3 — Deploy
- Click **Deploy**
- Your app will be live at: `https://manikstu-agro.vercel.app`

### Step 4 — Update CORS on Render
Go back to Render and update:
```
CORS_ORIGIN=https://manikstu-agro.vercel.app
```
Redeploy the backend.

---

## 4. 🔁 Update the QR Code

After deployment, update the QR code URL in the database:

```sql
UPDATE system_settings
SET value = 'https://manikstu-agro.vercel.app/attend'
WHERE key = 'attend_page_url';
```

Then generate a new QR code pointing to `https://manikstu-agro.vercel.app/attend` using any QR generator (e.g. [qr-code-generator.com](https://www.qr-code-generator.com)) and print it for office display.

---

## 5. ✅ Post-Deployment Checklist

- [ ] Database schema deployed (all tables visible in Supabase)
- [ ] Backend health check returns OK
- [ ] Admin login works: `admin@manikstuagro.com` / `Admin@1234`
- [ ] Change default admin password immediately
- [ ] QR code URL updated in system_settings
- [ ] GPS office coordinates set correctly
- [ ] CORS_ORIGIN set to actual Vercel domain
- [ ] Test QR attendance flow end-to-end
- [ ] Test face registration and verification
- [ ] Test offline attendance capture + sync

---

## 6. 🔧 Update Office GPS Coordinates

To set your actual office location:

```sql
UPDATE system_settings SET value = 'YOUR_LATITUDE'  WHERE key = 'office_lat';
UPDATE system_settings SET value = 'YOUR_LONGITUDE' WHERE key = 'office_lng';
UPDATE system_settings SET value = '100'            WHERE key = 'gps_radius_meters';
```

Or update in `.env` (backend):
```
OFFICE_LATITUDE=22.5726
OFFICE_LONGITUDE=88.3639
OFFICE_RADIUS=100
```

---

## 7. 🆙 Updating the Deployment

### Backend update
```bash
git add . && git commit -m "Update" && git push
# Render auto-deploys on push
```

### Frontend update
```bash
git push
# Vercel auto-deploys on push
```

---

## 8. 🛟 Troubleshooting

| Issue | Fix |
|---|---|
| DB connection refused | Check `DATABASE_URL` and `DB_SSL=true` |
| CORS error in browser | Update `CORS_ORIGIN` on Render |
| Face models not loading | Check internet access to jsDelivr CDN |
| GPS always rejected | Update `OFFICE_LATITUDE/LONGITUDE` |
| Offline sync not working | Check Service Worker registration in browser DevTools |
| Render cold starts (free plan) | Upgrade to Starter, or use a keepalive ping service |
