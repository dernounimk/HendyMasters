// backend/src/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // المستخدم الذي قام بالتقييم
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // المستخدم الذي يتم تقييمه
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // عدد النجوم (1-5)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // نص التقييم
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // تاريخ التقييم
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// منع تكرار التقييم من نفس المستخدم لنفس المستخدم
reviewSchema.index({ reviewer: 1, reviewedUser: 1 }, { unique: true });

// تحديث إحصائيات المستخدم بعد حفظ التقييم
reviewSchema.post('save', async function() {
  const User = mongoose.model('User');
  const reviews = await mongoose.model('Review').find({ reviewedUser: this.reviewedUser });
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  await User.findByIdAndUpdate(this.reviewedUser, {
    'stats.rating': averageRating,
    'stats.totalRatings': reviews.length
  });
});

// تحديث إحصائيات المستخدم بعد حذف التقييم
reviewSchema.post('remove', async function() {
  const User = mongoose.model('User');
  const reviews = await mongoose.model('Review').find({ reviewedUser: this.reviewedUser });
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  await User.findByIdAndUpdate(this.reviewedUser, {
    'stats.rating': averageRating,
    'stats.totalRatings': reviews.length
  });
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;