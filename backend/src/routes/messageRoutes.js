// backend/src/routes/messageRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  getMessages,
  getUnreadCount,
  markMessagesAsRead,
  startConversation,
  checkMessagingPermission,
  getAllowedRecipients,
  deleteConversation
} from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);

// جلب جميع المحادثات
router.get('/conversations', getConversations);

// جلب عدد الرسائل غير المقروءة
router.get('/unread-count', getUnreadCount);

// إنشاء محادثة جديدة
router.post('/conversations', startConversation);

// التحقق من إمكانية التواصل مع مستخدم
router.get('/check/:userId', checkMessagingPermission);

// الحصول على المستخدمين المسموح بالتواصل معهم
router.get('/allowed-recipients', getAllowedRecipients);

// جلب رسائل محادثة محددة
router.get('/conversations/:id/messages', getMessages);

// تعليم الرسائل كمقروءة
router.put('/conversations/:id/read', markMessagesAsRead);

router.delete('/conversations/:id', deleteConversation);

export default router;