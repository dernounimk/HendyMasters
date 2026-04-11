// backend/server.js
import dotenv from 'dotenv';
// ✅ تحميل متغيرات البيئة أولاً
dotenv.config();

// ✅ بعد تحميل البيئة، قم بباقي الاستيرادات
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// تعديل المسارات
import connectDB from './src/config/database.js';
import configureSocket from './src/config/socket.js';

// استيراد المسارات
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

// استيراد معالجات الأخطاء
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import { protect, optionalAuth } from './src/middleware/auth.js';

// ✅ التحقق من أن المتغيرات تم تحميلها
console.log('🔧 Environment Check:');
console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ موجود' : '❌ مفقود');
console.log('  - EMAIL_FROM:', process.env.EMAIL_FROM || '❌ مفقود');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ موجود' : '❌ مفقود');
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✅ موجود' : '❌ مفقود');

// ✅ إعداد __dirname للـ ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// الاتصال بقاعدة البيانات
connectDB();

const app = express();
const server = http.createServer(app);

// إعداد Socket.IO
const io = configureSocket(server);
app.set('io', io);

// ✅ تحديد معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  message: {
    success: false,
    message: 'لقد تجاوزت الحد الأقصى من الطلبات، حاول مرة أخرى بعد 15 دقيقة'
  }
});

// ✅ ========== MIDDLEWARE الأساسية ==========

// 1. الأمان والضغط
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cookieParser());

// 2. ✅ خدمة الملفات الثابتة (الأهم لحل مشكلة الصور)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. JSON Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hendymasters.vercel.app',
    'https://hendy-masters-zj2p.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// 5. Rate limiting للمصادقة فقط
app.use('/api/auth', limiter);

// 6. تسجيل الطلبات (للتصحيح)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📦 Body:', req.body);
    }
    if (req.query && Object.keys(req.query).length > 0) {
      console.log('🔍 Query:', req.query);
    }
    next();
  });
}

// ✅ ========== المسارات ==========

// مسارات عامة (لا تحتاج مصادقة)
app.use('/api/auth', authRoutes);

// ✅ مسارات المستخدمين - بعضها عام وبعضها محمي
app.use('/api/users', userRoutes);

// المسارات المحمية
app.use('/api/posts', protect, postRoutes);
app.use('/api/reviews', protect, reviewRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/notifications', notificationRoutes);

// مسار الترحيب
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في HandyMasters API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      reviews: '/api/reviews',
      messages: '/api/messages'
    }
  });
});

// مسار اختبار بسيط
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working correctly',
    query: req.query,
    time: new Date().toISOString()
  });
});

// ✅ معالجة المسارات غير الموجودة
app.use(notFound);

// ✅ معالج الأخطاء المركزي
app.use(errorHandler);

// ✅ تشغيل الخادم
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Test: http://localhost:${PORT}/test`);
  console.log(`🖼️  Static files: http://localhost:${PORT}/uploads`);
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

export default app;