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
    const blockerId = req.user.id;
    
    console.log(`🔍 Fetching blocked users for: ${blockerId}`);
    
    const blocks = await Block.find({ blocker: blockerId })
      .populate('blocked', 'username profileImage role email');
    
    console.log(`📋 Found ${blocks.length} blocked users`);
    
    const blockedUsers = blocks.map(block => ({
      _id: block.blocked._id,
      username: block.blocked.username,
      profileImage: block.blocked.profileImage,
      role: block.blocked.role,
      email: block.blocked.email,
      blockedAt: block.createdAt
    }));
    
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

// @desc    الحصول على جميع المستخدمين (للبحث والاقتراحات)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    
    const { 
      role, 
      search, 
      city, 
      craft,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // جلب قائمة المستخدمين المحظورين
    const blockedUsers = await Block.find({ blocker: currentUserId }).select('blocked');
    const blockedUserIds = blockedUsers.map(block => block.blocked.toString());

    const filter = { 
      isActive: true,
      _id: { $nin: [currentUserId, ...blockedUserIds] }
    };

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
      .select('-password -loginAttempts -lockUntil -passwordChangedAt -passwordResetToken -passwordResetExpires');

    if (!user) {
      console.log('❌ User not found with ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    console.log('✅ User found:', user.username);

    // جلب savedPosts بشكل منفصل وآمن
    let savedPostsData = [];
    if (user.savedPosts && user.savedPosts.length > 0) {
      try {
        savedPostsData = await Post.find({ _id: { $in: user.savedPosts } })
          .select('title content images createdAt')
          .populate('author', 'username profileImage')
          .lean();
      } catch (err) {
        console.log('⚠️ Could not fetch saved posts:', err.message);
      }
    }

    // جلب إحصائيات إضافية
    const postsCount = await Post.countDocuments({ author: user._id });
    const reviewsCount = await Review.countDocuments({ reviewedUser: user._id });
    
    // حساب التقييم من التقييمات فقط
    let averageRating = 0;
    let totalRatings = 0;
    
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
      averageRating = reviewStats[0].average;
      totalRatings = reviewStats[0].count;
    }

    // جلب التقييمات مع تفاصيل المراجعين
    const recentReviews = await Review.find({ reviewedUser: user._id })
      .populate('reviewer', 'username profileImage role')
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
        rating: averageRating || user.stats?.rating || 0,
        totalRatings: totalRatings || user.stats?.totalRatings || 0
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
      savedPosts: savedPostsData,
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
    const currentUserId = req.user?.id;
    
    console.log(`🔍 Fetching profile: ${username}`);
    
    // البحث عن المستخدم
    const targetUser = await User.findOne({ username, isActive: true })
      .select('-password -loginAttempts -lockUntil -passwordChangedAt -passwordResetToken -passwordResetExpires');

    if (!targetUser) {
      console.log(`❌ User not found: ${username}`);
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    // التحقق من الحظر
    if (currentUserId) {
      const isBlocked = await Block.findOne({
        $or: [
          { blocker: currentUserId, blocked: targetUser._id },
          { blocker: targetUser._id, blocked: currentUserId }
        ]
      });
      
      if (isBlocked) {
        console.log(`🚫 Access blocked: ${currentUserId} <-> ${targetUser._id}`);
        return res.status(403).json({
          success: false,
          message: 'لا يمكنك الوصول إلى هذا الملف الشخصي'
        });
      }
    }

    console.log(`✅ User found: ${targetUser._id}`);

    // إحصائيات إضافية
    const postsCount = await Post.countDocuments({ author: targetUser._id });
    const reviewsCount = await Review.countDocuments({ reviewedUser: targetUser._id });
    
    // حساب التقييم من التقييمات فقط
    let averageRating = 0;
    let totalRatings = 0;
    
    const reviewStats = await Review.aggregate([
      { $match: { reviewedUser: targetUser._id } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    if (reviewStats && reviewStats.length > 0) {
      averageRating = reviewStats[0].average;
      totalRatings = reviewStats[0].count;
    }

    const userData = {
      _id: targetUser._id,
      username: targetUser.username,
      email: targetUser.privacy?.showEmail ? targetUser.email : undefined,
      phone: targetUser.privacy?.showPhone ? targetUser.phone : undefined,
      profileImage: targetUser.profileImage || '/uploads/profiles/default-avatar.png',
      bio: targetUser.bio || '',
      role: targetUser.role || 'client',
      location: targetUser.privacy?.showLocation ? targetUser.location : undefined,
      stats: {
        postsCount: postsCount || 0,
        reviewsCount: reviewsCount || 0,
        rating: Number(averageRating).toFixed(1),
        totalRatings: totalRatings || 0
      },
      professionalInfo: targetUser.professionalInfo || {},
      isOnline: targetUser.privacy?.showOnlineStatus ? targetUser.isOnline : false,
      lastSeen: targetUser.privacy?.showOnlineStatus ? targetUser.lastSeen : null,
      createdAt: targetUser.createdAt,
      privacy: targetUser.privacy || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showOnlineStatus: true
      }
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
    const currentUserId = req.user.id;
    
    if (id === 'me') {
      return getCurrentUser(req, res, next);
    }
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح'
      });
    }
    
    // التحقق من عدم حظر المستخدم
    const isBlocked = await Block.findOne({ 
      blocker: currentUserId, 
      blocked: id 
    });
    
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك الوصول إلى هذا المستخدم'
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
        reviewsCount: reviewsCount || 0
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
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    let savedPostsData = [];
    if (user.savedPosts && user.savedPosts.length > 0) {
      savedPostsData = await Post.find({ _id: { $in: user.savedPosts } })
        .populate('author', 'username profileImage role')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: savedPostsData
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
    console.log('🔄 Updating profile for user:', req.user.id);
    console.log('📦 Update data:', req.body);

    const {
      username,
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

    // ===== معالجة تغيير اسم المستخدم (username) =====
    if (username && username !== user.username) {
      // التحقق من صحة اسم المستخدم
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          message: 'اسم المستخدم يجب أن يحتوي على 3-30 حرفًا (أحرف إنجليزية، أرقام، شرطة سفلية فقط)'
        });
      }

      // التحقق من عدم وجود اسم المستخدم مسبقًا
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'اسم المستخدم مستخدم بالفعل'
        });
      }

      // التحقق من فترة 15 يومًا (تطبق فقط إذا كان المستخدم قد غيّر اسمه من قبل)
      const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      if (user.lastUsernameChange && (now - user.lastUsernameChange.getTime()) < FIFTEEN_DAYS) {
        const daysRemaining = Math.ceil((FIFTEEN_DAYS - (now - user.lastUsernameChange.getTime())) / (24 * 60 * 60 * 1000));
        return res.status(400).json({
          success: false,
          message: `لا يمكن تغيير اسم المستخدم إلا مرة كل 15 يومًا. يمكنك التغيير بعد ${daysRemaining} يومًا.`,
          daysRemaining
        });
      }

      // تحديث اسم المستخدم وتاريخ آخر تغيير
      user.username = username;
      user.lastUsernameChange = new Date();
      console.log(`✅ Username changed to: ${username}`);
    }

    // ===== تحديث باقي الحقول =====
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location || '';

    // تحديث المعلومات المهنية
    if (professionalInfo && user.role !== 'client') {
      user.professionalInfo = {
        ...user.professionalInfo,
        craft: professionalInfo.craft !== undefined ? professionalInfo.craft : user.professionalInfo?.craft,
        experience: professionalInfo.experience !== undefined ? professionalInfo.experience : user.professionalInfo?.experience,
        dailyRate: professionalInfo.dailyRate !== undefined ? professionalInfo.dailyRate : user.professionalInfo?.dailyRate,
        skills: professionalInfo.skills !== undefined ? professionalInfo.skills : user.professionalInfo?.skills || []
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

    // جلب البيانات المحدثة بدون الحقول الحساسة
    const updatedUser = await User.findById(user._id)
      .select('-password -loginAttempts -lockUntil -passwordChangedAt -passwordResetToken -passwordResetExpires');

    // حساب أيام التبقي لتغيير الاسم (إذا كان هناك تغيير سابق)
    let daysUntilUsernameChange = null;
    if (updatedUser.lastUsernameChange) {
      const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
      const timeSinceLastChange = Date.now() - updatedUser.lastUsernameChange.getTime();
      if (timeSinceLastChange < FIFTEEN_DAYS) {
        daysUntilUsernameChange = Math.ceil((FIFTEEN_DAYS - timeSinceLastChange) / (24 * 60 * 60 * 1000));
      }
    }

    // إضافة معلومات أيام التبقي إلى الاستجابة
    const responseData = updatedUser.toObject();
    responseData.daysUntilUsernameChange = daysUntilUsernameChange;

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث الملف الشخصي',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    رفع الصورة الشخصية
// @route   POST /api/users/upload-avatar
// @access  Private
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
        { width: 500, height:500, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('✅ Cloudinary upload result:', {
      public_id: result.public_id,
      secure_url: result.secure_url
    });

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

    if (user.profileImagePublicId) {
      await deleteFromCloudinary(user.profileImagePublicId);
      console.log('✅ Image deleted from Cloudinary:', user.profileImagePublicId);
    }
    
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

// @desc    الحصول على منشورات المستخدم
// @route   GET /api/users/:userId/posts
// @access  Public
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

// @desc    الحصول على تقييمات المستخدم
// @route   GET /api/users/:userId/reviews
// @access  Public
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
    
    const reviews = await Review.find({ reviewedUser: userId })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('reviewer', 'username profileImage role');
    
    // حساب الإحصائيات
    const stats = await Review.aggregate([
      { $match: { reviewedUser: user._id } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
          distribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0 && stats[0].distribution) {
      stats[0].distribution.forEach(rating => {
        if (distribution[rating]) distribution[rating]++;
      });
    }
    
    res.json({
      success: true,
      data: reviews,
      stats: {
        average: stats.length > 0 ? stats[0].average : 0,
        count: stats.length > 0 ? stats[0].count : 0,
        distribution
      },
      hasMore: reviews.length === parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    الحصول على إحصائيات المستخدم
// @route   GET /api/users/:userId/stats
// @access  Public
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
    
    const postsCount = await Post.countDocuments({ author: userId });
    const reviewsCount = await Review.countDocuments({ reviewedUser: userId });
    
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
    
    res.json({
      success: true,
      data: {
        rating: reviewStats.length > 0 ? reviewStats[0].average : 0,
        totalRatings: reviewStats.length > 0 ? reviewStats[0].count : 0,
        postsCount: postsCount || 0,
        reviewsCount: reviewsCount || 0
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