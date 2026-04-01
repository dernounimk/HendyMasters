// backend/controllers/userController.js
import User from '../models/User.js';
import Post from '../models/Post.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';
import { cloudinary, uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import Block from '../models/Block.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    حظر مستخدم
// @route   POST /api/users/block/:userId
// @access  Private
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;

    if (blockerId === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'لا يمكنك حظر نفسك' 
      });
    }

    // التحقق من وجود الحظر مسبقاً
    const existingBlock = await Block.findOne({ 
      blocker: blockerId, 
      blocked: userId 
    });
    
    if (existingBlock) {
      return res.status(400).json({ 
        success: false, 
        message: 'المستخدم محظور بالفعل' 
      });
    }

    // إنشاء سجل الحظر
    await Block.create({ blocker: blockerId, blocked: userId });

    // حذف المحادثة بين المستخدمين
    const conversation = await Conversation.findOne({
      participants: { $all: [blockerId, userId], $size: 2 }
    });

    if (conversation) {
      // حذف جميع الرسائل
      await Message.deleteMany({ conversation: conversation._id });
      // حذف المحادثة
      await conversation.deleteOne();
    }

    res.json({ 
      success: true, 
      message: 'تم حظر المستخدم بنجاح' 
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء حظر المستخدم' 
    });
  }
};

// @desc    إلغاء حظر مستخدم
// @route   DELETE /api/users/block/:userId
// @access  Private
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;

    const result = await Block.findOneAndDelete({ 
      blocker: blockerId, 
      blocked: userId 
    });
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'المستخدم غير محظور' 
      });
    }

    res.json({ 
      success: true, 
      message: 'تم إلغاء حظر المستخدم' 
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء إلغاء الحظر' 
    });
  }
};

// @desc    جلب قائمة المستخدمين المحظورين
// @route   GET /api/users/blocks
// @access  Private
export const getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user.id })
      .populate('blocked', 'username profileImage role');
    
    const blockedUsers = blocks.map(block => block.blocked);
    
    res.json({ 
      success: true, 
      data: blockedUsers 
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في جلب المحظورين' 
    });
  }
};

// @desc    الحصول على جميع المستخدمين
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const { 
      role, 
      search, 
      city, 
      craft,
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = { isActive: true };

    if (role) filter.role = role;
    if (city) filter.location = city;

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { 'professionalInfo.craft': { $regex: search, $options: 'i' } },
        { 'professionalInfo.skills': { $regex: search, $options: 'i' } }
      ];
    }

    if (craft) {
      filter['professionalInfo.craft'] = craft;
    }

    const users = await User.find(filter)
      .select('username profileImage role professionalInfo location isOnline lastSeen')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in getUsers:', error);
    next(error);
  }
};

// @desc    الحصول على المستخدم الحالي
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    console.log('🔍 Fetching current user with ID:', req.user.id);
    
    const user = await User.findById(req.user.id)
      .select('-password -loginAttempts -lockUntil -passwordChangedAt -passwordResetToken -passwordResetExpires')
      .populate({
        path: 'savedPosts',
        select: 'title content images createdAt',
        populate: {
          path: 'author',
          select: 'username profileImage'
        }
      });

    if (!user) {
      console.log('❌ User not found with ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    console.log('✅ User found:', user.username);

    // جلب إحصائيات إضافية
    const postsCount = await Post.countDocuments({ author: user._id });
    const reviewsCount = await Review.countDocuments({ reviewedUser: user._id });
    
    // جلب المشاريع المكتملة مع التقييمات
    let completedJobs = [];
    let jobsStats = { total: 0, averageRating: 0 };
    
    try {
      if (mongoose.models.Job) {
        completedJobs = await mongoose.model('Job').find({
          $or: [
            { artisan: user._id, status: 'completed' },
            { worker: user._id, status: 'completed' }
          ]
        })
        .populate('client', 'username profileImage')
        .populate({
          path: 'review',
          populate: {
            path: 'reviewer',
            select: 'username profileImage'
          }
        })
        .sort({ completedAt: -1 })
        .limit(5);

        // حساب متوسط التقييم من المشاريع
        const ratingStats = await mongoose.model('Job').aggregate([
          { 
            $match: { 
              $or: [
                { artisan: user._id, status: 'completed' },
                { worker: user._id, status: 'completed' }
              ],
              rating: { $exists: true, $ne: null }
            } 
          },
          {
            $group: {
              _id: null,
              average: { $avg: '$rating' },
              count: { $sum: 1 }
            }
          }
        ]);

        if (ratingStats.length > 0) {
          jobsStats.averageRating = ratingStats[0].average;
          jobsStats.total = ratingStats[0].count;
        }
      }
    } catch (jobError) {
      console.log('Job model not available:', jobError);
    }

    // جلب التقييمات مع تفاصيل المراجعين
    const recentReviews = await Review.find({ reviewedUser: user._id })
      .populate('reviewer', 'username profileImage role')
      .populate('job', 'title budget')
      .sort({ createdAt: -1 })
      .limit(5);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.privacy?.showEmail ? user.email : undefined,
      phone: user.privacy?.showPhone ? user.phone : undefined,
      profileImage: user.profileImage || '/uploads/profiles/default-avatar.png',
      bio: user.bio || '',
      role: user.role || 'client',
      location: user.privacy?.showLocation ? user.location : undefined,
      stats: {
        postsCount: postsCount || 0,
        reviewsCount: reviewsCount || 0,
        rating: user.stats?.rating || jobsStats.averageRating || 0,
        totalRatings: user.stats?.totalRatings || jobsStats.total || 0,
        completedJobs: completedJobs.length || 0
      },
      professionalInfo: user.professionalInfo || {},
      isOnline: user.privacy?.showOnlineStatus ? user.isOnline : false,
      lastSeen: user.privacy?.showOnlineStatus ? user.lastSeen : null,
      createdAt: user.createdAt,
      privacy: user.privacy || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showOnlineStatus: true
      },
      savedPosts: user.savedPosts || [],
      recentJobs: completedJobs,
      recentReviews: recentReviews
    };

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    الحصول على ملف شخصي باسم المستخدم
// @route   GET /api/users/profile/:username
// @access  Public/Optional Auth
export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    console.log(`🔍 Searching for user with username: ${username}`);
    
    const user = await User.findOne({ username, isActive: true })
      .select('-password -loginAttempts -lockUntil -passwordChangedAt -passwordResetToken -passwordResetExpires');

    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    console.log(`✅ User found: ${user._id}`);

    // إحصائيات إضافية
    const postsCount = await Post.countDocuments({ author: user._id });
    const reviewsCount = await Review.countDocuments({ reviewedUser: user._id });
    
    // حساب التقييم من المشاريع والتقييمات
    let totalRating = 0;
    let totalCount = 0;
    
    // التقييمات المباشرة
    const reviewStats = await Review.aggregate([
      { $match: { reviewedUser: user._id } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    if (reviewStats && reviewStats.length > 0) {
      totalRating += reviewStats[0].average * reviewStats[0].count;
      totalCount += reviewStats[0].count;
    }

    // التقييم من المشاريع
    let completedJobs = [];
    let jobsWithRating = 0;
    
    try {
      if (mongoose.models.Job) {
        completedJobs = await mongoose.model('Job').find({
          $or: [
            { artisan: user._id, status: 'completed' },
            { worker: user._id, status: 'completed' }
          ]
        })
        .populate('client', 'username profileImage')
        .populate({
          path: 'review',
          populate: {
            path: 'reviewer',
            select: 'username profileImage'
          }
        })
        .sort({ completedAt: -1 })
        .limit(20);

        const jobRatingStats = await mongoose.model('Job').aggregate([
          { 
            $match: { 
              $or: [
                { artisan: user._id, status: 'completed' },
                { worker: user._id, status: 'completed' }
              ],
              rating: { $exists: true, $ne: null }
            } 
          },
          {
            $group: {
              _id: null,
              average: { $avg: '$rating' },
              count: { $sum: 1 }
            }
          }
        ]);

        if (jobRatingStats.length > 0) {
          totalRating += jobRatingStats[0].average * jobRatingStats[0].count;
          totalCount += jobRatingStats[0].count;
          jobsWithRating = jobRatingStats[0].count;
        }
      }
    } catch (jobError) {
      console.log('Job model not available:', jobError);
    }

    const finalRating = totalCount > 0 ? totalRating / totalCount : 0;

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.privacy?.showEmail ? user.email : undefined,
      phone: user.privacy?.showPhone ? user.phone : undefined,
      profileImage: user.profileImage || '/uploads/profiles/default-avatar.png',
      bio: user.bio || '',
      role: user.role || 'client',
      location: user.privacy?.showLocation ? user.location : undefined,
      stats: {
        postsCount: postsCount || 0,
        reviewsCount: reviewsCount || 0,
        rating: Number(finalRating).toFixed(1),
        totalRatings: totalCount || 0,
        completedJobs: completedJobs.length || 0
      },
      professionalInfo: user.professionalInfo || {},
      isOnline: user.privacy?.showOnlineStatus ? user.isOnline : false,
      lastSeen: user.privacy?.showOnlineStatus ? user.lastSeen : null,
      createdAt: user.createdAt,
      privacy: user.privacy || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showOnlineStatus: true
      },
      recentJobs: completedJobs.slice(0, 5) // آخر 5 مشاريع
    };

    console.log(`✅ Sending profile data for ${username}`);

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('❌ Error in getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    الحصول على مستخدم بالمعرف (ID)
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (id === 'me') {
      return getCurrentUser(req, res, next);
    }
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح'
      });
    }
    
    const user = await User.findById(id)
      .select('-password -loginAttempts -lockUntil -passwordChangedAt -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const postsCount = await Post.countDocuments({ author: user._id });
    const reviewsCount = await Review.countDocuments({ reviewedUser: user._id });
    
    let completedJobs = 0;
    try {
      if (mongoose.models.Job) {
        completedJobs = await mongoose.model('Job').countDocuments({
          $or: [
            { artisan: user._id, status: 'completed' },
            { worker: user._id, status: 'completed' }
          ]
        });
      }
    } catch (jobError) {
      console.log('Job model not available, skipping job count');
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.privacy?.showEmail ? user.email : undefined,
      phone: user.privacy?.showPhone ? user.phone : undefined,
      profileImage: user.profileImage || '/uploads/profiles/default-avatar.png',
      bio: user.bio || '',
      role: user.role || 'client',
      location: user.privacy?.showLocation ? user.location : undefined,
      stats: {
        postsCount: postsCount || 0,
        reviewsCount: reviewsCount || 0,
        completedJobs: completedJobs || 0
      },
      professionalInfo: user.professionalInfo || {},
      isOnline: user.privacy?.showOnlineStatus ? user.isOnline : false,
      lastSeen: user.privacy?.showOnlineStatus ? user.lastSeen : null,
      createdAt: user.createdAt,
      privacy: user.privacy || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showOnlineStatus: true
      }
    };

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Error in getUserById:', error);
    next(error);
  }
};




// @desc    حفظ منشور
// @route   POST /api/users/save-post/:postId
// @access  Private
export const savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'المنشور غير موجود'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user.savedPosts) {
      user.savedPosts = [];
    }
    
    const isSaved = user.savedPosts.includes(post._id);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
    } else {
      user.savedPosts.push(post._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isSaved ? 'تمت إزالة المنشور من المحفوظات' : 'تم حفظ المنشور',
      isSaved: !isSaved
    });

  } catch (error) {
    console.error('Error in savePost:', error);
    next(error);
  }
};

// @desc    الحصول على المنشورات المحفوظة
// @route   GET /api/users/saved-posts
// @access  Private
export const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'author',
          select: 'username profileImage role'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: user.savedPosts || []
    });

  } catch (error) {
    console.error('Error in getSavedPosts:', error);
    next(error);
  }
};

// @desc    تحديث الملف الشخصي
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    console.log('Updating profile for user:', req.user.id);
    console.log('Update data:', req.body);

    const {
      email,
      phone,
      bio,
      location,
      professionalInfo,
      privacy
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // تحديث الحقول المسموح بها فقط
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    
    // تحديث الموقع - تأكد من أنه نص
    if (location !== undefined) {
      user.location = location || '';
    }

    // تحديث المعلومات المهنية
    if (professionalInfo && user.role !== 'client') {
      user.professionalInfo = {
        ...user.professionalInfo,
        craft: professionalInfo.craft || user.professionalInfo?.craft,
        experience: professionalInfo.experience || user.professionalInfo?.experience,
        dailyRate: professionalInfo.dailyRate || user.professionalInfo?.dailyRate,
        skills: professionalInfo.skills || user.professionalInfo?.skills || []
      };
    }

    // تحديث إعدادات الخصوصية
    if (privacy) {
      user.privacy = {
        showEmail: privacy.showEmail !== undefined ? privacy.showEmail : user.privacy?.showEmail,
        showPhone: privacy.showPhone !== undefined ? privacy.showPhone : user.privacy?.showPhone,
        showLocation: privacy.showLocation !== undefined ? privacy.showLocation : user.privacy?.showLocation,
        showOnlineStatus: privacy.showOnlineStatus !== undefined ? privacy.showOnlineStatus : user.privacy?.showOnlineStatus
      };
    }

    await user.save();

    // جلب المستخدم المحدث بدون الحقول الحساسة
    const updatedUser = await User.findById(user._id)
      .select('-password -loginAttempts -lockUntil -passwordChangedAt -passwordResetToken -passwordResetExpires');

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث الملف الشخصي',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    console.log('📸 Uploading avatar for user:', req.user.id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء اختيار صورة'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // حذف الصورة القديمة من Cloudinary إذا وجدت
    if (user.profileImagePublicId) {
      await deleteFromCloudinary(user.profileImagePublicId);
      console.log('✅ Old image deleted from Cloudinary:', user.profileImagePublicId);
    }

    // رفع الصورة الجديدة إلى Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'handymasters/avatars',
      public_id: `avatar-${req.user.id}-${Date.now()}`,
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('✅ Cloudinary upload result:', {
      public_id: result.public_id,
      secure_url: result.secure_url
    });

    // تحديث المستخدم
    user.profileImage = result.secure_url;
    user.profileImagePublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الصورة الشخصية بنجاح',
      data: {
        profileImage: result.secure_url
      }
    });

  } catch (error) {
    console.error('❌ Error in uploadAvatar:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في رفع الصورة: ' + error.message
    });
  }
};

// @desc    إزالة الصورة الشخصية
// @route   DELETE /api/users/remove-avatar
// @access  Private
export const removeAvatar = async (req, res, next) => {
  try {
    console.log('🗑️ Removing avatar for user:', req.user.id);

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // حذف الصورة من Cloudinary إذا وجدت
    if (user.profileImagePublicId) {
      await deleteFromCloudinary(user.profileImagePublicId);
      console.log('✅ Image deleted from Cloudinary:', user.profileImagePublicId);
    }
    
    // تعيين الصورة الافتراضية
    const defaultImageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/default-avatar.png`;
    user.profileImage = defaultImageUrl;
    user.profileImagePublicId = null;
    await user.save();

    console.log('✅ Avatar removed successfully, set to default');

    res.status(200).json({
      success: true,
      message: 'تم إزالة الصورة الشخصية بنجاح',
      data: {
        profileImage: defaultImageUrl
      }
    });

  } catch (error) {
    console.error('❌ Error in removeAvatar:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إزالة الصورة'
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log(`📨 Fetching posts for user: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم مطلوب'
      });
    }
    
    // التحقق من صحة ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('author', 'username profileImage role');
    
    console.log(`✅ Found ${posts.length} posts for user ${user.username}`);
    
    res.json({
      success: true,
      data: posts,
      hasMore: posts.length === parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    const posts = await Post.find({
      'ratings.reviewee': userId
    })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('author', 'username profileImage')
      .populate('ratings.reviewer', 'username profileImage');
    
    const reviews = [];
    posts.forEach(post => {
      post.ratings.forEach(rating => {
        if (rating.reviewee.toString() === userId) {
          reviews.push({
            _id: rating._id,
            reviewer: rating.reviewer,
            rating: rating.rating,
            comment: rating.comment,
            createdAt: rating.createdAt,
            post: {
              _id: post._id,
              title: post.title,
              type: post.type
            }
          });
        }
      });
    });
    
    const stats = {
      average: user.stats.rating || 0,
      count: user.stats.totalRatings || 0
    };
    
    res.json({
      success: true,
      data: reviews.slice(0, parseInt(limit)),
      stats,
      hasMore: reviews.length > parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📊 Fetching stats for user: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم مطلوب'
      });
    }
    
    // التحقق من صحة ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح'
      });
    }
    
    const user = await User.findById(userId).select('stats');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    // حساب عدد البوستات
    const postsCount = await Post.countDocuments({ author: userId });
    
    res.json({
      success: true,
      data: {
        rating: user.stats?.rating || 0,
        completedJobs: user.stats?.completedJobsCount || 0,
        totalRatings: user.stats?.totalRatings || 0,
        postsCount: postsCount || user.stats?.postsCount || 0,
        totalEarnings: user.stats?.totalEarnings || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
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
  uploadAvatar,
  removeAvatar,
  updateProfile
};