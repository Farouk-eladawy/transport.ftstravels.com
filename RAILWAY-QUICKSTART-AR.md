# FTS Transport — Railway (5 دقائق)

Backend: **https://transport-ftstravels.up.railway.app**  
Frontend: **https://transport.ftstravels.com** (Netlify)  
Railway Project: [1608ce57-3bfd-49f0-9bb1-b252439992ec](https://railway.com/project/1608ce57-3bfd-49f0-9bb1-b252439992ec?environmentId=d4c50fbd-fac3-4316-a89c-870f0615ed88)

---

## 1) Railway — Backend Service

1. **New Service** → Deploy from GitHub → `Farouk-eladawy/transport.ftstravels.com`
2. **Settings → Root Directory** = `backend` (مهم جداً)
3. أضف **PostgreSQL** plugin في نفس المشروع
3. في خدمة الـ Backend → **Variables** — انسخ من `railway_vars.example.json`:

| Variable | القيمة |
|----------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Reference من Postgres) |
| `JWT_SECRET` | `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 64` |
| `PARTNER_API_KEY` | مفتاح عشوائي طويل (نفسه في CRM) |
| `LICENSE_PUBLIC_KEY` | من لوحة ilicense.tech |
| `CORS_ORIGINS` | `https://transport.ftstravels.com,https://api.ftstravels.com` |
| `PUBLIC_BACKEND_URL` | `https://transport-ftstravels.up.railway.app` |
| `APP_HOST` | `transport.ftstravels.com` |
| `GEOCODING_PROVIDER` | `nominatim` |
| `NOMINATIM_USER_AGENT` | `FTS-Transport/1.0 (transport.ftstravels.com)` |
| `RUN_DB_SEED` | `true` **مرة واحدة فقط** (ثم احذفها أو `false`) |

4. **Deploy** — انتظر healthcheck: `GET /api/health`

### تسجيل الدخول الافتراضي (بعد seed)
- Email: `admin@itour.local`
- Password: `Admin@123`

---

## 2) Netlify — Frontend

Site → **Environment variables**:

```
NEXT_PUBLIC_API_URL=https://transport-ftstravels.up.railway.app
NEXT_PUBLIC_ENABLE_CAR_DISPATCH=true
```

**مهم:** بدون `/api` في النهاية.

---

## 3) CRM (api.ftstravels.com)

في `.env` أو متغيرات تشغيل `ai_agent.py`:

```
TRANSPORT_API_URL=https://transport-ftstravels.up.railway.app
TRANSPORT_PARTNER_KEY=<نفس PARTNER_API_KEY>
TRANSPORT_FRONTEND_URL=https://transport.ftstravels.com
```

تبويب **Transport** في الدashboard يفتح `transport.ftstravels.com`.

---

## 4) التحقق

```bash
curl https://transport-ftstravels.up.railway.app/api/health
curl -H "X-Partner-Key: YOUR_KEY" https://transport-ftstravels.up.railway.app/api/partner/reference
```

---

## 5) CLI (اختياري)

```bat
cd c:\Users\Aloosh2020\Downloads\itourtt-main
railway login
railway link -p 1608ce57-3bfd-49f0-9bb1-b252439992ec
railway up --path-as-root backend --detach
```

أو شغّل `deploy_transport_railway.bat`
