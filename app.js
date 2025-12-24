const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// --- إعدادات السيرفر ---
const PORT = 3000;
const MONGO_URI = "mongodb+srv://node:1234@learnnode.tca96.mongodb.net/emails";
const EMAIL_USER = "sensosafee@gmail.com";
const EMAIL_PASS = "tqbc fcct pfaq fmzq";

const app = express();
app.use(express.json());

// --- الاتصال بقاعدة البيانات ---
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Error:", err));

// --- نموذج البيانات (Schema) ---
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  facility: { type: String },
  message: { type: String },
  joinedAt: { type: Date, default: Date.now },
  isNotified: { type: Boolean, default: false },
});
const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// --- إعداد البريد الإلكتروني ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// ================= 1. واجهة الموقع (LANDING PAGE) =================
// تم دمج كود HTML الخاص بك هنا مع إضافة السكربتات اللازمة للاتصال
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
        /* --- Theming System --- */
        :root {
            --bg-main: #f8fafc; --bg-secondary: #ffffff;
            --primary: #059669; --primary-light: #10b981;
            --primary-glow: rgba(16, 185, 129, 0.2);
            --text-main: #1e293b; --text-muted: #64748b;
            --card-bg: #ffffff; --card-border: #e2e8f0;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --header-overlay: linear-gradient(135deg, rgba(5, 150, 105, 0.9), rgba(15, 23, 42, 0.8));
        }

        [data-theme="dark"] {
            --bg-main: #0f172a; --bg-secondary: #1e293b;
            --primary: #34d399; --primary-light: #6ee7b7;
            --primary-glow: rgba(52, 211, 153, 0.15);
            --text-main: #f8fafc; --text-muted: #94a3b8;
            --card-bg: rgba(30, 41, 59, 0.7); --card-border: rgba(255, 255, 255, 0.05);
            --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            --header-overlay: linear-gradient(135deg, rgba(6, 78, 59, 0.85), rgba(15, 23, 42, 0.9));
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; scroll-behavior: smooth; }
        
        body { 
            background-color: var(--bg-main); color: var(--text-main);
            overflow-x: hidden; line-height: 1.7; transition: background-color 0.4s ease, color 0.4s ease;
        }

        /* --- Toast Notification Styles (NEW) --- */
        #toast-container { position: fixed; bottom: 30px; left: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
        .toast {
            min-width: 300px; padding: 15px 20px; border-radius: 12px; color: white;
            font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; align-items: center;
            animation: slideIn 0.4s ease-out forwards;
        }
        .toast.success { background: linear-gradient(135deg, #059669, #10b981); }
        .toast.error { background: linear-gradient(135deg, #dc2626, #ef4444); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(20px); } }

        /* --- Styles from your HTML --- */
        .theme-toggle { position: fixed; top: 20px; left: 20px; z-index: 1001; width: 45px; height: 45px; border-radius: 50%; background: var(--card-bg); border: 1px solid var(--primary); color: var(--primary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(5px); transition: 0.3s; }
        .theme-toggle:hover { transform: rotate(15deg) scale(1.1); background: var(--primary); color: #fff; }

        header { position: relative; height: 100vh; min-height: 600px; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; background-image: url('https://images.pexels.com/photos/3222686/pexels-photo-3222686.jpeg'); background-size: cover; background-position: center; background-attachment: fixed; }
        .header-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.28); z-index: 1; }
        .hero-content { z-index: 2; padding: 20px; max-width: 900px; color: #fff; width: 100%; }
        header h1 { font-size: 4rem; font-weight: 900; margin-bottom: 20px; text-shadow: 0 4px 20px rgba(0,0,0,0.3); background: linear-gradient(to right, #ffffff, #d1fae5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        header p { font-size: 1.4rem; margin-bottom: 40px; font-weight: 600; color: #e2e8f0; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }

        .cta-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 35px; background: var(--primary); color: #fff; font-size: 1.1rem; font-weight: 700; border-radius: 50px; text-decoration: none; transition: 0.3s; box-shadow: 0 4px 15px var(--primary-glow); border: 2px solid transparent; cursor: pointer; }
        .cta-button:hover { transform: translateY(-3px); box-shadow: 0 8px 25px var(--primary-glow); background: transparent; border-color: var(--primary-light); color: var(--primary); }
        [data-theme="dark"] .cta-button:hover { color: #fff; }
        .cta-outline { background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); border: 2px solid rgba(255,255,255,0.5); color: #fff; }
        .cta-outline:hover { background: #fff; color: var(--primary); border-color: #fff; }

        section { padding: 90px 20px; max-width: 1280px; margin: auto; }
        .section-title { text-align: center; margin-bottom: 60px; }
        .section-title h2 { font-size: 2.5rem; color: var(--text-main); position: relative; display: inline-block; margin-bottom: 15px; }
        .section-title h2::after { content: ''; display: block; width: 80px; height: 4px; background: var(--primary); margin: 10px auto 0; border-radius: 2px; }
        .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }

        .feature-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 30px; transition: 0.3s; position: relative; overflow: hidden; box-shadow: var(--shadow); backdrop-filter: blur(10px); }
        .feature-card:hover { transform: translateY(-10px); border-color: var(--primary); }
        .feature-card .icon-box { width: 70px; height: 70px; border-radius: 15px; background: rgba(16, 185, 129, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 20px; transition: 0.3s; }
        .feature-card:hover .icon-box { background: var(--primary); color: #fff; }
        .feature-card h3 { font-size: 1.4rem; margin-bottom: 10px; color: var(--text-main); }
        .feature-card p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; }

        .process-step { position: relative; text-align: center; padding: 10px; }
        .step-number { width: 50px; height: 50px; background: var(--primary); color: white; border-radius: 50%; font-size: 1.5rem; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 20px var(--primary-glow); position: relative; z-index: 2; }
        @media (min-width: 992px) { .process-step::after { content: ''; position: absolute; top: 25px; right: -50%; width: 100%; height: 2px; background: var(--card-border); z-index: 1; } .process-step:last-child::after { display: none; } }

        .stats-section { background-image: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1374&q=80'); background-size: cover; background-attachment: fixed; color: white; text-align: center; padding: 80px 20px; margin-top: 50px; }
        .stat-card { margin-bottom: 20px; }
        .stat-number { font-size: 3rem; font-weight: 900; color: var(--primary); display: block; }
        
        .value-section { background: var(--bg-secondary); border-radius: 30px; margin: 40px auto; padding: 60px 30px; }
        .prop-list { list-style: none; padding: 0; }
        .prop-item { margin-bottom: 15px; padding-right: 25px; position: relative; color: var(--text-muted); font-size: 1rem; }
        .prop-item::before { content: '\\f00c'; font-family: 'Font Awesome 6 Free'; font-weight: 900; position: absolute; right: 0; top: 2px; color: var(--primary); }

        .contact-container { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; background: var(--bg-secondary); border-radius: 30px; padding: 50px; box-shadow: var(--shadow); border: 1px solid var(--card-border); }
        .form-group { margin-bottom: 20px; }
        .form-input { width: 100%; padding: 15px; border-radius: 10px; border: 1px solid var(--card-border); background: var(--bg-main); color: var(--text-main); outline: none; transition: 0.3s; }
        .form-input:focus { border-color: var(--primary); box-shadow: 0 0 10px var(--primary-glow); }

        .partners-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; margin-top: 40px; }
        .partner-logo { filter: grayscale(100%); opacity: 0.6; transition: 0.3s; font-size: 1.5rem; font-weight: bold; color: var(--text-muted); display: flex; align-items: center; gap: 10px; }
        .partner-logo:hover { filter: grayscale(0%); opacity: 1; color: var(--primary); }

        .whatsapp-float { position: fixed; bottom: 30px; right: 30px; background: #25d366; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4); z-index: 1000; transition: 0.3s; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); } 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); } }

        footer { background: #0f172a; color: #f1f5f9; padding: 70px 20px 30px; text-align: center; margin-top: 60px; }
        footer h3 { color: var(--primary); font-size: 2rem; margin-bottom: 15px; }

        @media (max-width: 768px) {
            header { background-attachment: scroll; padding: 0 15px; }
            header h1 { font-size: 2.5rem; line-height: 1.2; }
            .contact-container { grid-template-columns: 1fr; padding: 30px 20px; }
            .process-step::after { display: none; }
            .grid-container { gap: 20px; }
            .partners-grid { gap: 25px; }
            .partner-logo { font-size: 1.2rem; width: 45%; justify-content: center; }
        }
    </style>
</head>
<body data-theme="dark">

    <div id="toast-container"></div> <button class="theme-toggle" id="theme-btn" aria-label="Toggle Theme"><i class="fa-solid fa-sun"></i></button>
    <a href="https://wa.me/201281317692" target="_blank" class="whatsapp-float"><i class="fa-brands fa-whatsapp"></i></a>

    <header>
        <div class="header-overlay"></div>
        <div class="hero-content" data-aos="fade-up" data-aos-duration="1200">
            <h1>Enviplex</h1>
            <p>حلول ذكية لبيئة أنظف.. ومستقبل أكثر استدامة</p>
            <p style="font-size: 1rem; color: #cbd5e1; margin-top: -15px; margin-bottom: 40px; font-weight: 400; line-height: 1.5;">إدارة متكاملة للمخلفات للقرى السياحية والكمبوندات السكنية</p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="#contact-form-section" class="cta-button"><i class="fa-solid fa-phone"></i> تواصل معنا</a>
                <a href="#services" class="cta-button cta-outline"><i class="fa-solid fa-leaf"></i> خدماتنا</a>
            </div>
        </div>
    </header>

    <section id="partners" style="padding: 40px 20px; background: var(--bg-secondary);">
        <div class="section-title" style="margin-bottom: 30px;">
            <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem;">Key Partners - شركاء النجاح</p>
        </div>
        <div class="partners-grid" data-aos="fade-in">
            <div class="partner-logo"><i class="fa-solid fa-industry"></i> مصانع التدوير</div>
            <div class="partner-logo"><i class="fa-solid fa-truck-fast"></i> شركات النقل</div>
            <div class="partner-logo"><i class="fa-solid fa-wifi"></i> حلول IoT</div>
            <div class="partner-logo"><i class="fa-solid fa-landmark"></i> الجهات البيئية</div>
            <div class="partner-logo"><i class="fa-solid fa-building-user"></i> إدارة المرافق</div>
        </div>
    </section>

    <section id="services">
        <div class="section-title" data-aos="fade-up"><h2>خدماتنا المتكاملة</h2><p>من الجمع الذكي إلى خلق القيمة الاقتصادية</p></div>
        <div class="grid-container">
            <div class="feature-card" data-aos="fade-up" data-aos-delay="100"><div class="icon-box"><i class="fa-solid fa-microchip"></i></div><h3>إدارة المخلفات الذكية</h3><p>توفير صناديق ذكية وحساسات (IoT) لمراقبة الامتلاء، مع نظام تتبع (Tracking System) للأسطول.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="200"><div class="icon-box"><i class="fa-solid fa-users-viewfinder"></i></div><h3>الفرز من المصدر والتدريب</h3><p>تقديم استشارات لفرز المخلفات من المنبع، وتدريب العمالة والسكان.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="300"><div class="icon-box"><i class="fa-solid fa-seedling"></i></div><h3>إعادة التدوير وإنتاج السماد</h3><p>تشغيل المحطة البيئية لفرز المخلفات، وإنتاج سماد عضوي عالي الجودة.</p></div>
            <div class="feature-card" data-aos="fade-up" data-aos-delay="400"><div class="icon-box"><i class="fa-solid fa-file-contract"></i></div><h3>تقارير الامتثال البيئي</h3><p>إصدار تقارير دورية وشهادات امتثال تساعد المنشآت في الحصول على التراخيص.</p></div>
        </div>
    </section>

    <section id="process">
        <div class="section-title" data-aos="fade-up"><h2>رحلة المخلفات معنا</h2><p>كيف نحول النفايات إلى قيمة في 4 خطوات بسيطة</p></div>
        <div class="grid-container" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div class="process-step" data-aos="fade-up" data-aos-delay="100"><div class="step-number">1</div><div class="feature-card"><i class="fa-solid fa-dumpster" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i><h3>الجمع الذكي</h3><p style="font-size: 0.9rem;">جمع المخلفات باستخدام صناديق ذكية.</p></div></div>
            <div class="process-step" data-aos="fade-up" data-aos-delay="200"><div class="step-number">2</div><div class="feature-card"><i class="fa-solid fa-filter" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i><h3>الفرز الدقيق</h3><p style="font-size: 0.9rem;">فصل العضوي عن الصلب.</p></div></div>
            <div class="process-step" data-aos="fade-up" data-aos-delay="300"><div class="step-number">3</div><div class="feature-card"><i class="fa-solid fa-recycle" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i><h3>المعالجة</h3><p style="font-size: 0.9rem;">تحويل العضوي لسماد، وكبس المواد.</p></div></div>
            <div class="process-step" data-aos="fade-up" data-aos-delay="400"><div class="step-number">4</div><div class="feature-card"><i class="fa-solid fa-hand-holding-dollar" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i><h3>العائد</h3><p style="font-size: 0.9rem;">بيع المنتجات وتحقيق دخل.</p></div></div>
        </div>
    </section>

    <div class="stats-section">
        <div class="section-title"><h2 style="color: white;">أرقامنا تتحدث</h2></div>
        <div class="grid-container">
            <div class="stat-card" data-aos="zoom-in"><span class="stat-number">+500</span><span class="stat-label">طن مخلفات تمت معالجتها</span></div>
            <div class="stat-card" data-aos="zoom-in" data-aos-delay="100"><span class="stat-number">+50</span><span class="stat-label">فرصة عمل خضراء</span></div>
            <div class="stat-card" data-aos="zoom-in" data-aos-delay="200"><span class="stat-number">%80</span><span class="stat-label">تقليل الانبعاثات الكربونية</span></div>
            <div class="stat-card" data-aos="zoom-in" data-aos-delay="300"><span class="stat-number">+20</span><span class="stat-label">شريك استراتيجي</span></div>
        </div>
    </div>

    <section id="value" class="value-section">
        <div class="grid-container" style="align-items: center;">
            <div data-aos="fade-right">
                <h2 style="font-size: 2rem; margin-bottom: 20px; color: var(--text-main);">لماذا نحن الخيار الأمثل؟</h2>
                <p style="margin-bottom: 30px; color: var(--text-muted);">نقدم قيمة مضافة حقيقية لعملائنا (Value Propositions) تدعم الاستدامة والربحية معاً.</p>
                <div style="margin-bottom: 30px;"><h4 style="color: var(--primary); margin-bottom: 10px;"><i class="fa-solid fa-umbrella-beach"></i> للقرى السياحية:</h4><ul class="prop-list"><li class="prop-item">وجهة صديقة للبيئة.</li><li class="prop-item">تقارير بيئية تدعم التراخيص.</li><li class="prop-item">شواطئ نظيفة.</li></ul></div>
                <div><h4 style="color: #3b82f6; margin-bottom: 10px;"><i class="fa-solid fa-city"></i> للكمبوندات السكنية:</h4><ul class="prop-list"><li class="prop-item">بيئة صحية خالية من الروائح.</li><li class="prop-item">نظام حوافز للسكان.</li><li class="prop-item">تقليل تكاليف التشغيل.</li></ul></div>
            </div>
            <div data-aos="fade-left"><img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop" alt="Sustainable City" style="width: 100%; border-radius: 20px; box-shadow: var(--shadow); object-fit: cover; height: 350px;"></div>
        </div>
    </section>

    <section id="impact">
        <div class="section-title" data-aos="fade-up"><h2>الأثر البيئي والاجتماعي</h2></div>
        <div class="grid-container">
            <div class="feature-card" style="text-align: center;" data-aos="zoom-in"><i class="fa-solid fa-hand-holding-hand" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 15px;"></i><h3>العدالة الاجتماعية</h3><p>دمج القطاع غير الرسمي في منظومة رسمية.</p></div>
            <div class="feature-card" style="text-align: center;" data-aos="zoom-in" data-aos-delay="100"><i class="fa-solid fa-briefcase" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 15px;"></i><h3>وظائف خضراء</h3><p>خلق فرص عمل مستدامة للعمالة المحلية.</p></div>
            <div class="feature-card" style="text-align: center;" data-aos="zoom-in" data-aos-delay="200"><i class="fa-solid fa-recycle" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 15px;"></i><h3>الاقتصاد الدائري</h3><p>تحويل المخلفات من عبء إلى موارد.</p></div>
        </div>
    </section>

    <section id="contact-form-section">
        <div class="section-title" data-aos="fade-up"><h2>انضم لثورة الاستدامة</h2><p>هل تدير قرية سياحية أو كمبوند؟ تواصل معنا لحلول مخصصة.</p></div>
        <div class="contact-container" data-aos="fade-up">
            <div>
                <h3 style="font-size: 1.8rem; margin-bottom: 20px; color: var(--text-main);">بيانات التواصل</h3>
                <p style="margin-bottom: 30px; color: var(--text-muted);">نحن جاهزون للرد على استفساراتكم وبدء شراكة ناجحة.</p>
                <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;"><i class="fa-solid fa-phone" style="color: var(--primary); font-size: 1.2rem;"></i><span>+20 128 131 7692</span></div>
            </div>
            
            <form id="contactForm">
                <div class="form-group"><input type="text" id="name" class="form-input" placeholder="الاسم بالكامل" required></div>
                <div class="form-group"><input type="email" id="email" class="form-input" placeholder="البريد الإلكتروني" required></div>
                <div class="form-group"><input type="text" id="facility" class="form-input" placeholder="اسم المنشأة (قرية / كمبوند)" required></div>
                <div class="form-group"><textarea id="message" class="form-input" rows="4" placeholder="رسالتك أو استفسارك..." required></textarea></div>
                <button type="submit" class="cta-button" style="width: 100%;">إرسال الطلب <i class="fa-solid fa-paper-plane"></i></button>
            </form>
        </div>
    </section>

    <footer>
        <div data-aos="fade-up">
            <h3>Enviplex</h3>
            <a href="https://wa.me/201281317692" class="cta-button" style="padding: 10px 25px; font-size: 1rem;">تواصل معنا الآن <i class="fa-solid fa-arrow-left" style="margin-right: 5px;"></i></a>
            <p style="margin-top: 40px; font-size: 0.85rem; color: #475569;">© 2025 Enviplex. All Rights Reserved.</p>
        </div>
    </footer>

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        AOS.init({ once: true, offset: 100, duration: 1000 });

        // Theme Toggle Logic
        const themeBtn = document.getElementById('theme-btn');
        const themeIcon = themeBtn.querySelector('i');
        const body = document.body;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') { body.removeAttribute('data-theme'); themeIcon.classList.replace('fa-sun', 'fa-moon'); } 
        else { body.setAttribute('data-theme', 'dark'); themeIcon.classList.replace('fa-moon', 'fa-sun'); }
        themeBtn.addEventListener('click', () => {
            if (body.hasAttribute('data-theme')) { body.removeAttribute('data-theme'); themeIcon.classList.replace('fa-sun', 'fa-moon'); localStorage.setItem('theme', 'light'); } 
            else { body.setAttribute('data-theme', 'dark'); themeIcon.classList.replace('fa-moon', 'fa-sun'); localStorage.setItem('theme', 'dark'); }
        });

        // Toast Notification Function
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = \`toast \${type}\`;
            const icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
            toast.innerHTML = \`<span>\${icon} &nbsp; \${message}</span>\`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'fadeOut 0.3s ease-out forwards';
                toast.addEventListener('animationend', () => toast.remove());
            }, 3000);
        }

        // Form Handling with Fetch
        const form = document.getElementById('contactForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ جاري الإرسال...'; btn.disabled = true;

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                facility: document.getElementById('facility').value,
                message: document.getElementById('message').value
            };

            try {
                const res = await fetch('/contact', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if(res.ok) {
                    showToast('تم استلام طلبك بنجاح! سنتواصل معك قريباً', 'success');
                    form.reset();
                } else {
                    showToast(result.message || 'حدث خطأ ما', 'error');
                }
            } catch(err) {
                console.error(err);
                showToast('فشل الاتصال بالسيرفر', 'error');
            } finally {
                btn.innerHTML = originalText; btn.disabled = false;
            }
        });
    </script>
</body>
</html>
`;

// ================= ROUTES (Backend) =================

// 1. الصفحة الرئيسية (عرض الموقع)
app.get("/", (req, res) => {
  res.send(landingPageHTML);
});

// 2. معالجة طلبات التواصل (API)
app.post("/contact", async (req, res) => {
  try {
    const { name, email, facility, message } = req.body;
    // حفظ في قاعدة البيانات (تحديث إذا كان موجوداً مسبقاً)
    await Subscriber.findOneAndUpdate(
      { email: email },
      { name, facility, message, email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // إرسال إشعار للأدمن
    await transporter.sendMail({
      from: `"Enviplex System" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: `🔔 طلب جديد: ${facility}`,
      text: `الاسم: ${name}\nالإيميل: ${email}\nالمنشأة: ${facility}\nالرسالة: ${message}`,
    });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 3. لوحة التحكم (Dashboard)
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
                    ? '<span class="tag yes">تم التواصل</span>'
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
                body { font-family: 'Cairo', sans-serif; background: #f3f4f626; padding: 20px; }
                .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 15px; border-bottom: 1px solid #eee; text-align: right; }
                th { background: #059669; color: white; }
                .btn { padding: 10px 20px; background: #000000ff; border-radius: 8px; color: white; border: none; border-radius: 8px; cursor: pointer; }
                .btn-sm { padding: 5px 10px; background: #059669; color: white; border-radius: 5px; cursor: pointer; border: none; }
                .tag { padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
                .tag.yes { background: #d1fae5; color: #065f46; } .tag.no { background: #fee2e2; color: #991b1b; }
                /* Toast CSS */
                #toast-container { position: fixed; bottom: 20px; left: 20px; display: flex; flex-direction: column; gap: 10px; z-index:999; }
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
    res.status(500).send("Error");
  }
});

// 4. API الإرسال (فردي وجماعي)
app.post("/notify", async (req, res) => {
  try {
    const { type, email } = req.body;

    if (type === "single" && email) {
      const sub = await Subscriber.findOne({ email });
      if (sub) {
        await transporter.sendMail({
          from: `"Enviplex Team" <${EMAIL_USER}>`,
          to: sub.email,
          subject: "تحديث بخصوص طلبكم 🌿",
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
