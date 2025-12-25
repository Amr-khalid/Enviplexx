const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// --- إعدادات السيرفر ---
const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://node:1234@learnnode.tca96.mongodb.net/emails";
const EMAIL_USER = "sensosafee@gmail.com";
const EMAIL_PASS = "tqbc fcct pfaq fmzq";

const app = express();
app.use(express.json());

// --- 1. إصلاح مشكلة Vercel (Cached Database Connection) ---
// هذا الجزء يمنع انقطاع الاتصال أو تكراره في بيئة السيرفرلس
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("✅ New Connection to MongoDB");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// تأكد من الاتصال قبل معالجة أي طلب
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send("Database connection failed");
  }
});

// --- 2. نموذج البيانات (Schema) ---
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  facility: { type: String },
  message: { type: String },
  joinedAt: { type: Date, default: Date.now },
  isNotified: { type: Boolean, default: false },
});
// استخدام models لمنع إعادة تعريف الموديل
const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

// --- 3. إعداد البريد الإلكتروني ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// ================= 4. واجهة الموقع (LANDING PAGE HTML) =================
const landingPageHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Enviplex | مستقبل الحلول البيئية</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    
    <style>
        :root {
            --bg-main: #0f172a; --bg-secondary: #1e293b; --primary: #34d399; --primary-light: #6ee7b7;
            --text-main: #f8fafc; --text-muted: #94a3b8; --card-bg: rgba(30, 41, 59, 0.7);
            --card-border: rgba(255, 255, 255, 0.05); --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            --header-overlay: linear-gradient(135deg, rgba(6, 78, 59, 0.85), rgba(15, 23, 42, 0.9));
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; scroll-behavior: smooth; }
        body { background-color: var(--bg-main); color: var(--text-main); overflow-x: hidden; line-height: 1.7; }

        /* Toast Styles */
        #toast-container { position: fixed; bottom: 30px; left: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
        .toast { min-width: 300px; padding: 15px 20px; border-radius: 12px; color: white; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; align-items: center; animation: slideIn 0.4s ease-out forwards; }
        .toast.success { background: linear-gradient(135deg, #059669, #10b981); }
        .toast.error { background: linear-gradient(135deg, #dc2626, #ef4444); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(20px); } }

        /* Layout */
        header { position: relative; height: 100vh; min-height: 600px; display: flex; align-items: center; justify-content: center; text-align: center; background-image: url('https://images.pexels.com/photos/3222686/pexels-photo-3222686.jpeg'); background-size: cover; background-position: center; background-attachment: fixed; }
        .header-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.28); z-index: 1; }
        .hero-content { z-index: 2; padding: 20px; max-width: 900px; color: #fff; }
        header h1 { font-size: 4rem; font-weight: 900; margin-bottom: 20px; background: linear-gradient(to right, #ffffff, #d1fae5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .cta-button { display: inline-flex; align-items: center; gap: 10px; padding: 15px 35px; background: var(--primary); color: #fff; font-size: 1.1rem; font-weight: 700; border-radius: 50px; text-decoration: none; transition: 0.3s; border: none; cursor: pointer; }
        .cta-button:hover { transform: translateY(-3px); background: transparent; border: 2px solid var(--primary); color: #fff; }
        
        section { padding: 90px 20px; max-width: 1280px; margin: auto; }
        .section-title { text-align: center; margin-bottom: 60px; }
        .section-title h2 { font-size: 2.5rem; display: inline-block; margin-bottom: 15px; position: relative; }
        .section-title h2::after { content: ''; display: block; width: 80px; height: 4px; background: var(--primary); margin: 10px auto 0; border-radius: 2px; }
        
        .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .feature-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 30px; transition: 0.3s; position: relative; overflow: hidden; box-shadow: var(--shadow); backdrop-filter: blur(10px); }
        .feature-card:hover { transform: translateY(-10px); border-color: var(--primary); }
        .icon-box { width: 70px; height: 70px; border-radius: 15px; background: rgba(16, 185, 129, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 20px; }

        .stats-section { background-image: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop'); background-size: cover; background-attachment: fixed; color: white; text-align: center; padding: 80px 20px; margin-top: 50px; }
        .stat-number { font-size: 3rem; font-weight: 900; color: var(--primary); display: block; }

        .contact-container { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; background: var(--bg-secondary); border-radius: 30px; padding: 50px; border: 1px solid var(--card-border); }
        .form-input { width: 100%; padding: 15px; border-radius: 10px; border: 1px solid var(--card-border); background: var(--bg-main); color: var(--text-main); outline: none; margin-bottom: 20px; }
        .form-input:focus { border-color: var(--primary); }

        footer { background: #0f172a; padding: 70px 20px 30px; text-align: center; margin-top: 60px; }
        @media (max-width: 768px) { .contact-container { grid-template-columns: 1fr; } header h1 { font-size: 2.5rem; } }
    </style>
</head>
<body>
    <div id="toast-container"></div>

    <header>
        <div class="header-overlay"></div>
        <div class="hero-content" data-aos="fade-up">
            <h1>Enviplex</h1>
            <p style="font-size: 1.4rem; margin-bottom: 40px; color: #e2e8f0;">حلول ذكية لبيئة أنظف.. ومستقبل أكثر استدامة</p>
            <div style="display:flex; gap:15px; justify-content:center;">
                <a href="#contact-form-section" class="cta-button"><i class="fa-solid fa-phone"></i> تواصل معنا</a>
                <a href="#services" class="cta-button" style="background:transparent; border:2px solid rgba(255,255,255,0.5)"><i class="fa-solid fa-leaf"></i> خدماتنا</a>
            </div>
        </div>
    </header>

    <section id="services">
        <div class="section-title" data-aos="fade-up"><h2>خدماتنا المتكاملة</h2><p>من الجمع الذكي إلى خلق القيمة الاقتصادية</p></div>
        <div class="grid-container">
            <div class="feature-card" data-aos="fade-up"><div class="icon-box"><i class="fa-solid fa-microchip"></i></div><h3>إدارة المخلفات الذكية</h3><p>توفير صناديق ذكية وحساسات (IoT) لمراقبة الامتلاء.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="100"><div class="icon-box"><i class="fa-solid fa-users-viewfinder"></i></div><h3>الفرز من المصدر</h3><p>تقديم استشارات لفرز المخلفات وتدريب العمالة.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="200"><div class="icon-box"><i class="fa-solid fa-seedling"></i></div><h3>إعادة التدوير</h3><p>تشغيل المحطة البيئية وإنتاج سماد عضوي عالي الجودة.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="300"><div class="icon-box"><i class="fa-solid fa-file-contract"></i></div><h3>تقارير الامتثال</h3><p>إصدار تقارير دورية وشهادات امتثال بيئي.</p></div>
        </div>
    </section>

    <div class="stats-section">
        <div class="section-title"><h2 style="color:white">أرقامنا تتحدث</h2></div>
        <div class="grid-container">
            <div data-aos="zoom-in"><span class="stat-number">+500</span><span>طن مخلفات</span></div>
            <div data-aos="zoom-in" data-aos-delay="100"><span class="stat-number">+50</span><span>وظيفة خضراء</span></div>
            <div data-aos="zoom-in" data-aos-delay="200"><span class="stat-number">%80</span><span>تقليل كربون</span></div>
            <div data-aos="zoom-in" data-aos-delay="300"><span class="stat-number">+20</span><span>شريك</span></div>
        </div>
    </div>

    <section id="contact-form-section">
        <div class="section-title" data-aos="fade-up"><h2>انضم لثورة الاستدامة</h2><p>تواصل معنا لحلول مخصصة.</p></div>
        <div class="contact-container" data-aos="fade-up">
            <div>
                <h3>بيانات التواصل</h3>
                <p style="margin-bottom:30px; color:var(--text-muted)">جاهزون للرد على استفساراتكم.</p>
                <div style="margin-bottom:20px"><i class="fa-solid fa-phone" style="color:var(--primary)"></i> +20 128 131 7692</div>
            </div>
            <form id="contactForm">
                <input type="text" id="name" class="form-input" placeholder="الاسم بالكامل" required>
                <input type="email" id="email" class="form-input" placeholder="البريد الإلكتروني" required>
                <input type="text" id="facility" class="form-input" placeholder="اسم المنشأة" required>
                <textarea id="message" class="form-input" rows="4" placeholder="الرسالة..." required></textarea>
                <button type="submit" class="cta-button" style="width:100%">إرسال الطلب <i class="fa-solid fa-paper-plane"></i></button>
            </form>
        </div>
    </section>

    <footer>
        <h3>Enviplex</h3>
        <p>© 2025 Enviplex. All Rights Reserved.</p>
    </footer>

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        AOS.init();

        function showToast(msg, type='success') {
            const container = document.getElementById('toast-container');
            const div = document.createElement('div');
            div.className = \`toast \${type}\`;
            div.innerHTML = \`<i class="fa-solid \${type==='success'?'fa-check-circle':'fa-triangle-exclamation'}"></i>&nbsp;\${msg}\`;
            container.appendChild(div);
            setTimeout(() => { div.style.animation = 'fadeOut 0.5s forwards'; setTimeout(()=>div.remove(),500); }, 3000);
        }

        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'جاري الإرسال...'; btn.disabled = true;

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                facility: document.getElementById('facility').value,
                message: document.getElementById('message').value
            };

            try {
                const res = await fetch('/contact', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
                if(res.ok) { showToast('تم الإرسال بنجاح!'); e.target.reset(); }
                else { showToast('حدث خطأ!', 'error'); }
            } catch(err) { showToast('خطأ في الاتصال', 'error'); }
            finally { btn.innerHTML = originalText; btn.disabled = false; }
        });
    </script>
</body>
</html>
`;

// ================= 5. المسارات (ROUTES) =================

// الصفحة الرئيسية
app.get("/", (req, res) => res.send(landingPageHTML));

// استقبال طلب التواصل
app.post("/contact", async (req, res) => {
  try {
    const { name, email, facility, message } = req.body;
    // حفظ أو تحديث
    await Subscriber.findOneAndUpdate(
      { email: email },
      { name, facility, message, email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // إشعار للأدمن
    await transporter.sendMail({
      from: `"Enviplex System" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: `🔔 طلب جديد: ${facility}`,
      text: `الاسم: ${name}\nالمنشأة: ${facility}\nالرسالة: ${message}`,
    });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// لوحة التحكم (Dashboard)
app.get("/dashboard", async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ joinedAt: -1 });

    const rows = subscribers
      .map(
        (sub) => `
            <tr>
                <td><button class="btn-sm" onclick="notifyOne('${
                  sub.email
                }', '${sub.name || "عميلنا"}')">📧 إرسال</button></td>
                <td>${sub.name || "---"}</td>
                <td>${sub.facility || "---"}</td>
                <td>${sub.email}</td>
                <td>${
                  sub.isNotified
                    ? '<span class="tag yes">تم</span>'
                    : '<span class="tag no">انتظار</span>'
                }</td>
            </tr>
        `
      )
      .join("");

    const html = `
            <!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>لوحة التحكم</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Cairo', sans-serif; background: #f3f4f6; padding: 20px; }
                .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 15px; border-bottom: 1px solid #eee; text-align: right; }
                th { background: #059669; color: white; }
                .btn { padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; }
                .btn-sm { padding: 5px 10px; background: #059669; color: white; border-radius: 5px; cursor: pointer; border: none; }
                .tag { padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
                .tag.yes { background: #d1fae5; color: #065f46; } .tag.no { background: #fee2e2; color: #991b1b; }
                #toast-container { position: fixed; bottom: 30px; left: 30px; display: flex; flex-direction: column; gap: 10px; z-index:999; }
                .toast { padding: 15px 20px; border-radius: 10px; color: white; font-weight: bold; min-width: 250px; animation: slideIn 0.3s forwards; }
                .toast.success { background: #059669; } .toast.error { background: #dc2626; }
                @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
            </style>
            </head><body>
                <div id="toast-container"></div>
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h1 style="color:#059669">لوحة تحكم Enviplex (${subscribers.length})</h1>
                        <button class="btn" onclick="notifyAll()">📢 إرسال للجميع</button>
                    </div>
                    <table><thead><tr><th>إجراء</th><th>الاسم</th><th>المنشأة</th><th>الإيميل</th><th>الحالة</th></tr></thead><tbody>${rows}</tbody></table>
                </div>
                <script>
                    function showToast(msg, type='success') {
                        const div = document.createElement('div'); div.className = \`toast \${type}\`; div.innerText = msg;
                        document.getElementById('toast-container').appendChild(div); setTimeout(() => div.remove(), 3000);
                    }
                    async function notifyAll() {
                        if(!confirm('إرسال للكل؟')) return;
                        try { await fetch('/notify', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type: 'all' }) }); showToast('تم الإرسال للجميع'); setTimeout(()=>location.reload(), 2000); } catch(e) { showToast('خطأ', 'error'); }
                    }
                    async function notifyOne(email, name) {
                        if(!confirm(\`إرسال إلى \${name}؟\`)) return;
                        try { await fetch('/notify', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type: 'single', email }) }); showToast('تم الإرسال'); setTimeout(()=>location.reload(), 2000); } catch(e) { showToast('خطأ', 'error'); }
                    }
                </script>
            </body></html>
        `;
    res.send(html);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// إرسال الإشعارات (Backend Logic)
app.post("/notify", async (req, res) => {
  try {
    const { type, email } = req.body;

    if (type === "single" && email) {
      const sub = await Subscriber.findOne({ email });
      if (sub) {
        await transporter.sendMail({
          from: `"Enviplex Team" <${EMAIL_USER}>`,
          to: sub.email,
          subject: "تحديث من Enviplex 🌿",
          text: `مرحباً ${sub.name || ""}،\nتم استلام طلبكم الخاص بمنشأة "${
            sub.facility
          }". سيتواصل معك أحد ممثلينا قريباً.`,
        });
        sub.isNotified = true;
        await sub.save();
        return res.json({ message: "Sent" });
      }
    }

    if (type === "all") {
      const pending = await Subscriber.find({ isNotified: false });
      for (const sub of pending) {
        try {
          await transporter.sendMail({
            from: `"Enviplex Team" <${EMAIL_USER}>`,
            to: sub.email,
            subject: "مرحباً بك في Enviplex",
            text: `أهلاً ${sub.name || ""}،\nشكراً لتواصلك معنا.`,
          });
          sub.isNotified = true;
          await sub.save();
        } catch (e) {
          console.error(e);
        }
      }
      return res.json({ message: "Bulk Sent" });
    }
    res.status(400).json({ message: "Invalid" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server Running: http://localhost:${PORT}`)
);
