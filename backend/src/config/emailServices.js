// backend/src/config/emailServices.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// إعدادات Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// التحقق من الاتصال
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Brevo SMTP connection error:', error);
  } else {
    console.log('✅ Brevo SMTP connected successfully');
  }
});

console.log('📧 Email service initialized with Brevo (Sendinblue)');

export const sendResetCode = async (email, username, code) => {
  try {
    console.log(`📧 Sending reset code to: ${email}`);
    console.log(`🔑 Reset code: ${code}`);
    
    const info = await transporter.sendMail({
      from: `"Handys" <${process.env.BREVO_USER}>`,
      to: email,
      subject: 'رمز إعادة تعيين كلمة المرور - Handys',
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>رمز إعادة تعيين كلمة المرور</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 550px;
              width: 100%;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              animation: slideUp 0.5s ease-out;
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 35px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: pulse 3s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 32px;
              font-weight: 700;
              position: relative;
              z-index: 1;
            }
            .header p {
              color: rgba(255,255,255,0.9);
              margin: 10px 0 0;
              font-size: 14px;
              position: relative;
              z-index: 1;
            }
            .content { padding: 40px 35px; }
            .greeting {
              font-size: 22px;
              color: #1f2937;
              margin-bottom: 15px;
              font-weight: 600;
            }
            .message {
              color: #4b5563;
              line-height: 1.6;
              margin-bottom: 30px;
              font-size: 16px;
            }
            .code-container {
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              padding: 30px;
              border-radius: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 48px;
              font-weight: bold;
              letter-spacing: 12px;
              color: #667eea;
              font-family: 'Courier New', monospace;
              background: white;
              padding: 20px;
              border-radius: 16px;
              display: inline-block;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .warning {
              background: #fef3c7;
              border-right: 4px solid #f59e0b;
              padding: 15px 20px;
              margin: 25px 0;
              border-radius: 12px;
              font-size: 14px;
              color: #92400e;
            }
            .footer {
              background: #f9fafb;
              padding: 25px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              color: #6b7280;
              font-size: 12px;
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛠️ Handys</h1>
              <p>منصة الحرفيين والعمال في الجزائر</p>
            </div>
            <div class="content">
              <div class="greeting">مرحباً ${username}،</div>
              <div class="message">
                لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
                استخدم الرمز التالي لإكمال العملية:
              </div>
              <div class="code-container">
                <div class="code">${code}</div>
              </div>
              <div class="message" style="font-size: 14px; text-align: center;">
                ⏰ هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط
              </div>
              <div class="warning">
                ⚠️ <strong>تنبيه:</strong> إذا لم تقم بطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">© ${new Date().getFullYear()} Handys. جميع الحقوق محفوظة.</p>
              <p class="footer-text" style="font-size: 10px;">هذا بريد إلكتروني تلقائي، الرجاء عدم الرد عليه.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    console.log(`✅ Reset code sent successfully to: ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
    
  } catch (error) {
    console.error('❌ Error sending reset code:', error);
    throw error;
  }
};

export const sendPasswordChangedEmail = async (email, username) => {
  try {
    const info = await transporter.sendMail({
      from: `"Handys" <${process.env.BREVO_USER}>`,
      to: email,
      subject: 'تم تغيير كلمة المرور - Handys',
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>تم تغيير كلمة المرور</title>
          <style>
            body {
              font-family: 'Tajawal', 'Segoe UI', Arial, sans-serif;
              background-color: #f6f9fc;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 35px;
              text-align: center;
              color: white;
            }
            .header h1 { margin: 0; font-size: 32px; }
            .content { padding: 35px; }
            .success-icon { text-align: center; font-size: 64px; margin-bottom: 20px; }
            .warning-box {
              background-color: #fef3c7;
              padding: 15px;
              border-radius: 12px;
              margin: 25px 0;
              border-right: 4px solid #f59e0b;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>Handys</h1></div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2 style="text-align: center; color: #1f2937; margin-bottom: 20px;">تم تغيير كلمة المرور بنجاح</h2>
              <p style="font-size: 18px; margin-bottom: 15px;">مرحباً ${username}،</p>
              <p style="color: #4b5563; line-height: 1.6;">تم تغيير كلمة المرور الخاصة بحسابك في Handys بنجاح.</p>
              <div class="warning-box">
                ⚠️ <strong>تنبيه أمني مهم:</strong> إذا لم تقم بتغيير كلمة المرور، يرجى التواصل مع الدعم الفني فوراً
              </div>
              <p style="color: #6b7280; margin-top: 20px;">إذا قمت بتغيير كلمة المرور بنفسك، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Handys. جميع الحقوق محفوظة.</p>
              <p style="font-size: 10px; margin-top: 8px;">هذا بريد إلكتروني تلقائي، الرجاء عدم الرد عليه.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    console.log(`✅ Password changed confirmation sent to: ${email}`);
    return info;
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return null;
  }
};