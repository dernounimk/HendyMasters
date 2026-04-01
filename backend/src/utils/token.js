import jwt from 'jsonwebtoken';

// إنشاء توكن جديد
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// إنشاء توكن التحديث
export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

// إرسال التوكن في الكوكيز
export const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // خيارات الكوكيز للتوكن الرئيسي
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // خيارات الكوكيز لتوكن التحديث (مدة أطول)
  const refreshCookieOptions = {
    ...cookieOptions,
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 يوم
    )
  };

  // إزالة كلمة المرور من الاستجابة
  user.password = undefined;

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json({
      success: true,
      token,
      refreshToken,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          ratings: user.ratings,
          artisanInfo: user.artisanInfo,
          workerInfo: user.workerInfo,
          isOnline: user.isOnline
        }
      }
    });
};