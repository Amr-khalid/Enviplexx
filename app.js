const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// --- 1. الإعدادات ---
const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://node:1234@learnnode.tca96.mongodb.net/emails";
const EMAIL_USER = "sensosafee@gmail.com";
const EMAIL_PASS = "tqbc fcct pfaq fmzq";

const app = express();
app.use(express.json());

// --- 2. اتصال قاعدة البيانات ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { bufferCommands: false })
      .then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Database Error");
  }
});

// --- 3. الموديل ---
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  facility: String,
  message: String,
  joinedAt: { type: Date, default: Date.now },
  isNotified: { type: Boolean, default: false },
});
const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

// --- 4. إعداد الإيميل ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// ================= 5. كود HTML (المحتوى الجديد) =================
const landingPageHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Enviplex | الحل الذكي للاستدامة</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <style>
        :root { --primary: #059669; --bg-main: #0f172a; --text-main: #f8fafc; --card-bg: rgba(30, 41, 59, 0.7); }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
        body { background-color: var(--bg-main); color: var(--text-main); line-height: 1.8; overflow-x: hidden; }
        
        /* Toast Notification */
        #toast-container { position: fixed; bottom: 30px; left: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
        .toast { min-width: 300px; padding: 15px 20px; border-radius: 12px; color: white; font-weight: bold; display: flex; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: slideIn 0.4s ease-out forwards; }
        .toast.success { background: linear-gradient(135deg, #059669, #10b981); }
        .toast.error { background: linear-gradient(135deg, #dc2626, #ef4444); }
        @keyframes slideIn { from { opacity:0; transform:translateX(-50px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeOut { to { opacity:0; transform:translateY(20px); } }

        /* General Styles */
        header { height: 100vh; min-height: 600px; display: flex; align-items: center; justify-content: center; text-align: center; background: url('https://images.pexels.com/photos/3222686/pexels-photo-3222686.jpeg') center/cover fixed; position: relative; }
        .header-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
        .hero-content { position: relative; z-index: 2; padding: 20px; max-width: 900px; }
        h1 { font-size: 3.5rem; margin-bottom: 20px; background: linear-gradient(to right, #fff, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .cta-button { display: inline-flex; align-items: center; gap: 10px; padding: 12px 35px; background: var(--primary); color: #fff; border-radius: 50px; text-decoration: none; font-weight: bold; border: none; cursor: pointer; transition: 0.3s; }
        .cta-button:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(5, 150, 105, 0.4); }
        .cta-outline { background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); }

        section { padding: 90px 20px; max-width: 1200px; margin: auto; }
        .section-title { text-align: center; margin-bottom: 60px; }
        .section-title h2 { font-size: 2.5rem; display: inline-block; margin-bottom: 15px; border-bottom: 4px solid var(--primary); padding-bottom: 5px; }
        
        .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .feature-card { background: var(--card-bg); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
        .feature-card:hover { transform: translateY(-5px); border-color: var(--primary); }
        .icon-box { font-size: 2rem; color: var(--primary); margin-bottom: 15px; }

        /* About Section (New) */
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; }
        .about-img { width: 100%; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        
        /* Comparison Table (New) */
        .comparison-box { background: var(--card-bg); border-radius: 20px; padding: 30px; overflow-x: auto; }
        .comp-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .comp-table th, .comp-table td { padding: 15px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .comp-table th { color: var(--primary); font-size: 1.2rem; }
        .comp-table td:first-child { text-align: right; font-weight: bold; color: #fff; }
        .cross { color: #ef4444; } .check { color: #059669; }

        /* FAQ (New) */
        .faq-item { background: rgba(255,255,255,0.03); margin-bottom: 15px; border-radius: 10px; padding: 20px; cursor: pointer; transition: 0.3s; }
        .faq-item:hover { background: rgba(255,255,255,0.06); }
        .faq-question { font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
        .faq-answer { display: none; margin-top: 15px; color: #94a3b8; font-size: 0.95rem; }
        .faq-item.active .faq-answer { display: block; }
        .faq-item.active .faq-question { color: var(--primary); }

        .stats-section { background: linear-gradient(rgba(15,23,42,0.9), rgba(15,23,42,0.9)), url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop'); background-size: cover; background-attachment: fixed; text-align: center; padding: 80px 20px; margin: 50px 0; }
        .stat-number { font-size: 3rem; font-weight: 900; color: var(--primary); display: block; }

        .contact-container { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; background: #1e293b; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .form-input { width: 100%; padding: 15px; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; margin-bottom: 20px; outline: none; }
        .form-input:focus { border-color: var(--primary); }
        
        footer { background: #020617; padding: 50px 20px; text-align: center; margin-top: 50px; border-top: 1px solid #1e293b; }
        @media(max-width:768px){ 
            .contact-container, .about-grid { grid-template-columns: 1fr; } 
            h1 { font-size: 2.5rem; } 
            .about-img { display: none; } /* Hide image on mobile for speed */
        }
    </style>
</head>
<body>
    <div id="toast-container"></div>

    <header>
        <div class="header-overlay"></div>
        <div class="hero-content" data-aos="fade-up">
            <h1>Enviplex</h1>
            <p style="font-size: 1.4rem; margin-bottom: 40px; color: #e2e8f0;">نحو بيئة أنظف، إدارة أذكى، وعائد اقتصادي مستدام.</p>
            <div style="display:flex; justify-content:center; gap:15px">
                <a href="#contact" class="cta-button"><i class="fa-solid fa-envelope"></i> اطلب استشارة</a>
                <a href="#about" class="cta-button cta-outline"><i class="fa-solid fa-info-circle"></i> اقرأ المزيد</a>
            </div>
        </div>
    </header>

    <section id="about">
        <div class="about-grid">
            <div data-aos="fade-right">
                <h2 style="font-size: 2rem; margin-bottom: 20px; color: var(--primary);">من نحن؟</h2>
                <p style="margin-bottom: 15px;">نحن في <strong>Enviplex</strong> نؤمن بأن النفايات ليست نهاية المطاف، بل هي بداية لدورة حياة جديدة. نحن شركة تكنولوجيا بيئية مقرها الإسكندرية، نهدف إلى إحداث ثورة في كيفية تعامل المنشآت السياحية والسكنية مع المخلفات.</p>
                <p style="margin-bottom: 15px;">نجمع بين <strong>التكنولوجيا (IoT)</strong> و <strong>العمليات الميدانية</strong> لتقديم حلول لا تكتفي بالنظافة فقط، بل تخلق قيمة اقتصادية وتعزز صورة منشأتك ككيان صديق للبيئة.</p>
                <div style="margin-top: 20px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px"><i class="fa-solid fa-check-circle" style="color:var(--primary)"></i> <span>فريق متخصص ومعتمد</span></div>
                    <div style="display:flex; align-items:center; gap:10px"><i class="fa-solid fa-check-circle" style="color:var(--primary)"></i> <span>تكنولوجيا تتبع لحظية</span></div>
                </div>
            </div>
            <div data-aos="fade-left">
                <img src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=800" alt="About Enviplex" class="about-img">
            </div>
        </div>
    </section>

    <section id="services">
        <div class="section-title" data-aos="fade-up"><h2>خدماتنا المتكاملة</h2><p>حلول شاملة تغطي دورة حياة المخلفات بالكامل</p></div>
        <div class="grid-container">
            <div class="feature-card" data-aos="fade-up"><div class="icon-box"><i class="fa-solid fa-microchip"></i></div><h3>إدارة ذكية</h3><p>صناديق IoT ترسل تنبيهات عند الامتلاء، مع نظام تتبع للأسطول لضمان الكفاءة.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="100"><div class="icon-box"><i class="fa-solid fa-recycle"></i></div><h3>إعادة تدوير</h3><p>محطات فرز متطورة لفصل المواد، وإنتاج سماد عضوي عالي الجودة للزراعة.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="200"><div class="icon-box"><i class="fa-solid fa-file-contract"></i></div><h3>امتثال بيئي</h3><p>إصدار تقارير دورية وشهادات امتثال تساعد في الحصول على التراخيص البيئية.</p></div>
        </div>
    </section>

    <section id="comparison">
        <div class="section-title" data-aos="fade-up"><h2>لماذا Enviplex ضرورة؟</h2><p>الفرق بين الطرق التقليدية وحلولنا الذكية</p></div>
        <div class="comparison-box" data-aos="zoom-in">
            <table class="comp-table">
                <thead>
                    <tr>
                        <th>وجه المقارنة</th>
                        <th>الطرق التقليدية</th>
                        <th>مع Enviplex 🚀</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>الكفاءة</td>
                        <td><i class="fa-solid fa-xmark cross"></i> جداول ثابتة (تراكم نفايات)</td>
                        <td><i class="fa-solid fa-check check"></i> جمع عند الطلب (حساسات ذكية)</td>
                    </tr>
                    <tr>
                        <td>الأثر البيئي</td>
                        <td><i class="fa-solid fa-xmark cross"></i> حرق أو دفن عشوائي</td>
                        <td><i class="fa-solid fa-check check"></i> إعادة تدوير وإنتاج سماد</td>
                    </tr>
                    <tr>
                        <td>العائد</td>
                        <td><i class="fa-solid fa-xmark cross"></i> تكلفة مهدرة</td>
                        <td><i class="fa-solid fa-check check"></i> عائد مادي من المواد المدورة</td>
                    </tr>
                    <tr>
                        <td>البيانات</td>
                        <td><i class="fa-solid fa-xmark cross"></i> لا توجد تقارير</td>
                        <td><i class="fa-solid fa-check check"></i> تقارير دقيقة وشهادات</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <div class="stats-section">
        <div class="grid-container">
            <div data-aos="zoom-in"><span class="stat-number">+500</span><span>طن مخلفات</span></div>
            <div data-aos="zoom-in" data-aos-delay="100"><span class="stat-number">+50</span><span>وظيفة خضراء</span></div>
            <div data-aos="zoom-in" data-aos-delay="200"><span class="stat-number">%80</span><span>تقليل كربون</span></div>
            <div data-aos="zoom-in" data-aos-delay="300"><span class="stat-number">+20</span><span>شريك</span></div>
        </div>
    </div>

    <section id="faq">
        <div class="section-title" data-aos="fade-up"><h2>أسئلة شائعة</h2><p>كل ما تحتاج معرفته عن خدماتنا</p></div>
        <div style="max-width: 800px; margin: 0 auto;">
            <div class="faq-item" onclick="this.classList.toggle('active')" data-aos="fade-up">
                <div class="faq-question"><span>ما هي تكلفة الخدمة؟</span> <i class="fa-solid fa-chevron-down"></i></div>
                <div class="faq-answer">تختلف التكلفة حسب حجم المنشأة وكمية النفايات. نحن نقدم نموذجاً مرناً يتيح لك تقليل التكاليف من خلال بيع المواد القابلة للتدوير. تواصل معنا للحصول على عرض سعر مخصص.</div>
            </div>
            <div class="faq-item" onclick="this.classList.toggle('active')" data-aos="fade-up" data-aos-delay="100">
                <div class="faq-question"><span>هل توفرون صناديق القمامة الذكية؟</span> <i class="fa-solid fa-chevron-down"></i></div>
                <div class="faq-answer">نعم، نوفر حاويات ذكية مزودة بحساسات IoT لقياس مستوى الامتلاء وإرسال تنبيهات لفريق الجمع، مما يمنع الروائح الكريهة وتراكم القمامة.</div>
            </div>
            <div class="faq-item" onclick="this.classList.toggle('active')" data-aos="fade-up" data-aos-delay="200">
                <div class="faq-question"><span>كيف أستفيد من العائد المادي؟</span> <i class="fa-solid fa-chevron-down"></i></div>
                <div class="faq-answer">نقوم بفرز وبيع المواد (بلاستيك، ورق، معادن) للمصانع، ونشارك نسبة من الأرباح مع إدارة المنشأة أو نخصمها من تكاليف التشغيل.</div>
            </div>
        </div>
    </section>

    <section id="contact">
        <div class="section-title" data-aos="fade-up"><h2>ابدأ رحلة التحول</h2><p>تواصل معنا اليوم لحلول مخصصة لمنشأتك.</p></div>
        <div class="contact-container" data-aos="fade-up">
            <div>
                <h3>بيانات التواصل</h3>
                <p style="margin-bottom:20px; color:#94a3b8">فريقنا جاهز للإجابة على استفساراتك وبدء شراكة ناجحة.</p>
                <p><i class="fa-solid fa-phone" style="color:var(--primary)"></i> +20 128 131 7692</p>
            </div>
            <form id="contactForm">
                <input type="text" id="name" class="form-input" placeholder="الاسم بالكامل" required>
                <input type="email" id="email" class="form-input" placeholder="البريد الإلكتروني" required>
                <input type="text" id="facility" class="form-input" placeholder="اسم المنشأة (قرية / كمبوند)" required>
                <textarea id="message" class="form-input" rows="4" placeholder="تفاصيل استفسارك..." required></textarea>
                <button type="submit" class="cta-button" style="width:100%">إرسال الطلب <i class="fa-solid fa-paper-plane"></i></button>
            </form>
        </div>
    </section>

    <footer>
        <h3>Enviplex</h3>
        <p>نحول المخلفات إلى فرص، ونبني مدناً ذكية للأجيال القادمة.</p>
        <p style="margin-top: 20px; font-size: 0.85rem; color: #475569;">© 2025 Enviplex. All Rights Reserved.</p>
    </footer>

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        AOS.init({ once: true, offset: 50 });

        function showToast(msg, type='success') {
            const container = document.getElementById('toast-container');
            const div = document.createElement('div');
            div.className = \`toast \${type}\`;
            div.innerHTML = \`<i class="fa-solid \${type==='success'?'fa-check-circle':'fa-triangle-exclamation'}"></i>&nbsp;\${msg}\`;
            container.appendChild(div);
            setTimeout(() => { div.style.animation = 'fadeOut 0.5s forwards'; setTimeout(() => div.remove(), 500); }, 4000);
        }

        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ جاري المعالجة...'; btn.disabled = true;

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                facility: document.getElementById('facility').value,
                message: document.getElementById('message').value
            };

            try {
                const res = await fetch('/contact', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
                if(res.ok) {
                    showToast('تم استلام طلبك! راجع بريدك الإلكتروني.');
                    e.target.reset();
                } else {
                    showToast('حدث خطأ، حاول مرة أخرى.', 'error');
                }
            } catch(err) {
                showToast('خطأ في الاتصال بالسيرفر', 'error');
            } finally {
                btn.innerHTML = originalText; btn.disabled = false;
            }
        });
    </script>
</body>
</html>
`;

// ================= 6. المسارات (ROUTES) =================

app.get("/", (req, res) => res.send(landingPageHTML));

// استقبال الطلب + حفظ + تنبيه + رد آلي
app.post("/contact", async (req, res) => {
  try {
    const { name, email, facility, message } = req.body;

    // 1. حفظ في قاعدة البيانات
    await Subscriber.findOneAndUpdate(
      { email: email },
      { name, facility, message, email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. إرسال تنبيه لك (الأدمن)
    await transporter.sendMail({
      from: `"Enviplex System" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: `🔔 عميل جديد: ${facility}`,
      text: `الاسم: ${name}\nالإيميل: ${email}\nالمنشأة: ${facility}\nالرسالة: ${message}`,
    });

    // 3. إرسال رد تلقائي للعميل (HTML Template)
    await transporter.sendMail({
      from: `"فريق Enviplex" <${EMAIL_USER}>`,
      to: email,
      subject: "استلمنا طلبك بنجاح! 🌿",
      html: `
                <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; background-color: #f3f4f6; padding: 40px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <div style="background-color: #059669; padding: 20px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 24px;">Enviplex</h1>
                        </div>
                        <div style="padding: 30px;">
                            <h2 style="color: #1f2937; margin-top: 0;">أهلاً ${name}،</h2>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">شكراً لتواصلك مع <strong>Enviplex</strong>. لقد استلمنا طلبك بخصوص <strong>"${facility}"</strong> بنجاح.</p>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">يقوم فريقنا حالياً بمراجعة تفاصيل طلبك، وسيقوم أحد خبرائنا بالتواصل معك قريباً جداً لمناقشة الخطوات القادمة.</p>
                            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #166534; font-size: 14px;"><strong>رسالتك المسجلة:</strong><br>${message}</p>
                            </div>
                            <p style="color: #4b5563;">مع أطيب التحيات،<br>فريق Enviplex</p>
                        </div>
                        <div style="background-color: #1f2937; padding: 15px; text-align: center; color: #9ca3af; font-size: 12px;">
                            &copy; 2025 Enviplex. جميع الحقوق محفوظة.
                        </div>
                    </div>
                </div>
            `,
    });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// لوحة التحكم (مع زر الحذف)
app.get("/dashboard", async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ joinedAt: -1 });
    const rows = subscribers
      .map(
        (sub) => `
            <tr>
                <td>
                    <button class="btn-sm" onclick="notifyOne('${
                      sub.email
                    }', '${sub.name}')">📧</button>
                    <button class="btn-sm btn-del" onclick="deleteUser('${
                      sub.email
                    }')">❌</button>
                </td>
                <td>${sub.name || "-"}</td>
                <td>${sub.email}</td>
                <td>${sub.facility || "-"}</td>
                <td>${
                  sub.isNotified
                    ? '<span class="tag yes">تم</span>'
                    : '<span class="tag no">جديد</span>'
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
                .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: right; }
                th { background: #059669; color: white; }
                .btn { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; }
                .btn-sm { padding: 5px 10px; background: #059669; color: white; border-radius: 4px; cursor: pointer; border: none; margin-left: 5px; }
                .btn-del { background: #dc2626; }
                .tag { padding: 4px 8px; border-radius: 10px; font-size: 0.8rem; }
                .tag.yes { background: #d1fae5; color: #065f46; } .tag.no { background: #fee2e2; color: #991b1b; }
            </style>
            </head><body>
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h1>Enviplex Dashboard (${subscribers.length})</h1>
                        <button class="btn" onclick="notifyAll()">📢 إرسال للجميع</button>
                    </div>
                    <table><thead><tr><th>إجراء</th><th>الاسم</th><th>الإيميل</th><th>المنشأة</th><th>الحالة</th></tr></thead><tbody>${rows}</tbody></table>
                </div>
                <script>
                    async function notifyAll() { if(confirm('إرسال للكل؟')) fetch('/notify', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'all'})}).then(()=>alert('تم')).then(()=>location.reload()); }
                    async function notifyOne(email, name) { if(confirm('إرسال لـ '+name+'؟')) fetch('/notify', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'single', email})}).then(()=>alert('تم')).then(()=>location.reload()); }
                    async function deleteUser(email) { if(confirm('حذف؟')) fetch('/delete', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email})}).then(()=>location.reload()); }
                </script>
            </body></html>
        `;
    res.send(html);
  } catch (e) {
    res.status(500).send("Error");
  }
});

// APIs الإشعارات والحذف
app.post("/notify", async (req, res) => {
  try {
    const { type, email } = req.body;
    if (type === "single") {
      const sub = await Subscriber.findOne({ email });
      if (sub) {
        await transporter.sendMail({
          from: `"Enviplex" <${EMAIL_USER}>`,
          to: sub.email,
          subject: "تحديث بخصوص طلبك",
          text: `مرحباً ${sub.name}، سيتواصل معك فريقنا قريباً.`,
        });
        sub.isNotified = true;
        await sub.save();
      }
    } else {
      const pending = await Subscriber.find({ isNotified: false });
      for (const sub of pending) {
        await transporter.sendMail({
          from: `"Enviplex" <${EMAIL_USER}>`,
          to: sub.email,
          subject: "مرحباً بك",
          text: `شكراً لتواصلك معنا.`,
        });
        sub.isNotified = true;
        await sub.save();
      }
    }
    res.json({ message: "Done" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/delete", async (req, res) => {
  try {
    await Subscriber.deleteOne({ email: req.body.email });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server Running: http://localhost:${PORT}`)
);
