import express from 'express';
import {
  createReview,
  replyToReview,
  reportReview,
  updateReview,
  deleteReview,
  getUserReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// جميع المسارات محمية
router.use(protect);

router.post('/', createReview);
router.get('/user/:userId', getUserReviews);
router.put('/:id', updateReview);
router.put('/:id/reply', replyToReview);
router.post('/:id/report', reportReview);
router.delete('/:id', deleteReview);

export default router;