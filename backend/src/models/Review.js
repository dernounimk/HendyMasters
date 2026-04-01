// backend/src/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ reviewedUser: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, reviewedUser: 1 }, { unique: true });

// ✅ التصدير الصحيح
const Review = mongoose.model('Review', reviewSchema);
export default Review;