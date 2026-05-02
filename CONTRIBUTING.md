# 🤝 دليل المساهمة

شكراً لاهتمامك بالمساهمة في مشروع **عاجل**! هذا الدليل سيساعدك على البدء بسرعة.

---

## 📋 قبل البدء

### المتطلبات
- Node.js 18+
- npm / pnpm
- Git
- محرر مع دعم TypeScript (VS Code مفضل)

### الإعداد

```bash
git clone https://github.com/sabq4org/ajelsa.git
cd ajelsa
npm install
cp .env.example .env.local
# عبئ القيم في .env.local
npm run dev
```

---

## 🌳 سير العمل

### الـ Branches
- `main` — كود الإنتاج (محمي)
- `feature/*` — ميزات جديدة
- `fix/*` — إصلاحات
- `refactor/*` — إعادة هيكلة

### رسائل الـ Commits

نستخدم نمط [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: إضافة ميزة جديدة
fix: إصلاح خلل
refactor: إعادة هيكلة بدون تغيير وظيفي
style: تنسيق فقط
docs: تحديث توثيق
perf: تحسين أداء
chore: مهام عامة (تبعيات، إعدادات...)
```

**أمثلة:**
```
feat: add AI key points to article sidebar
fix: prevent oversized base64 images in homepage
refactor: simplify getCategoryArticles query
perf: switch to ISR for faster page loads
```

---

## 🎨 معايير الكود

### TypeScript
- استخدم `strict: true`
- تجنب `any` قدر الإمكان
- استخدم interfaces للـ props
- علّق الكود المعقد

### React/Next.js
- Server Components افتراضياً، Client فقط عند الحاجة
- استخدم `"use client"` صراحة
- `async/await` بدل `.then()`
- props types محددة

### Tailwind CSS
- استخدم متغيرات الهوية: `burgundy`, `rose-cream`, `ink`, `paper`
- تجنب الألوان الفاقعة الافتراضية
- اتبع لغة التصميم (موجودة في `~/.openclaw/workspace/memory/design-language.md`)

### قاعدة البيانات
- Drizzle ORM للاستعلامات البسيطة
- SQL خام لـ enums و queries معقدة (Drizzle لديه bug في Vercel)
- استخدم `revalidatePath()` بعد أي mutation

---

## 🤖 الذكاء الاصطناعي — قواعد ذهبية

### عند إضافة AI endpoint جديد:
1. ضع `maxDuration` صراحة
2. تحقق من API Keys في البداية
3. ارجع رسائل خطأ عربية واضحة
4. لا تكشف معلومات حساسة في الرد
5. استخدم `gpt-4o-mini` للمهام البسيطة (أسرع/أرخص)
6. استخدم `gpt-4o` فقط للمهام المعقدة

### النماذج المستخدمة:
| المهمة | النموذج |
|-------|---------|
| التحرير | `gpt-4o` |
| Q&A على خبر | `gpt-4o-mini` |
| النشرة اليومية | `gpt-4o-mini` |
| النقاط الرئيسية | `gpt-4o-mini` |
| رسومية | `dall-e-3` |
| واقعية | `imagen-4.0-generate-001` |

---

## 🔒 الأمان

### ❌ ممنوع منعاً باتاً:
- وضع API Keys في الكود المصدري
- مشاركة Secrets في commits أو screenshots
- عدم استخدام HTTPS للطلبات الخارجية
- استخدام `eval()` أو `dangerouslySetInnerHTML` بدون تنظيف

### ✅ المطلوب:
- جميع المفاتيح في `process.env` فقط
- تنظيف input من المستخدم قبل DB
- استخدام Zod للتحقق من schemas
- Rate limiting على API endpoints

---

## 🧪 الاختبار

```bash
# TypeScript check
npx tsc --noEmit

# Build (Production)
npm run build

# Linting
npm run lint
```

قبل أي PR، تأكد:
- ✅ `npx tsc --noEmit` بدون أخطاء
- ✅ `npm run build` ينجح
- ✅ الميزة تعمل في Local
- ✅ لا تكسر ميزات أخرى

---

## 📦 الـ Pull Request

### قالب الـ PR:
```markdown
## ما الذي تم؟
[شرح موجز]

## لماذا؟
[السبب أو المشكلة المحلولة]

## كيف؟
[التفاصيل التقنية]

## Screenshots (للتغييرات البصرية)
[أرفق صور قبل/بعد]

## Checklist
- [ ] الكود يبني بدون أخطاء
- [ ] tsc يمر بدون أخطاء
- [ ] تم اختبار الميزة محلياً
- [ ] تم تحديث CHANGELOG.md
- [ ] لا توجد secrets في الكود
```

---

## 💬 الأسلوب والتواصل

- **العربية** هي اللغة الأساسية للتعليقات والرسائل
- **الإنجليزية** للأكواد والمفاهيم التقنية
- كن مختصراً ومباشراً
- لا تستخدم emojis كثيراً (استثناء: العناوين والقوائم)
- الاحترام أولاً

---

## 🐛 الإبلاغ عن مشاكل

افتح **Issue** على GitHub مع:
- العنوان الواضح
- خطوات إعادة الإنتاج
- النتيجة المتوقعة vs الحالية
- لقطات شاشة إن أمكن
- معلومات البيئة (المتصفح، نظام التشغيل...)

---

## 🙏 شكراً!

كل مساهمة تجعل عاجل أفضل. **تاج الراس!** 👑
