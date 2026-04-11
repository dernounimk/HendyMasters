// backend/src/controllers/reviewController.js
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// دالة إنشاء إشعار
const createNotification = async (notificationData, req) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    
    const io = req?.app?.get('io');
    if (io && notificationData.recipient) {
      io.to(notificationData.recipient.toString()).emit('notification:new', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// @desc    إنشاء تقييم جديد
export const createReview = async (req, res) => {
  try {
    const { reviewedUserId, rating, comment } = req.body;
    const reviewerId = req.user.id;
    
    console.log('📝 Creating review:', { reviewerId, reviewedUserId, rating, comment });
    
    if (reviewerId === reviewedUserId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تقييم نفسك'
      });
    }
    
    const reviewedUser = await User.findById(reviewedUserId);
    if (!reviewedUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      reviewedUser: reviewedUserId
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بتقييم هذا المستخدم بالفعل'
      });
    }
    
    const review = await Review.create({
      reviewer: reviewerId,
      reviewedUser: reviewedUserId,
      rating,
      comment: comment.trim()
    });
    
    console.log('✅ Review created:', review._id);
    
    const reviewer = await User.findById(reviewerId).select('username profileImage');
    
    await createNotification({
      recipient: reviewedUserId,
      sender: reviewerId,
      type: 'review',
      title: 'تقييم جديد ⭐',
      message: `${reviewer.username} قيمك بـ ${rating}/5 نجوم`,
      relatedId: review._id,
      relatedModel: 'Review',
      metadata: { rating, comment: comment?.substring(0, 100) }
    }, req);
    
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'username profileImage')
      .populate('reviewedUser', 'username profileImage');
    
    res.status(201).json({
      success: true,
      data: populatedReview,
      message: 'تم إضافة التقييم بنجاح'
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في إنشاء التقييم'
    });
  }
};

// @desc    جلب تقييمات مستخدم
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ reviewedUser: userId })
      .populate('reviewer', 'username profileImage role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ reviewedUser: userId });
    
    const stats = await Review.aggregate([
      { $match: { reviewedUser: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
          ratings: { $push: '$rating' }
        }
      }
    ]);
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (stats.length > 0 && stats[0].ratings) {
      stats[0].ratings.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + reviews.length < total
      },
      stats: {
        average: stats.length > 0 ? parseFloat(stats[0].average.toFixed(1)) : 0,
        count: total,
        distribution: ratingDistribution
      }
    });
    
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في جلب التقييمات'
    });
  }
};

// @desc    تحديث تقييم
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا التقييم'
      });
    }
    
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    await review.save();
    
    const updatedReview = await Review.findById(id)
      .populate('reviewer', 'username profileImage')
      .populate('reviewedUser', 'username profileImage');
    
    res.json({
      success: true,
      data: updatedReview,
      message: 'تم تحديث التقييم بنجاح'
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في تحديث التقييم'
    });
  }
};

// @desc    حذف تقييم
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا التقييم'
      });
    }
    
    await review.deleteOne();
    
    res.json({
      success: true,
      message: 'تم حذف التقييم بنجاح'
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في حذف التقييم'
    });
  }
};