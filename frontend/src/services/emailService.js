// backend/services/emailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email, username, resetUrl) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'HandyMasters <noreply@handymasters.com>',
      to: email,
      subject: 'إعادة تعيين كلمة المرور - HandyMasters',
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>إعادة تعيين كلمة المرور</title>
          <style>
            body { font-family: 'Tajawal', Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; color: white; }
            .content { padding: 32px; }
            .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; margin: 20px 0; }
            .warning { background: #fef3c7; border-right: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 8px; }
            .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛠️ HandyMasters</h1>
            </div>
            <div class="content">
              <h2>مرحباً ${username}،</h2>
              <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
              </div>
              <div class="warning">
                ⚠️ هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
              </div>
              <p style="font-size: 12px; color: #6b7280;">
                إذا لم تقم بطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
              </p>
              <p style="font-size: 12px;">
                إذا كان الزر لا يعمل، يمكنك نسخ الرابط: <a href="${resetUrl}">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} HandyMasters. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendPasswordChangedEmail = async (email, username) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'HandyMasters <noreply@handymasters.com>',
      to: email,
      subject: 'تم تغيير كلمة المرور - HandyMasters',
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>تم تغيير كلمة المرور</title>
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>مرحباً ${username}،</h2>
            <p>تم تغيير كلمة المرور الخاصة بحسابك في HandyMasters بنجاح.</p>
            <p>إذا لم تقم بذلك، يرجى التواصل مع الدعم الفني فوراً.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} HandyMasters</p>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw error;
  }
};