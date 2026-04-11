// backend/src/routes/reviewRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createReview,
  getUserReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// مسارات عامة (يمكن لأي شخص رؤية التقييمات)
router.get('/user/:userId', getUserReviews);

// المسارات المحمية (تتطلب تسجيل دخول)
router.use(protect);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;