// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// حماية المسارات - التحقق من وجود توكن صالح
export const protect = async (req, res, next) => {
  try {
    let token;

    // التحقق من وجود التوكن في الهيدر
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // البحث عن المستخدم
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // التحقق من نشاط الحساب
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // إضافة المستخدم إلى الطلب
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

// ✅ مصادقة اختيارية - لا تمنع الوصول إذا لم يكن هناك توكن
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('-password');
          
          if (user && user.isActive) {
            req.user = user;
          }
        } catch (tokenError) {
          // إذا فشل التحقق من التوكن، نكمل بدون مستخدم
          console.log('Token verification failed, continuing as guest');
        }
      }
    }
    
    // ✅ نكمل حتى لو لم يكن هناك مستخدم (مهم جداً!)
    next();
    
  } catch (error) {
    // إذا حدث خطأ غير متوقع، نكمل بدون مستخدم
    console.log('Optional auth error, continuing as guest:', error.message);
    next();
  }
};

// تقييد الوصول حسب الدور
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// التحقق من ملكية المورد
export const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;

      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      if (resource.user?.toString() !== userId && 
          resource.author?.toString() !== userId && 
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action'
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      next(error);
    }
  };
};

// تحديث آخر نشاط للمستخدم
export const updateLastActive = async (req, res, next) => {
  if (req.user) {
    req.user.lastSeen = new Date();
    await req.user.save({ validateBeforeSave: false });
  }
  next();
};