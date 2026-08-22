# Netlify + Backend محلي — transport.ftstravels.com

## البنية عندك

```
transport.ftstravels.com  →  Netlify (الواجهة Next.js)
YOUR-BACKEND-URL          →  جهازك الحالي (NestJS :3001 + Postgres)
```

Netlify **لا تشغّل** الـ Backend. الواجهة على Netlify تتصل بالـ API عبر الإنترنت.

---

## 1) رفع الكود إلى GitHub

من مجلد المشروع:

```bat
cd c:\Users\Aloosh2020\Downloads\itourtt-main
push_to_transport_repo.bat
```

المستودع: https://github.com/Farouk-eladawy/transport.ftstravels.com.git

---

## 2) ربط Netlify

1. Netlify → **Add new site** → Import from GitHub → اختر `transport.ftstravels.com`
2. الإعدادات تُقرأ من `netlify.toml` تلقائياً (مجلد `frontend`)
3. **Environment variables** في Netlify:

| المتغير | القيمة |
|---|---|
| `NEXT_PUBLIC_API_URL` | عنوان الـ Backend **العام** (انظر §3) |
| `NEXT_PUBLIC_ENABLE_CAR_DISPATCH` | `true` (اختياري) |

4. Domain: `transport.ftstravels.com` → DNS كما في Netlify

---

## 3) Backend على جهازك — عنوان عام مطلوب

المتصفح على Netlify **لا يصل** إلى `localhost:3001`. تحتاج أحد:

| الحل | متى |
|---|---|
| **Cloudflare Tunnel** / ngrok | تجربة سريعة — Backend على جهازك |
| **VPS** لاحقاً | إنتاج مستقر |

مثال ngrok:

```bat
ngrok http 3001
```

ثم في Netlify:

```
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

وفي `.env` على جهازك (Backend):

```env
CORS_ORIGINS=https://transport.ftstravels.com,https://api.ftstravels.com
APP_HOST=transport.ftstravels.com
GEOCODING_PROVIDER=nominatim
```

---

## 4) تشغيل Backend محلياً

```bat
cd c:\Users\Aloosh2020\Downloads\itourtt-main
copy .env.ftstravels.example .env
REM عدّل JWT و POSTGRES و PARTNER_API_KEY

docker compose up -d
REM أو: cd backend && npm run start:dev
```

Postgres + Backend على `:3001`. الواجهة **لا** تعمل محلياً للإنتاج — Netlify تبنيها من GitHub.

---

## 5) خرائط مجانية (Leaflet + OSM)

**لا** تحتاج `GOOGLE_MAPS_KEY` على Netlify.

```env
GEOCODING_PROVIDER=nominatim
NOMINATIM_USER_AGENT=FTS-Transport/1.0 (transport.ftstravels.com)
```

---

## 6) بعد كل push

1. Netlify تعيد البناء تلقائياً من GitHub
2. تأكد أن Tunnel/VPS للـ Backend شغّال
3. افتح `https://transport.ftstravels.com/login`

---

## 7) CRM لاحقاً

في `ai_agent.py` / Railway:

```
TRANSPORT_API_URL=https://YOUR-BACKEND-PUBLIC-URL
TRANSPORT_PARTNER_KEY=<نفس PARTNER_API_KEY>
```

تبويب Transport في CRM يفتح `https://transport.ftstravels.com` أو iframe.
