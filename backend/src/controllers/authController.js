import crypto from 'crypto';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendResetCode, sendPasswordChangedEmail } from '../config/emailServices.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبة'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
      });
    }
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    user.passwordChangedAt = Date.now();
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تغيير كلمة المرور'
    });
  }
};

// backend/controllers/authController.js (تحديث الدوال)

export const requestResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      });
    }
    
    console.log(`🔐 Reset code requested for email: ${email}`);
    
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      // لأسباب أمنية، لا نخبر المستخدم أن البريد غير موجود
      return res.status(200).json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رمز التحقق'
      });
    }
    
    // إنشاء رمز جديد باستخدام دالة النموذج
    const code = user.createResetCode();
    await user.save({ validateBeforeSave: false });
    
    console.log(`📧 Reset code for ${user.email}: ${code}`);
    console.log(`⏰ Expires at: ${user.resetCodeExpires}`);
    
    // محاولة إرسال البريد الإلكتروني
    let emailSent = false;
    try {
      await sendResetCode(user.email, user.username, code);
      emailSent = true;
      console.log(`✅ Email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
    }
    
    // ✅ في بيئة التطوير، نرسل الرمز في الرد لتسهيل الاختبار
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
        : 'تم إنشاء رمز التحقق (تحقق من البريد الإلكتروني)',
      ...(isDevelopment && { devCode: code }) // فقط في التطوير
    });
    
  } catch (error) {
    console.error('❌ Request reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في طلب رمز إعادة التعيين'
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    console.log(`🔍 Verifying code for ${email}: ${code}`);
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني والرمز مطلوبان'
      });
    }
    
    const user = await User.findOne({ email, isActive: true }).select('+resetCode +resetCodeExpires');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(200).json({  // استخدام 200 بدلاً من 400 لأسباب أمنية
        success: true,
        valid: false,
        message: 'الرمز غير صالح'
      });
    }
    
    console.log('📊 User resetCode:', user.resetCode);
    console.log('📊 User resetCodeExpires:', user.resetCodeExpires);
    console.log('📊 Current time:', Date.now());
    
    const isValid = user.verifyResetCode(code);
    
    console.log('✅ Is valid:', isValid);
    
    if (!isValid) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'الرمز غير صالح أو منتهي الصلاحية'
      });
    }
    
    res.status(200).json({
      success: true,
      valid: true,
      message: 'الرمز صحيح'
    });
    
  } catch (error) {
    console.error('❌ Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في التحقق من الرمز'
    });
  }
};

export const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني والرمز وكلمة المرور الجديدة مطلوبة'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
    }
    
    const user = await User.findOne({ email, isActive: true }).select('+resetCode +resetCodeExpires +password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    // التحقق من الرمز
    const isValid = user.verifyResetCode(code);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'الرمز غير صالح أو منتهي الصلاحية'
      });
    }
    
    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // تحديث كلمة المرور ومسح الرمز
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.passwordChangedAt = Date.now();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save({ validateBeforeSave: false });
    
    console.log(`✅ Password reset successfully for user: ${user.email}`);
    
    // إرسال بريد تأكيد
    try {
      await sendPasswordChangedEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Reset password with code error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إعادة تعيين كلمة المرور'
    });
  }
};

// ============== دوال المصادقة الأساسية ==============

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير نشط'
      });
    }
    
    // تحديث آخر تسجيل دخول
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });
    
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          isOnline: true,
          stats: user.stats
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, phone, role, location } = req.body;
    
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }, { phone }] 
    });
    
    if (userExists) {
      let message = 'المستخدم موجود بالفعل';
      if (userExists.email === email) message = 'البريد الإلكتروني مسجل بالفعل';
      else if (userExists.username === username) message = 'اسم المستخدم محجوز';
      else if (userExists.phone === phone) message = 'رقم الهاتف مسجل بالفعل';
      
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      role: role || 'client',
      location
    });
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.updateOne(
        { _id: req.user.id },
        {
          $set: {
            isOnline: false,
            lastSeen: new Date()
          }
        }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, phone, bio, location, privacy } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (privacy) user.privacy = { ...user.privacy, ...privacy };
    
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
    
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// ============== دوال إعادة تعيين كلمة المرور بالرابط (اختياري) ==============

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      });
    }
    
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة التعيين'
      });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة التعيين'
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في طلب إعادة تعيين كلمة المرور'
    });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'الرمز غير صالح أو منتهي الصلاحية'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'الرمز صالح',
      email: user.email
    });
    
  } catch (error) {
    console.error('❌ Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في التحقق من الرمز'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'الرمز غير صالح أو منتهي الصلاحية'
      });
    }
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إعادة تعيين كلمة المرور'
    });
  }
};

export default {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  refreshToken,
  requestResetCode,
  verifyResetCode,
  resetPasswordWithCode
};