// backend/routes/chatRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  getMessages,
  createConversation,
  markAsRead,
  deleteConversation
} from '../controllers/chatController.js';

const router = express.Router();

router.use(protect); // كل مسارات الشات محمية

router.route('/conversations')
  .get(getConversations)
  .post(createConversation);

router.route('/conversations/:id/messages')
  .get(getMessages);

router.route('/conversations/:id/read')
  .put(markAsRead);

router.route('/conversations/:id')
  .delete(deleteConversation);

export default router;