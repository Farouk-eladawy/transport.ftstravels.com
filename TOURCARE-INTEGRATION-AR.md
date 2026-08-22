# TourCare Transport — شرح مبسط

## 1) Local Driver / Local Car Type

في CRM الخارجي، **Local** تعني **تشغيل داخلي** (فريق FTS يدير الرحلة)، وليست «سائق محلي».

| الحقل | المعنى |
|---|---|
| Driver Name & Phone | السائق المعيّن للعميل |
| Car Type | نوع المركبة (مثل HIS 3) |
| Local Driver | تشغيل داخلي — الفريق الداخلي يتابع |
| Local Car Type | نوع مركبة التشغيل الداخلي |

نظام النقل يقرأ نفس الحجز من Airtable. وجود **pickup time** = يحتاج جوب نقل. طريقة التوفير (أسطول / باص / تشغيل داخلي / مورد) تُحدَّد لاحقاً في الديسپاتش.

---

## 2) هل له دومين خاص أم يُدمج داخل CRM؟

**الاثنان معاً — وليس أحدهما فقط.**

```
┌─────────────────────────────────────┐
│  CRM Dashboard (tourcare / FTS)     │
│  Inbox | Customers | AI Operation   │
│  ┌───────────────────────────────┐  │
│  │  تبويب Transport (نافذة/رابط) │──┼──► transport.tourcare.ai
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              │
              │ API + PARTNER_API_KEY
              ▼
┌─────────────────────────────────────┐
│  نظام النقل (مستقل)                 │
│  transport.tourcare.ai              │
│  Postgres | Dispatch | Drivers      │
└─────────────────────────────────────┘
```

| السؤال | الجواب البسيط |
|---|---|
| هل له دومين خاص؟ | **نعم:** `transport.tourcare.ai` |
| هل يُدمج في CRM؟ | **نعم في الواجهة فقط:** تبويب يفتح النظام |
| هل يُنسخ الكود داخل ai_agent.py؟ | **لا** — يبقى NestJS + Postgres منفصلين |
| من أين تأتي الحجوزات؟ | **Airtable (القسم الخارجي)** عبر جسر API |

**تشبيه:** CRM = مكتب الحجوزات والمحادثات. Transport = غرفة التشغيل والسائقين. نفس الشركة، غرفتان، باب واحد من الداشبورد.

---

## 3) متغيرات البيئة

راجع `.env.tourcare.example` — أهمها:

| المتغير | لماذا |
|---|---|
| `DOMAIN` / `APP_HOST` | `transport.tourcare.ai` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | تسجيل الدخول |
| `POSTGRES_*` | قاعدة بيانات النقل |
| `CORS_ORIGINS` | يسمح لـ CRM باستدعاء API |
| `PARTNER_API_KEY` | مفتاح CRM ↔ Transport |
| `NEXT_PUBLIC_API_URL` | فارغ إذا `/api` على نفس الدومين |
| `LICENSE_*` | ترخيص الإنتاج |

في CRM لاحقاً:

```
TRANSPORT_API_URL=https://transport.tourcare.ai
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

1. DNS: `transport.tourcare.ai` → IP السيرفر
2. `cp .env.tourcare.example .env` ثم عدّل الأسرار
3. `docker compose up -d --build`
4. من لوحة النقل: Company Settings → اسم **TourCare Transport**
5. في CRM: تبويب Transport يفتح `https://transport.tourcare.ai`

---

## 6) الربط مع الحجوزات (المرحلة التالية)

1. CRM يرسل حجوزات فيها `pickup time` إلى `/api/partner/jobs`
2. مفتاح الربط: `airtable_record_id` = `customer_job_id`
3. بعد تعيين السائق في النقل → يُكتب في Airtable: `Driver Name & Phone` و `Car Type`
