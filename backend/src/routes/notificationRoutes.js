// backend/src/routes/notificationRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

// جميع routes تتطلب المصادقة
router.use(protect);

// جلب الإشعارات
router.get('/', getNotifications);

// جلب عدد الإشعارات غير المقروءة
router.get('/unread-count', getUnreadCount);

// تعليم كل الإشعارات كمقروءة
router.put('/read-all', markAllAsRead);

// تعليم إشعار كمقروء
router.put('/:id/read', markAsRead);

// حذف إشعار
router.delete('/:id', deleteNotification);

export default router;