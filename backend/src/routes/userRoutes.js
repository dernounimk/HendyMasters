// backend/src/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadAvatar, handleMulterError } from '../middleware/upload.js';
import {
  getUsers,
  getUserProfile,
  getCurrentUser,
  getUserById,
  getUserPosts,
  getUserReviews,
  getUserStats,
  savePost,
  getSavedPosts,
  uploadAvatar as uploadAvatarController,
  removeAvatar,
  updateProfile
} from '../controllers/userController.js';

// استيراد دوال الحظر من blockController
import { 
  blockUser, 
  unblockUser, 
  getBlockedUsers 
} from '../controllers/blockController.js';

const router = express.Router();

// ✅ المسارات العامة (لا تحتاج مصادقة)
router.get('/profile/:username', getUserProfile);

// ✅ جميع المسارات التالية تحتاج مصادقة
router.use(protect);

// ✅ مسارات الحظر (يجب أن تكون قبل المسارات ذات المعاملات)
router.get('/blocks', getBlockedUsers);
router.post('/block/:userId', blockUser);
router.delete('/block/:userId', unblockUser);

// ✅ مسارات أخرى
router.get('/me', getCurrentUser);
router.get('/saved-posts', getSavedPosts);

// ✅ مسارات الإجراءات
router.post('/save-post/:postId', savePost);
router.post('/upload-avatar', uploadAvatar, handleMulterError, uploadAvatarController);
router.delete('/remove-avatar', removeAvatar);
router.put('/profile', updateProfile);

// ✅ مسارات جلب البيانات - يجب أن تأتي بعد المسارات الثابتة
router.get('/', getUsers);
router.get('/:userId/posts', getUserPosts);
router.get('/:userId/reviews', getUserReviews);
router.get('/:userId/stats', getUserStats);
router.get('/:id', getUserById);

export default router;