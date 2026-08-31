# 🌿 Enviplex

منصة ذكية لإدارة المخلفات وإعادة التدوير، تساعد المنشآت السياحية والسكنية على تحسين إدارة النفايات وتحويلها إلى قيمة اقتصادية مستدامة.

---

##المميزات

- Landing Page احترافية باللغة العربية.
- نموذج تواصل مباشر للعملاء.
- حفظ بيانات العملاء في MongoDB.
- إرسال إشعارات بريد إلكتروني تلقائية.
- لوحة تحكم لإدارة العملاء.
- إرسال رسائل فردية أو جماعية.
- حذف العملاء من لوحة التحكم.
- واجهة Responsive لجميع الأجهزة.
- دعم تأثيرات AOS Animation.
- نظام إشعارات Toast.

---

## 🛠️ التقنيات المستخدمة

- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemailer
- HTML / CSS / JavaScript
- AOS Animation

---

## 📂 هيكل المشروع

```bash
project/
│
├── server.js
├── package.json
├── .env
│
├── models/
│   └── Subscriber.js
│
├── routes/
│   ├── contact.js
│   ├── dashboard.js
│   └── notify.js
│
└── public/
    └── assets/
```

---

## ⚙️ التثبيت

### 1- استنساخ المشروع

```bash
git clone https://github.com/Amr-khalid/Enviplexx.git
cd Enviplexx
```

### 2- تثبيت الحزم

```bash
npm install
```

### 3- إنشاء ملف البيئة

```env
PORT=3000

MONGO_URI=your_mongodb_connection

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4- تشغيل المشروع

```bash
npm start
```

أو

```bash
node server.js
```

---

## 📧 نظام البريد الإلكتروني

يتم إرسال:

### إلى الإدارة

- اسم العميل
- البريد الإلكتروني
- اسم المنشأة
- الرسالة

### إلى العميل

رسالة ترحيبية تلقائية تؤكد استلام الطلب.

---

## 📊 قاعدة البيانات

### Subscriber Schema

```javascript
{
  email: String,
  name: String,
  facility: String,
  message: String,
  joinedAt: Date,
  isNotified: Boolean
}
```

---

## 🔗 API Endpoints

### الصفحة الرئيسية

```http
GET /
```

---

### إرسال طلب

```http
POST /contact
```

Body:

```json
{
  "name": "Amr",
  "email": "amr@example.com",
  "facility": "Hotel",
  "message": "Need consultation"
}
```

---

### لوحة التحكم

```http
GET /dashboard
```

---

### إرسال إشعار

```http
POST /notify
```

Single:

```json
{
  "type": "single",
  "email": "user@example.com"
}
```

All:

```json
{
  "type": "all"
}
```

---

### حذف مستخدم

```http
POST /delete
```

```json
{
  "email": "user@example.com"
}
```

---

## 🎯 الهدف

تقديم نظام متكامل لإدارة المخلفات باستخدام التكنولوجيا الحديثة وإنترنت الأشياء (IoT) لتحقيق:

- بيئة أنظف
- تقليل الانبعاثات
- زيادة معدلات إعادة التدوير
- تحسين الكفاءة التشغيلية

---

## 📱 صور المشروع

أضف لقطات شاشة هنا:

```md
![Home](screenshots/home.png)
![Dashboard](screenshots/dashboard.png)
```

---

## 🔒 ملاحظات أمنية

⚠️ لا ترفع بيانات حساسة إلى GitHub مثل:

- MongoDB URI
- Gmail App Password
- API Keys

استخدم دائمًا ملف `.env`.

---

## 👨‍💻 المطور

*Amr Khalid*

GitHub:
https://github.com/Amr-khalid

---

## 📄 License

MIT License
