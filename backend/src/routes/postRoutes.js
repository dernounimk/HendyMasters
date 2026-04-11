// backend/src/routes/postRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadMultipleImages, handleMulterError } from '../middleware/upload.js';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  deletePostImage,
  savePost,
  sharePost,
  getSavedPosts,
  getConversationsForSharing,
  likePost,
  getLikesCount,
  getUserPosts,
} from '../controllers/postController.js';

const router = express.Router();

// جميع routes تتطلب المصادقة
router.use(protect);

// Routes رئيسية
router.route('/')
  .get(getPosts)
  .post(uploadMultipleImages, handleMulterError, createPost);

// Routes خاصة
router.get('/saved', getSavedPosts);
router.get('/conversations-for-sharing', getConversationsForSharing);

// Routes للبوستات الفردية
router.route('/:id')
  .get(getPostById)
  .put(uploadMultipleImages, handleMulterError, updatePost)
  .delete(deletePost);

// Routes للصور
router.delete('/:id/images/:imageIndex', deletePostImage);

router.post('/:id/like', likePost);
router.get('/:id/likes-count', getLikesCount);

// Routes للحفظ والمشاركة
router.post('/:id/save', savePost);
router.post('/:id/share', sharePost);

// Routes لمستخدم معين
router.get('/user/:userId', getUserPosts);

export default router;