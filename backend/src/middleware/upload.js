// backend/src/middleware/upload.js
import multer from 'multer';
import path from 'path';

// استخدام memory storage للوصول إلى buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('يسمح فقط بملفات الصور (jpeg, jpg, png, gif, webp)'));
  }
};

// إعداد multer للصور المتعددة
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// دوال مختلفة لأنواع الرفع
export const uploadMultipleImages = upload.array('images', 10);
export const uploadSingleImage = upload.single('images');
export const uploadAvatar = upload.single('avatar'); // ✅ إضافة هذه الدالة للصورة الشخصية

// معالجة أخطاء multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الصورة كبير جداً. الحد الأقصى 5MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};