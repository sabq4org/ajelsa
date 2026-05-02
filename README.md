<div align="center">

# 🍷 صحيفة عاجل — Ajel News Platform

**صحيفة إلكترونية سعودية ذكية متفوقة بالذكاء الاصطناعي**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?logo=cloudinary)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

</div>

---

## ✨ نظرة عامة

**عاجل** صحيفة إلكترونية كاملة الميزات مبنية بأحدث التقنيات في 2026. تجمع بين:
- 📰 نظام تحرير صحفي احترافي
- 🤖 ذكاء اصطناعي متعدد النماذج (GPT-4o, DALL-E 3, Imagen 4)
- ⚡ أداء فائق عبر ISR + Cloudinary CDN
- 🎨 هوية بصرية عنابية فخمة مستوحاة من الصحف الكلاسيكية

> 🌐 **رابط الإنتاج:** [ajelsa.vercel.app](https://ajelsa.vercel.app)

---

## 🚀 الميزات الرئيسية

### 📝 لوحة تحرير احترافية
- ✅ محرر TipTap متقدم مع شريط أدوات كامل
- ✅ **التحرير الذكي بالـ AI**: عناوين، ملخصات، كلمات مفتاحية، SEO
- ✅ **توليد صور بالـ AI**: واقعية (Imagen 4) أو رسومية (DALL-E 3)
- ✅ نظام نشر متدرج: مميز / عادي / مخفي من الرئيسية
- ✅ Version History — استعادة أي نسخة سابقة
- ✅ معاينة الخبر قبل النشر
- ✅ جدولة النشر بتقويم تفاعلي
- ✅ Workflow Kanban (مسودة → مراجعة → جاهز → منشور)
- ✅ Audit Log — تتبع من فعل ماذا ومتى

### 🎨 الواجهة العامة (تجربة قارئ متفوقة)
- ✅ هيدر فخم مع مؤشر تاسي + التاريخ الهجري
- ✅ **شريط نبض حي** يعرض إحصاءات حية متغيرة
- ✅ Hero Section بصور كبيرة 16:10 مع overlay عنابي
- ✅ **AI Daily Brief** — نشرة يومية يولّدها GPT-4o تربط أخبار اليوم
- ✅ قسم رياضة بخلفية ممتدة كامل العرض
- ✅ قسم فيديو بأسلوب YouTube
- ✅ آخر الأخبار مع toggle 3/4 أعمدة
- ✅ اختيارات المحرر بـ Badge مميز
- ✅ الأكثر قراءة بأرقام عربية أنيقة
- ✅ صفحة قسم ديناميكية `/category/[slug]`
- ✅ صفحة كلمات مفتاحية للبحث `/keyword/[keyword]`
- ✅ فوتر فخم مع اقتباس صحفي عشوائي

### 🤖 صفحة الخبر (Sidebar إبداعي)
- 🌟 **اسأل الخبر** — Chat AI يجيب من محتوى الخبر فقط (ميزة فريدة عربياً!)
- 📊 **النقاط الرئيسية** — استخراج تلقائي 3-5 نقاط بـ GPT-4o
- ⏱️ شريط تقدم القراءة (Reading Progress)
- 📈 إحصائيات الخبر (وقت قراءة + مشاهدات + تعليقات)
- 🔗 أزرار مشاركة لكل المنصات + نسخ الرابط
- ✨ كلمات مفتاحية قابلة للنقر
- 🏷️ ليبل "مولدة بالذكاء الاصطناعي" على الصور المولدة

---

## 🤖 خدمات الذكاء الاصطناعي

| الميزة | النموذج | API Endpoint |
|--------|---------|--------------|
| التحرير الذكي | GPT-4o | `/api/ai/smart-edit` |
| النقاط الرئيسية | GPT-4o-mini | `/api/ai/key-points` |
| اسأل الخبر (Chat) | GPT-4o-mini | `/api/ai/ask-article` |
| النشرة اليومية | GPT-4o-mini | `/api/ai/daily-brief` |
| توليد صورة رسومية | DALL-E 3 | `/api/ai/generate-image` |
| توليد صورة واقعية | Imagen 4 | `/api/ai/generate-image` |

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4
- **Editor:** TipTap (محرر الأخبار)
- **Icons:** Lucide React
- **Charts:** Recharts (للداشبورد)

### Backend
- **API:** Next.js API Routes
- **ORM:** Drizzle (مع SQL خام عند الحاجة)
- **Database:** Neon PostgreSQL (Serverless)
- **Auth:** JWT-based authentication
- **Cache:** Upstash Redis (اختياري)

### Storage & CDN
- **Images:** Cloudinary (الأساسي) + R2 (احتياطي)
- **CDN:** Vercel Edge + Cloudinary

### AI Services
- **OpenAI:** GPT-4o, GPT-4o-mini, DALL-E 3
- **Google:** Gemini, Imagen 4 (`imagen-4.0-generate-001`)

### DevOps
- **Hosting:** Vercel
- **Database:** Neon (eu-central-1)
- **Repository:** [github.com/sabq4org/ajelsa](https://github.com/sabq4org/ajelsa)

---

## ⚡ الأداء

- **ISR (Incremental Static Regeneration):** الصفحة الرئيسية كل 30s، الأقسام/المقالات كل 60s
- **Auto-revalidation:** عند نشر/تعديل/حذف خبر يتم تحديث الصفحات تلقائياً
- **Image Optimization:** Cloudinary auto-format (WebP/AVIF) + auto-quality
- **Edge Caching:** Vercel Edge Network عالمياً
- **Endpoint طوارئ:** `/api/revalidate?path=/` لتحديث يدوي عند الحاجة

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm / pnpm / yarn
- حساب Neon PostgreSQL
- مفاتيح OpenAI + Google Cloud + Cloudinary

### الإعداد

```bash
# استنساخ المشروع
git clone https://github.com/sabq4org/ajelsa.git
cd ajelsa

# تثبيت الحزم
npm install

# إعداد متغيرات البيئة
cp .env.example .env.local
# عدّل القيم في .env.local

# تطبيق Migrations
npm run db:push

# تشغيل خادم التطوير
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

### متغيرات البيئة المطلوبة

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=...

# OpenAI (للتحرير + توليد صور رسومية)
OPENAI_API_KEY=sk-...

# Google Gemini (للصور الواقعية)
GEMINI_API_KEY=AIza...

# Cloudinary (تخزين الصور)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# اختياري
REDIS_URL=redis://...
REVALIDATE_SECRET=...
```

---

## 📂 هيكل المشروع

```
ajelsa/
├── src/
│   ├── app/
│   │   ├── (public)/           # الواجهة العامة
│   │   │   ├── page.tsx        # الصفحة الرئيسية
│   │   │   ├── article/        # صفحة الخبر
│   │   │   ├── category/       # صفحات الأقسام
│   │   │   └── keyword/        # صفحات الكلمات المفتاحية
│   │   ├── admin/              # لوحة التحكم
│   │   │   ├── articles/       # إدارة الأخبار
│   │   │   ├── analytics/      # الإحصاءات
│   │   │   ├── workflow/       # سير العمل
│   │   │   └── settings/       # الإعدادات
│   │   └── api/
│   │       ├── ai/             # Endpoints الذكاء الاصطناعي
│   │       │   ├── smart-edit/
│   │       │   ├── ask-article/
│   │       │   ├── key-points/
│   │       │   ├── daily-brief/
│   │       │   └── generate-image/
│   │       └── articles/       # CRUD الأخبار
│   ├── components/
│   │   ├── public/             # مكونات الواجهة العامة
│   │   └── admin/              # مكونات لوحة التحكم
│   └── lib/
│       ├── db/                 # Drizzle schema + queries
│       ├── queries/            # دوال قاعدة البيانات
│       ├── cloudinary.ts       # Cloudinary uploader
│       └── utils.ts            # دوال مساعدة
├── public/                      # ملفات ثابتة
├── ROADMAP.md                   # خطة التطوير
├── CHANGELOG.md                 # سجل التغييرات
└── README.md                    # هذا الملف
```

---

## 🎨 لغة التصميم

- **اللون الأساسي:** عنابي (Burgundy `#8c1d2b`)
- **اللون الثانوي:** كريمي وردي (`#fbf7f4`)
- **الخط:** Tajawal (الأساسي) + Amiri (للشعار والاقتباسات)
- **الفلسفة:** بطاقات بيضاء على خلفية كريمية + ظلال خفيفة + حدود ناعمة

---

## 🏆 ما يميز عاجل عن غيرها

1. **اسأل الخبر** — ميزة AI Chat على كل خبر، **غير موجودة في أي صحيفة عربية**
2. **AI Daily Brief** — نشرة يومية تربط أخبار اليوم بأسلوب مذيع صحفي
3. **توليد صور بنموذجين متخصصين** — DALL-E للرسومات، Imagen للواقعية
4. **هوية بصرية متكاملة** — لون ولغة بصرية واحدة في كل صفحة
5. **أداء فائق** — ISR + Cloudinary + Edge CDN

---

## 📜 الترخيص

ملكية خاصة لصحيفة عاجل — جميع الحقوق محفوظة © 2026

---

<div align="center">

**صنع بكل ❤️ في الرياض**

</div>
