// backend/src/middleware/upload.js
import multer from 'multer';
import path from 'path';

// تكوين التخزين المؤقت في الذاكرة
const storage = multer.memoryStorage();

// فلتر الملفات - قبول الصور فقط
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى رفع صور بصيغة JPG, PNG, GIF أو WebP'), false);
  }
};

// إعداد multer لرفع صور متعددة
export const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // 5 صور كحد أقصى
  },
  fileFilter: fileFilter
}).array('images', 5);

// إعداد multer لرفع صورة واحدة
export const uploadSingleImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('image');

// Middleware لرفع صورة الملف الشخصي
export const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('avatar');

// معالج أخطاء multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات كبير جداً. الحد الأقصى 5 صور'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err.message === 'نوع الملف غير مدعوم. يرجى رفع صور بصيغة JPG, PNG, GIF أو WebP') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};