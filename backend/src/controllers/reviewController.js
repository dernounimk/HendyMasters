import Review from '../models/Review.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

// @desc    إنشاء تقييم جديد
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const {
      reviewedUserId,
      rating,
      comment,
      subRatings,
      referenceType,
      referenceId,
      workImages
    } = req.body;

    // التحقق من عدم تقييم النفس
    if (reviewedUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تقييم نفسك'
      });
    }

    // التحقق من وجود المستخدم المراد تقييمه
    const reviewedUser = await User.findById(reviewedUserId);
    if (!reviewedUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من عدم وجود تقييم مكرر
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      reviewedUser: reviewedUserId,
      'reference.id': referenceId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بتقييم هذا المستخدم بالفعل'
      });
    }

    // إنشاء التقييم
    const review = await Review.create({
      reviewer: req.user.id,
      reviewedUser: reviewedUserId,
      rating,
      comment,
      subRatings,
      reference: {
        type: referenceType,
        id: referenceId
      },
      workImages: workImages || []
    });

    // تحديث تقييم المستخدم
    await updateUserRating(reviewedUserId);

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'username profileImage')
      .populate('reviewedUser', 'username profileImage role');

    res.status(201).json({
      success: true,
      data: populatedReview
    });

  } catch (error) {
    next(error);
  }
};

// @desc    الرد على تقييم
// @route   PUT /api/reviews/:id/reply
// @access  Private (Owner of reviewed user only)
export const replyToReview = async (req, res, next) => {
  try {
    const { content } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }

    // التحقق من أن المستخدم هو صاحب التقييم
    if (review.reviewedUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للرد على هذا التقييم'
      });
    }

    review.reply = {
      content,
      repliedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    next(error);
  }
};

// @desc    الإبلاغ عن تقييم
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }

    review.reported = {
      isReported: true,
      reason,
      reportedBy: req.user.id
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'تم الإبلاغ عن التقييم'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    تحديث تقييم
// @route   PUT /api/reviews/:id
// @access  Private (Reviewer only)
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment, subRatings } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }

    // التحقق من أن المستخدم هو صاحب التقييم
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذا التقييم'
      });
    }

    // منع التعديل بعد فترة (مثلاً 7 أيام)
    const daysSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 7) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل التقييم بعد 7 أيام من إنشائه'
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.subRatings = subRatings || review.subRatings;

    await review.save();

    // تحديث تقييم المستخدم
    await updateUserRating(review.reviewedUser);

    res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    next(error);
  }
};

// @desc    حذف تقييم
// @route   DELETE /api/reviews/:id
// @access  Private (Reviewer or Admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }

    // التحقق من الصلاحية
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذا التقييم'
      });
    }

    await review.deleteOne();

    // تحديث تقييم المستخدم
    await updateUserRating(review.reviewedUser);

    res.status(200).json({
      success: true,
      message: 'تم حذف التقييم بنجاح'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على تقييمات المستخدم
// @route   GET /api/reviews/user/:userId
// @access  Private
export const getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate('reviewer', 'username profileImage')
      .populate('reference.id')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ reviewedUser: req.params.userId });

    // إحصائيات التقييمات
    const stats = await Review.aggregate([
      { $match: { reviewedUser: req.params.userId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          distribution: {
            $push: '$rating'
          },
          avgProfessionalism: { $avg: '$subRatings.professionalism' },
          avgQuality: { $avg: '$subRatings.quality' },
          avgCommunication: { $avg: '$subRatings.communication' },
          avgPunctuality: { $avg: '$subRatings.punctuality' },
          avgPrice: { $avg: '$subRatings.price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        distribution: []
      },
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// دالة مساعدة لتحديث تقييم المستخدم
const updateUserRating = async (userId) => {
  const stats = await Review.aggregate([
    { $match: { reviewedUser: userId } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  await User.findByIdAndUpdate(userId, {
    'ratings.average': stats[0]?.average || 0,
    'ratings.count': stats[0]?.count || 0
  });
};