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
  submitProposal,
  selectProposal,
  completeWork,
  addRating,
  getRatings,
  updateProposalStatus,
  getProposalsCount,
  getProposals,
  savePost,
  sharePost,
  getSavedPosts,
  getConversationsForSharing,
  likePost,
  getLikesCount,
  getUserPosts,
  getUserCompletedJobs
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

// Routes للعروض - المحسنة
router.get('/:id/proposals-count', getProposalsCount);
router.get('/:id/proposals', getProposals);
router.post('/:id/proposals', submitProposal);
router.put('/:id/proposals/:proposalId/select', selectProposal);
router.put('/:id/proposals/:proposalId/:action', updateProposalStatus);

// Routes للعمل والتقييم
router.put('/:id/complete', completeWork);
router.get('/:id/ratings', getRatings);
router.post('/:id/ratings', addRating);

router.post('/:id/like', likePost);
router.get('/:id/likes-count', getLikesCount);

// Routes للحفظ والمشاركة
router.post('/:id/save', savePost);
router.post('/:id/share', sharePost);

// Routes لمستخدم معين
router.get('/user/:userId', getUserPosts);
router.get('/user/:userId/completed-jobs', getUserCompletedJobs);

export default router;