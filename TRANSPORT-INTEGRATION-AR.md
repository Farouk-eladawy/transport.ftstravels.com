# FTS Transport — شرح مبسط (transport.ftstravels.com)

## 1) Local Driver / Local Car Type

في CRM الخارجي، **Local** تعني **تشغيل داخلي** (فريق FTS يدير الرحلة)، وليست «سائق محلي» أو «سائق من المنطقة».

| الحقل في Airtable | المعنى الصحيح |
|---|---|
| Driver Name & Phone | السائق المعيّن للعميل |
| Car Type | نوع المركبة (مثل HIS 3) |
| Local Driver | **تشغيل داخلي** — الفريق الداخلي يتابع |
| Local Car Type | نوع مركبة **التشغيل الداخلي** |

**قاعدة النقل:** وجود `pickup time` على حجز خارجي = يحتاج جوب نقل. طريقة التوفير (أسطول / باص / تشغيل داخلي / مورد) تُحدَّد لاحقاً في الديسپاتش.

---

## 2) هل له دومين خاص أم يُدمج داخل CRM؟

**الاثنان معاً — وليس أحدهما فقط.**

```
┌──────────────────────────────────────────────┐
│  CRM Dashboard (api.ftstravels.com)          │
│  Inbox | Customers | FTS AI Operation        │
│  ┌────────────────────────────────────────┐  │
│  │  تبويب Transport (iframe أو رابط)      │──┼──► transport.ftstravels.com
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
                    │
                    │ API + PARTNER_API_KEY
                    ▼
┌──────────────────────────────────────────────┐
│  نظام النقل (مستقل)                          │
│  transport.ftstravels.com                    │
│  Postgres | Dispatch | Drivers | Finance     │
└──────────────────────────────────────────────┘
```

| السؤال | الجواب البسيط |
|---|---|
| هل له دومين خاص؟ | **نعم:** `https://transport.ftstravels.com` |
| هل يُدمج في CRM؟ | **نعم في الواجهة فقط:** تبويب جديد يفتح النظام |
| هل يُنسخ الكود داخل ai_agent.py؟ | **لا** — NestJS + Postgres يبقيان منفصلين |
| من أين تأتي الحجوزات؟ | **Airtable (القسم الخارجي)** عبر جسر API |

**تشبيه:** CRM = مكتب الحجوزات والمحادثات. Transport = غرفة التشغيل والسائقين. نفس الشركة، غرفتان، باب واحد من الداشبورد.

---

## 3) متغيرات البيئة

انسخ `.env.ftstravels.example` إلى `.env` على السيرفر.

### إلزامية

| المتغير | مثال | لماذا |
|---|---|---|
| `DOMAIN` | `transport.ftstravels.com` | SSL وروابط النظام |
| `APP_HOST` | `transport.ftstravels.com` | ترخيص + روابط داخلية |
| `JWT_SECRET` | `openssl rand -base64 64` | تسجيل الدخول |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 64` | تجديد الجلسة |
| `POSTGRES_USER` | `fts_transport` | مستخدم قاعدة البيانات |
| `POSTGRES_PASSWORD` | كلمة قوية | كلمة مرور Postgres |
| `POSTGRES_DB` | `fts_transport` | اسم قاعدة البيانات |
| `CORS_ORIGINS` | انظر الملف | يسمح لـ CRM باستدعاء API |
| `PARTNER_API_KEY` | مفتاح عشوائي طويل | جسر CRM ↔ Transport |
| `LICENSE_PUBLIC_KEY` | من ilicense.tech | مطلوب في الإنتاج |

### مهمة للتشغيل

| المتغير | القيمة الموصى بها |
|---|---|
| `NEXT_PUBLIC_API_URL` | **فارغ** إذا `/api` على نفس الدومين |
| `INTERNAL_API_URL` | `http://backend:3001` داخل Docker |
| `PUBLIC_BACKEND_URL` | `https://transport.ftstravels.com` |
| `NODE_ENV` | `production` |
| `TZ` | `Africa/Cairo` |

### اختيارية

| المتغير | متى تحتاجها |
|---|---|
| `GEOCODING_PROVIDER` | `nominatim` (افتراضي — مجاني) |
| `NOMINATIM_USER_AGENT` | اسم التطبيق لسياسة OSM |
| `GEMINI_API_KEY` | استيراد جوبات بالذكاء الاصطناعي |
| `SMTP_*` | إعادة تعيين كلمة المرور والإيميل |
| `GETPAYIN_*` / `STRIPE_*` | فقط إذا فعلت حجز B2C لاحقاً |

### في CRM (لاحقاً — ليس في repo النقل)

```
TRANSPORT_API_URL=https://transport.ftstravels.com
TRANSPORT_PARTNER_KEY=<نفس PARTNER_API_KEY>
```

---

## 4) رفع الكود إلى GitHub

من مجلد المشروع:

```bat
push_to_transport_repo.bat
```

المستودع: https://github.com/Farouk-eladawy/transport.ftstravels.com.git

---

## 5) خطوات التشغيل على السيرفر

1. DNS: `transport.ftstravels.com` → IP السيرفر
2. `copy .env.ftstravels.example .env` ثم عدّل الأسرار
3. `docker compose up -d --build`
4. افتح `https://transport.ftstravels.com` وسجّل دخول Admin
5. من Company Settings → اسم **FTS Transport** + شعار FTS
6. في CRM: أضف تبويب Transport يفتح نفس الرابط

---

## 6) الربط مع الحجوزات (المرحلة التالية)

1. CRM يرسل حجوزات فيها `pickup time` إلى `POST /api/partner/jobs`
2. مفتاح منع التكرار: `airtable_record_id` = `customer_job_id`
3. بعد تعيين السائق في النقل → يُكتب في Airtable: `Driver Name & Phone` و `Car Type`
