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
  blockUser,
  unblockUser,
  getBlockedUsers,
  savePost,
  getSavedPosts,
  uploadAvatar as uploadAvatarController,
  removeAvatar,
  updateProfile
} from '../controllers/userController.js';

const router = express.Router();

// ✅ المسارات العامة (لا تحتاج مصادقة)
router.get('/profile/:username', getUserProfile);

// ✅ جميع المسارات التالية تحتاج مصادقة
router.use(protect);

// ✅ المسارات الأكثر تحديداً أولاً
router.get('/me', getCurrentUser);
router.get('/saved-posts', getSavedPosts);

// ✅ مسارات الإجراءات
router.post('/save-post/:postId', savePost);
router.post('/upload-avatar', uploadAvatar, handleMulterError, uploadAvatarController);
router.delete('/remove-avatar', removeAvatar);
router.put('/profile', updateProfile);

// ✅ مسارات جلب البيانات - معامل ID يجب أن يكون آخر شيء
router.get('/', getUsers);
router.get('/:userId/posts', getUserPosts);
router.get('/:userId/reviews', getUserReviews);
router.get('/:userId/stats', getUserStats);
router.get('/:id', getUserById);
router.post('/block/:userId', protect, blockUser);
router.delete('/block/:userId', protect, unblockUser);
router.get('/blocks', protect, getBlockedUsers);

export default router;