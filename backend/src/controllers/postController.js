// backend/src/controllers/postController.js
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import { cloudinary, uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// ============== Helper Functions ==============
// backend/src/controllers/postController.js
// أضف أو صحح هذه الدالة في أعلى الملف

// رفع صور متعددة
const uploadMultipleImages = async (files, userId) => {
  if (!files || files.length === 0) return [];
  
  const uploadedImages = [];
  
  for (const file of files) {
    try {
      console.log(`📤 Uploading image for post by user ${userId}:`, file.originalname);
      
      const result = await uploadToCloudinary(file.buffer, {
        folder: `handymasters/posts/${userId}`,
        public_id: `post-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      });
      
      console.log(`✅ Image uploaded: ${result.secure_url}`);
      
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      });
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      // لا نوقف العملية إذا فشلت صورة واحدة
    }
  }
  
  return uploadedImages;
};

// حذف صور متعددة
const deleteMultipleImages = async (images) => {
  if (!images || images.length === 0) return;
  
  for (const image of images) {
    if (image.publicId) {
      try {
        console.log(`🗑️ Deleting image: ${image.publicId}`);
        await deleteFromCloudinary(image.publicId);
        console.log(`✅ Image deleted: ${image.publicId}`);
      } catch (error) {
        console.error('❌ Error deleting image:', error);
      }
    }
  }
};

// ✅ إزالة أي استيراد لـ socket واستخدام io من req مباشرة
const createNotification = async (notificationData, req) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    
    // ✅ استخدام io من req.app بدلاً من استيراد socket
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

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    const result = await post.toggleLike(userId);
    await post.save();
    
    // إرسال إشعار لصاحب البوست
    if (result.liked && post.author.toString() !== userId) {
      const user = await User.findById(userId);
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: 'like',
        title: 'إعجاب جديد',
        message: `${user.username} أعجب ببوستك: ${post.title}`,
        relatedId: post._id,
        relatedModel: 'Post'
      });
    }
    
    res.json({
      success: true,
      data: {
        liked: result.liked,
        likesCount: result.likesCount
      },
      message: result.liked ? 'تم الإعجاب' : 'تم إلغاء الإعجاب'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل الإعجاب'
    });
  }
};

export const getLikesCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: {
        likesCount: post.likes.length,
        isLiked: post.isLikedBy(req.user.id)
      }
    });
  } catch (error) {
    console.error('Get likes count error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب عدد الإعجابات'
    });
  }
};

// تحديث تقييم المستخدم
const updateUserRating = async (userId) => {
  try {
    const posts = await Post.find({
      'ratings.reviewee': userId
    });
    
    let totalRating = 0;
    let ratingCount = 0;
    
    posts.forEach(post => {
      post.ratings.forEach(rating => {
        if (rating.reviewee.toString() === userId) {
          totalRating += rating.rating;
          ratingCount++;
        }
      });
    });
    
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    
    await User.findByIdAndUpdate(userId, {
      'stats.rating': averageRating,
      'stats.totalRatings': ratingCount
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

// ============== Post Controllers ==============

// backend/src/controllers/postController.js
// جزء من الكود - تحديث دالة createPost

// @desc    إنشاء بوست جديد
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    console.log('📝 Creating post for user:', req.user.id);
    console.log('📎 Files received:', req.files?.length || 0);
    
    const files = req.files || [];
    const postData = req.body;
    
    // تحويل البيانات الرقمية
    if (postData.budget) {
      postData.budget = parseFloat(postData.budget);
    }
    
    if (postData.requiredSkills && typeof postData.requiredSkills === 'string') {
      try {
        postData.requiredSkills = JSON.parse(postData.requiredSkills);
      } catch (e) {
        postData.requiredSkills = [];
      }
    }
    
    // رفع الصور
    let images = [];
    if (files.length > 0) {
      images = await uploadMultipleImages(files, req.user.id);
    }
    
    // إنشاء البوست - تأكد من عدم وجود أخطاء
    const post = new Post({
      title: postData.title,
      description: postData.description,
      type: postData.type,
      category: postData.category,
      budget: postData.budget,
      duration: postData.duration,
      customDuration: postData.customDuration || '',
      location: postData.location,
      requiredSkills: postData.requiredSkills || [],
      author: req.user.id,
      images: images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        width: img.width,
        height: img.height,
        format: img.format
      }))
    });
    
    console.log('💾 Saving post to database...');
    await post.save();
    console.log('✅ Post saved successfully:', post._id);
    
    // إضافة البوست إلى ملف المستخدم
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: post._id },
      $inc: { 'stats.postsCount': 1 }
    });
    
    // جلب البوست مع بيانات المؤلف
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profileImage role');
    
    console.log('✅ Post created successfully:', post._id);
    
    res.status(201).json({
      success: true,
      data: populatedPost,
      message: 'تم إنشاء البوست بنجاح'
    });
  } catch (error) {
    console.error('❌ Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل إنشاء البوست'
    });
  }
};

// @desc    جلب جميع البوستات
// @route   GET /api/posts
// @access  Private
export const getPosts = async (req, res) => {
  try {
    const {
      type,
      status,
      category,
      location,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10
    } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseFloat(minBudget);
      if (maxBudget) query.budget.$lte = parseFloat(maxBudget);
    }
    
    const posts = await Post.find(query)
      .populate('author', 'username profileImage role rating stats')
      .populate('proposals.artisan', 'username profileImage role rating')
      .populate('selectedArtisan', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب البوستات'
    });
  }
};

// @desc    جلب بوست بواسطة ID
// @route   GET /api/posts/:id
// @access  Private
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'username profileImage role location rating stats professionalInfo')
      .populate('proposals.artisan', 'username profileImage role rating professionalInfo')
      .populate('selectedArtisan', 'username profileImage role rating')
      .populate('ratings.reviewer', 'username profileImage')
      .populate('ratings.reviewee', 'username profileImage');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // زيادة عدد المشاهدات
    post.stats.views += 1;
    await post.save();
    
    // التحقق إذا كان المستخدم الحالي قد حفظ البوست
    const userId = req.user.id;
    const isSaved = post.savedBy?.some(id => id.toString() === userId) || false;
    
    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isSaved
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب البوست'
    });
  }
};

// @desc    تحديث بوست
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const files = req.files || [];
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب البوست
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك تعديل هذا البوست'
      });
    }
    
    // رفع الصور الجديدة
    let newImages = [];
    if (files.length > 0) {
      newImages = await uploadMultipleImages(files, req.user.id);
    }
    
    // تحديث البيانات
    if (updateData.title) post.title = updateData.title;
    if (updateData.description) post.description = updateData.description;
    if (updateData.category) post.category = updateData.category;
    if (updateData.budget) post.budget = parseFloat(updateData.budget);
    if (updateData.duration) post.duration = updateData.duration;
    if (updateData.customDuration) post.customDuration = updateData.customDuration;
    if (updateData.location) post.location = updateData.location;
    if (updateData.requiredSkills) {
      post.requiredSkills = typeof updateData.requiredSkills === 'string' 
        ? JSON.parse(updateData.requiredSkills) 
        : updateData.requiredSkills;
    }
    
    // إضافة الصور الجديدة
    if (newImages.length > 0) {
      post.images.push(...newImages);
    }
    
    post.updatedAt = Date.now();
    await post.save();
    
    res.json({
      success: true,
      data: post,
      message: 'تم تحديث البوست بنجاح'
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل تحديث البوست'
    });
  }
};

// @desc    حذف بوست
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب البوست
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك حذف هذا البوست'
      });
    }
    
    // حذف الصور من Cloudinary
    await deleteMultipleImages(post.images);
    
    // حذف البوست
    await Post.findByIdAndDelete(id);
    
    // إزالة البوست من ملف المستخدم
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { posts: id },
      $inc: { 'stats.postsCount': -1 }
    });
    
    res.json({
      success: true,
      message: 'تم حذف البوست بنجاح'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل حذف البوست'
    });
  }
};

// @desc    حذف صورة من البوست
// @route   DELETE /api/posts/:id/images/:imageIndex
// @access  Private
export const deletePostImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك حذف الصور من هذا البوست'
      });
    }
    
    const index = parseInt(imageIndex);
    if (index >= post.images.length) {
      return res.status(404).json({
        success: false,
        message: 'الصورة غير موجودة'
      });
    }
    
    // حذف الصورة من Cloudinary
    const imageToDelete = post.images[index];
    if (imageToDelete.publicId) {
      await cloudinary.uploader.destroy(imageToDelete.publicId);
    }
    
    // إزالة الصورة من المصفوفة
    post.images.splice(index, 1);
    await post.save();
    
    res.json({
      success: true,
      data: post,
      message: 'تم حذف الصورة بنجاح'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل حذف الصورة'
    });
  }
};

// @desc    تقديم عرض على بوست
// @route   POST /api/posts/:id/proposals
// @access  Private
export const submitProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, proposedBudget, proposedDuration } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن البوست لا يزال مفتوحاً
    if (post.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'هذا البوست لم يعد يقبل العروض'
      });
    }
    
    // التحقق من عدم تقديم عرض مسبق
    const existingProposal = post.proposals.find(
      p => p.artisan.toString() === userId
    );
    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بتقديم عرض مسبقاً على هذا البوست'
      });
    }
    
    // إضافة العرض
    post.proposals.push({
      artisan: userId,
      message,
      proposedBudget: parseFloat(proposedBudget),
      proposedDuration,
      status: 'pending'
    });
    post.stats.proposalsCount += 1;
    
    await post.save();
    
    // إرسال إشعار لصاحب البوست
    const proposer = await User.findById(userId);
    await createNotification({
      recipient: post.author,
      sender: userId,
      type: 'proposal',
      title: 'عرض جديد على طلبك',
      message: `${proposer.username} قدم عرضاً على طلبك: ${post.title}`,
      relatedId: post._id,
      relatedModel: 'Post'
    });
    
    res.json({
      success: true,
      data: post,
      message: 'تم تقديم العرض بنجاح'
    });
  } catch (error) {
    console.error('Submit proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل تقديم العرض'
    });
  }
};

// @desc    اختيار عرض
// @route   PUT /api/posts/:id/proposals/:proposalId/select
// @access  Private
export const selectProposal = async (req, res) => {
  try {
    const { id, proposalId } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب البوست
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'فقط صاحب البوست يمكنه اختيار عرض'
      });
    }
    
    // التحقق من أن البوست لا يزال مفتوحاً
    if (post.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'هذا البوست لم يعد مفتوحاً'
      });
    }
    
    const proposal = post.proposals.id(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'العرض غير موجود'
      });
    }
    
    // تحديث حالة البوست
    post.status = 'in_progress';
    post.selectedProposal = proposalId;
    post.selectedArtisan = proposal.artisan;
    post.workDetails = {
      ...post.workDetails,
      startDate: new Date()
    };
    
    // تحديث حالة العروض الأخرى
    post.proposals.forEach(p => {
      if (p._id.toString() === proposalId) {
        p.status = 'accepted';
      } else if (p.status === 'pending') {
        p.status = 'rejected';
      }
    });
    
    await post.save();
    
    // إرسال إشعار للحرفي المختار
    await createNotification({
      recipient: proposal.artisan,
      sender: userId,
      type: 'proposal_accepted',
      title: 'تم قبول عرضك',
      message: `تم قبول عرضك على طلب: ${post.title}`,
      relatedId: post._id,
      relatedModel: 'Post'
    });
    
    res.json({
      success: true,
      data: post,
      message: 'تم اختيار العرض بنجاح'
    });
  } catch (error) {
    console.error('Select proposal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل اختيار العرض'
    });
  }
};

// @desc    إكمال العمل
// @route   PUT /api/posts/:id/complete
// @access  Private
export const completeWork = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualBudget, notes } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب البوست أو الحرفي المختار
    const isAuthor = post.author.toString() === userId;
    const isArtisan = post.selectedArtisan?.toString() === userId;
    
    if (!isAuthor && !isArtisan) {
      return res.status(403).json({
        success: false,
        message: 'فقط صاحب البوست أو الحرفي المختار يمكنه إكمال العمل'
      });
    }
    
    // تحديث تفاصيل العمل
    post.workDetails = {
      ...post.workDetails,
      actualBudget: actualBudget ? parseFloat(actualBudget) : post.budget,
      notes: notes || '',
      endDate: new Date()
    };
    post.status = 'completed';
    
    await post.save();
    
    // إضافة العمل إلى ملفات المستخدمين
    await User.findByIdAndUpdate(post.author, {
      $push: { completedJobs: post._id },
      $inc: { 'stats.completedJobsCount': 1 }
    });
    
    await User.findByIdAndUpdate(post.selectedArtisan, {
      $push: { completedJobs: post._id },
      $inc: { 'stats.completedJobsCount': 1 }
    });
    
    // إرسال إشعار للطرف الآخر
    const recipient = isAuthor ? post.selectedArtisan : post.author;
    await createNotification({
      recipient,
      sender: userId,
      type: 'job_completed',
      title: 'تم إكمال العمل',
      message: `تم إكمال العمل: ${post.title}`,
      relatedId: post._id,
      relatedModel: 'Post'
    });
    
    res.json({
      success: true,
      data: post,
      message: 'تم إكمال العمل بنجاح'
    });
  } catch (error) {
    console.error('Complete work error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل إكمال العمل'
    });
  }
};


// @desc    مشاركة بوست مع مستخدمين
// @route   POST /api/posts/:id/share
// @access  Private
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    const sharedWithUsers = [];
    
    for (const targetUserId of userIds) {
      const alreadyShared = post.sharedWith.some(s => s.user.toString() === targetUserId);
      
      if (!alreadyShared) {
        post.sharedWith.push({ user: targetUserId });
        sharedWithUsers.push(targetUserId);
        
        // ✅ إنشاء إشعار للمستخدم المستلم - بدون استخدام Notification إذا لم يكن موجوداً
        try {
          // التحقق من وجود نموذج Notification
          if (mongoose.models.Notification) {
            const Notification = mongoose.model('Notification');
            await Notification.create({
              recipient: targetUserId,
              sender: userId,
              type: 'share',
              title: 'تمت المشاركة',
              content: `${req.user.username} شارك معك منشوراً "${post.title.substring(0, 50)}"`,
              referenceId: post._id,
              referenceModel: 'Post'
            });
          }
        } catch (notifError) {
          console.log('Notification not available, skipping:', notifError.message);
        }
      }
    }
    
    post.stats.sharesCount += sharedWithUsers.length;
    await post.save();
    
    res.json({
      success: true,
      message: 'تمت المشاركة بنجاح',
      data: {
        sharedWith: sharedWithUsers,
        sharesCount: post.stats.sharesCount
      }
    });
    
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// backend/src/controllers/postController.js (أضف هذه الدوال الجديدة)

// @desc    جلب المحفوظات (بوستات محفوظة)
// @route   GET /api/posts/saved
// @access  Private
// backend/src/controllers/postController.js
// تأكد من وجود هذه الدالة

export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(userId)
      .populate({
        path: 'savedPosts',
        populate: [
          { 
            path: 'author', 
            select: 'username profileImage role location rating stats' 
          }
        ],
        options: {
          sort: { createdAt: -1 },
          skip: (parseInt(page) - 1) * parseInt(limit),
          limit: parseInt(limit)
        }
      });
    
    const total = user.savedPosts.length;
    const hasMore = (page * limit) < total;
    
    res.json({
      success: true,
      posts: user.savedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب المحفوظات'
    });
  }
};

// @desc    حفظ/إلغاء حفظ بوست (محسن)
// @route   POST /api/posts/:id/save
// @access  Private
export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // استخدام الميثود من النموذج
    const result = await post.toggleSave(userId);
    
    // تحديث قائمة المحفوظات في ملف المستخدم
    if (result.saved) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedPosts: id }
      });
      
      // إرسال إشعار لصاحب البوست (اختياري)
      if (post.author.toString() !== userId) {
        await createNotification({
          recipient: post.author,
          sender: userId,
          type: 'post_saved',
          title: 'تم حفظ بوستك',
          message: `قام مستخدم بحفظ بوستك: ${post.title}`,
          relatedId: post._id,
          relatedModel: 'Post'
        });
      }
    } else {
      await User.findByIdAndUpdate(userId, {
        $pull: { savedPosts: id }
      });
    }
    
    res.json({
      success: true,
      data: {
        saved: result.saved,
        savesCount: result.savesCount
      },
      message: result.saved ? 'تم حفظ البوست بنجاح' : 'تم إزالة البوست من المحفوظات'
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل حفظ البوست'
    });
  }
};

// @desc    الحصول على عدد الطلبات على بوست (لصاحب البوست فقط)
// @route   GET /api/posts/:id/proposals-count
// @access  Private (Owner only)
export const getProposalsCount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب البوست
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'فقط صاحب البوست يمكنه رؤية عدد الطلبات'
      });
    }
    
    const stats = post.getProposalStats();
    
    res.json({
      success: true,
      data: {
        total: stats.total,
        pending: stats.pending,
        accepted: stats.accepted,
        rejected: stats.rejected,
        withdrawn: stats.withdrawn
      }
    });
  } catch (error) {
    console.error('Get proposals count error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب عدد الطلبات'
    });
  }
};

// @desc    الحصول على جميع العروض (لصاحب البوست فقط)
// @route   GET /api/posts/:id/proposals
// @access  Private (Owner only)
export const getProposals = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id)
      .populate('proposals.artisan', 'username profileImage role location rating stats professionalInfo');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب البوست
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'فقط صاحب البوست يمكنه رؤية العروض'
      });
    }
    
    res.json({
      success: true,
      data: post.proposals,
      stats: post.getProposalStats()
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب العروض'
    });
  }
};

// @desc    قبول/رفض عرض (مع إرسال إشعار)
// @route   PUT /api/posts/:id/proposals/:proposalId/:action
// @access  Private (Owner only)
export const updateProposalStatus = async (req, res) => {
  try {
    const { id, proposalId, action } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو صاحب البوست
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'فقط صاحب البوست يمكنه تحديث العروض'
      });
    }
    
    const proposal = post.proposals.id(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'العرض غير موجود'
      });
    }
    
    let newStatus;
    let notificationType;
    let notificationMessage;
    
    if (action === 'accept') {
      newStatus = 'accepted';
      notificationType = 'proposal_accepted';
      notificationMessage = message || `تم قبول عرضك على طلب: ${post.title}`;
      
      // تحديث حالة البوست
      post.status = 'in_progress';
      post.selectedProposal = proposalId;
      post.selectedArtisan = proposal.artisan;
      post.workDetails.startDate = new Date();
      
      // رفض العروض الأخرى
      post.proposals.forEach(p => {
        if (p._id.toString() !== proposalId && p.status === 'pending') {
          p.status = 'rejected';
        }
      });
    } else if (action === 'reject') {
      newStatus = 'rejected';
      notificationType = 'proposal_rejected';
      notificationMessage = message || `تم رفض عرضك على طلب: ${post.title}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'إجراء غير صالح'
      });
    }
    
    proposal.status = newStatus;
    await post.save();
    
    // إرسال إشعار للحرفي
    await createNotification({
      recipient: proposal.artisan,
      sender: userId,
      type: notificationType,
      title: action === 'accept' ? 'تم قبول عرضك' : 'تم رفض عرضك',
      message: notificationMessage,
      relatedId: post._id,
      relatedModel: 'Post'
    });
    
    res.json({
      success: true,
      data: {
        proposal,
        postStatus: post.status
      },
      message: action === 'accept' ? 'تم قبول العرض بنجاح' : 'تم رفض العرض'
    });
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل تحديث حالة العرض'
    });
  }
};

// @desc    إضافة تقييم مع تحديث إحصائيات المستخدم
// @route   POST /api/posts/:id/ratings
// @access  Private
export const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن العمل قد اكتمل
    if (post.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تقييم عمل غير مكتمل'
      });
    }
    
    // إضافة التقييم
    const updatedPost = await post.addRating({ rating, comment }, userId);
    
    // تحديث إحصائيات المستخدم
    const reviewee = post.author.toString() === userId ? post.selectedArtisan : post.author;
    await updateUserRating(reviewee);
    
    // إرسال إشعار
    await createNotification({
      recipient: reviewee,
      sender: userId,
      type: 'rating_received',
      title: 'تقييم جديد',
      message: `تم تقييمك على العمل: ${post.title} (${rating}/5)`,
      relatedId: post._id,
      relatedModel: 'Post'
    });
    
    res.json({
      success: true,
      data: updatedPost,
      message: 'تم إضافة التقييم بنجاح'
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل إضافة التقييم'
    });
  }
};

// @desc    الحصول على تقييمات العمل (لصاحب البوست والحرفي)
// @route   GET /api/posts/:id/ratings
// @access  Private
export const getRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id)
      .populate('ratings.reviewer', 'username profileImage')
      .populate('ratings.reviewee', 'username profileImage');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    // التحقق من أن المستخدم مشارك في العمل
    const isAuthor = post.author.toString() === userId;
    const isArtisan = post.selectedArtisan?.toString() === userId;
    
    if (!isAuthor && !isArtisan) {
      return res.status(403).json({
        success: false,
        message: 'فقط المشاركون في العمل يمكنهم رؤية التقييمات'
      });
    }
    
    res.json({
      success: true,
      data: post.ratings,
      stats: {
        average: post.stats.averageRating,
        count: post.stats.ratingsCount
      }
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب التقييمات'
    });
  }
};

// @desc    جلب المحادثات للمشاركة
// @route   GET /api/posts/conversations-for-sharing
// @access  Private
export const getConversationsForSharing = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username profileImage')
      .sort({ lastMessageAt: -1 })
      .limit(20);
    
    // استخراج المستخدمين الآخرين
    const usersMap = new Map();
    conversations.forEach(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId);
      if (otherUser && !usersMap.has(otherUser._id.toString())) {
        usersMap.set(otherUser._id.toString(), {
          _id: otherUser._id,
          username: otherUser.username,
          profileImage: otherUser.profileImage,
          lastMessageAt: conv.lastMessageAt
        });
      }
    });
    
    const users = Array.from(usersMap.values());
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب المحادثات'
    });
  }
};



// @desc    جلب بوستات المستخدم
// @route   GET /api/users/:userId/posts
// @access  Private
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profileImage role')
      .populate('selectedArtisan', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments({ author: userId });
    
    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب بوستات المستخدم'
    });
  }
};

// @desc    جلب الأعمال المكتملة للمستخدم
// @route   GET /api/users/:userId/completed-jobs
// @access  Private
export const getUserCompletedJobs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.find({ 
      $or: [
        { author: userId },
        { selectedArtisan: userId }
      ],
      status: 'completed'
    })
      .populate('author', 'username profileImage role')
      .populate('selectedArtisan', 'username profileImage')
      .populate('ratings.reviewer', 'username profileImage')
      .populate('ratings.reviewee', 'username profileImage')
      .sort({ 'workDetails.endDate': -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments({ 
      $or: [
        { author: userId },
        { selectedArtisan: userId }
      ],
      status: 'completed'
    });
    
    // حساب الإحصائيات
    let totalEarnings = 0;
    let totalRating = 0;
    let ratingCount = 0;
    
    posts.forEach(post => {
      if (post.workDetails?.actualBudget) {
        totalEarnings += post.workDetails.actualBudget;
      }
      
      post.ratings.forEach(rating => {
        if (rating.reviewee.toString() === userId) {
          totalRating += rating.rating;
          ratingCount++;
        }
      });
    });
    
    const stats = {
      totalJobs: total,
      totalEarnings,
      averageRating: ratingCount > 0 ? totalRating / ratingCount : 0
    };
    
    res.json({
      success: true,
      posts,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get completed jobs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب الأعمال المكتملة'
    });
  }
};

export default {
  createPost,
  getPosts,
  getPostById,
  likePost,
  getLikesCount,
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
  getSavedPosts,
  savePost,
  sharePost,
  getConversationsForSharing,
  getUserPosts,
  getUserCompletedJobs
};