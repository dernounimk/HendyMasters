// backend/src/controllers/postController.js
import Post from '../models/Post.js';
import Message from '../models/Message.js'; 
import User from '../models/User.js';
import Block from '../models/Block.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import { cloudinary, uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// ============== Helper Functions ==============

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

// إنشاء إشعار
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

// ============== Post Controllers ==============


// @desc    إعجاب ببوست
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
    
    if (result.liked && post.author.toString() !== userId) {
      const user = await User.findById(userId).select('username');
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: 'like',
        title: 'إعجاب جديد',
        message: `${user.username} أعجب ببوستك: ${post.title.substring(0, 50)}`,
        relatedId: post._id,
        relatedModel: 'Post'
      }, req);
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

// @desc    حفظ/إلغاء حفظ بوست
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
    
    const user = await User.findById(userId).select('username');
    const result = await post.toggleSave(userId);
    
    if (result.saved) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedPosts: id }
      });
      
      if (post.author.toString() !== userId) {
        await createNotification({
          recipient: post.author,
          sender: userId,
          type: 'save',
          title: 'تم حفظ بوستك',
          message: `${user.username} حفظ بوستك "${post.title.substring(0, 50)}"`,
          relatedId: post._id,
          relatedModel: 'Post'
        }, req);
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

// @desc    مشاركة بوست مع مستخدمين أو نسخ الرابط
// @route   POST /api/posts/:id/share
// @access  Private
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const userId = req.user.id;
    
    console.log(`📨 Sharing post ${id} with users:`, userIds);
    
    const post = await Post.findById(id);
    const user = await User.findById(userId).select('username');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    let sharedWithUsers = [];
    
    if (userIds && userIds.length > 0) {
      for (const targetUserId of userIds) {
        // التأكد من عدم المشاركة مع النفس
        if (targetUserId === userId) {
          console.log(`⚠️ Skipping self-share with user ${targetUserId}`);
          continue;
        }
        
        const alreadyShared = post.sharedWith.some(s => s.user.toString() === targetUserId);
        
        if (!alreadyShared) {
          post.sharedWith.push({ user: targetUserId });
          sharedWithUsers.push(targetUserId);
          
          // إرسال إشعار مشاركة
          await createNotification({
            recipient: targetUserId,
            sender: userId,
            type: 'share',
            title: 'تمت المشاركة 🔗',
            message: `${user.username} شارك معك منشوراً "${post.title.substring(0, 50)}"`,
            relatedId: post._id,
            relatedModel: 'Post'
          }, req);
          
          // إرسال إشعار لصاحب البوست (إذا كان مختلفاً عن المرسل والمستلم)
          if (post.author.toString() !== userId && post.author.toString() !== targetUserId) {
            await createNotification({
              recipient: post.author,
              sender: userId,
              type: 'share',
              title: 'تمت مشاركة بوستك',
              message: `${user.username} شارك بوستك "${post.title.substring(0, 50)}"`,
              relatedId: post._id,
              relatedModel: 'Post'
            }, req);
          }
          
          // إنشاء رسالة في المحادثة
          try {
            let conversation = await Conversation.findOne({
              participants: { $all: [userId, targetUserId], $size: 2 }
            });
            
            if (!conversation) {
              conversation = await Conversation.create({
                participants: [userId, targetUserId],
                lastMessageAt: new Date()
              });
              console.log(`✅ New conversation created: ${conversation._id}`);
            }
            
            const shareMessage = `شارك معك ${user.username} منشوراً: "${post.title}"\n\n🔗 رابط المنشور: ${process.env.CLIENT_URL || 'http://localhost:5173'}/post/${post._id}`;
            
            const message = await Message.create({
              conversation: conversation._id,
              sender: userId,
              recipient: targetUserId,
              content: shareMessage,
              readBy: [userId]
            });
            
            await message.populate('sender', 'username profileImage');
            
            conversation.lastMessage = message._id;
            conversation.lastMessageAt = message.createdAt;
            await conversation.save();
            
            // إرسال إشعار عبر Socket
            const io = req.app.get('io');
            if (io) {
              io.to(`user:${targetUserId}`).emit('message:new', {
                conversationId: conversation._id,
                message
              });
            }
          } catch (msgError) {
            console.error('Error creating share message:', msgError);
          }
        }
      }
      
      post.stats.sharesCount += sharedWithUsers.length;
      await post.save();
    } else {
      post.stats.sharesCount += 1;
      await post.save();
    }
    
    res.json({
      success: true,
      message: sharedWithUsers.length > 0 ? 'تمت المشاركة بنجاح' : 'تم تحديث عدد المشاركات',
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

// backend/src/controllers/postController.js

// @desc    جلب جميع البوستات
export const getPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const blocksByMe = await Block.find({ blocker: userId }).select('blocked');
    const blockedByMeIds = blocksByMe.map(block => block.blocked.toString());
    
    const blocksOfMe = await Block.find({ blocked: userId }).select('blocker');
    const blockedMeIds = blocksOfMe.map(block => block.blocker.toString());
    
    const blockedUserIds = [...new Set([...blockedByMeIds, ...blockedMeIds])];
    
    const {
      type,
      status,
      location,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10
    } = req.query;
    
    const query = {};
    
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    if (location && location.trim()) query.location = { $regex: location, $options: 'i' };
    
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseFloat(minBudget);
      if (maxBudget) query.budget.$lte = parseFloat(maxBudget);
    }
    
    if (blockedUserIds.length > 0) {
      query.author = { $nin: blockedUserIds };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    // ✅ إزالة populate للحقول المحذوفة
    const posts = await Post.find(query)
      .populate('author', 'username profileImage role rating stats')
      // .populate('proposals.artisan', 'username profileImage role rating') // تم الحذف
      // .populate('selectedArtisan', 'username profileImage') // تم الحذف
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب البوستات'
    });
  }
};

// @desc    جلب بوست بواسطة ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // ✅ إزالة populate للحقول المحذوفة
    const post = await Post.findById(id)
      .populate('author', 'username profileImage role');
      // .populate('selectedArtisan', 'username profileImage'); // تم الحذف
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'البوست غير موجود'
      });
    }
    
    const isBlocked = await Block.findOne({ 
      blocker: userId, 
      blocked: post.author._id 
    });
    
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك الوصول إلى هذا المحتوى'
      });
    }
    
    post.stats.views += 1;
    await post.save();
    
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

// @desc    جلب بوستات المستخدم
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const isBlocked = await Block.findOne({ 
      blocker: currentUserId, 
      blocked: userId 
    });
    
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك الوصول إلى محتوى هذا المستخدم'
      });
    }
    
    // ✅ إزالة populate للحقول المحذوفة
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profileImage role')
      // .populate('selectedArtisan', 'username profileImage') // تم الحذف
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

// @desc    جلب المحفوظات
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    const savedPostIds = user.savedPosts || [];
    
    if (savedPostIds.length === 0) {
      return res.json({
        success: true,
        posts: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          hasMore: false,
          pages: 0
        }
      });
    }
    
    const blockedUsers = await Block.find({ blocker: userId }).select('blocked');
    const blockedUserIds = blockedUsers.map(block => block.blocked.toString());
    
    // ✅ إزالة populate للحقول المحذوفة
    let allSavedPosts = await Post.find({
      _id: { $in: savedPostIds }
    })
      .populate('author', 'username profileImage role location rating stats')
      // .populate('selectedArtisan', 'username profileImage') // تم الحذف
      .sort({ createdAt: -1 });
    
    allSavedPosts = allSavedPosts.filter(post => {
      if (!post) return false;
      if (!post.author) return false;
      if (blockedUserIds.includes(post.author._id.toString())) return false;
      return true;
    });
    
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = allSavedPosts.slice(startIndex, endIndex);
    const hasMore = endIndex < allSavedPosts.length;
    
    res.json({
      success: true,
      posts: paginatedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allSavedPosts.length,
        hasMore: hasMore,
        pages: Math.ceil(allSavedPosts.length / limit)
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

// @desc    إنشاء بوست جديد
export const createPost = async (req, res) => {
  try {
    console.log('📝 Creating post for user:', req.user.id);
    console.log('📎 Files received:', req.files?.length || 0);
    
    const files = req.files || [];
    const postData = req.body;
    
    if (postData.budget) {
      postData.budget = parseFloat(postData.budget);
    }
    
    let images = [];
    if (files.length > 0) {
      images = await uploadMultipleImages(files, req.user.id);
    }
    
    // ✅ تبسيط إنشاء البوست - إزالة الحقول غير المستخدمة
    const post = new Post({
      title: postData.title,
      description: postData.description,
      type: postData.type,
      budget: postData.budget,
      location: postData.location,
      author: req.user.id,
      images: images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        width: img.width,
        height: img.height,
        format: img.format
      }))
      // ✅ تم إزالة: category, duration, customDuration, requiredSkills
    });
    
    await post.save();
    
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: post._id },
      $inc: { 'stats.postsCount': 1 }
    });
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profileImage role');
    
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

// @desc    تحديث بوست
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
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك تعديل هذا البوست'
      });
    }
    
    let newImages = [];
    if (files.length > 0) {
      newImages = await uploadMultipleImages(files, req.user.id);
    }
    
    // ✅ تحديث فقط الحقول الموجودة في الواجهة الجديدة
    if (updateData.title) post.title = updateData.title;
    if (updateData.description) post.description = updateData.description;
    if (updateData.budget) post.budget = parseFloat(updateData.budget);
    if (updateData.location) post.location = updateData.location;
    
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
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك حذف هذا البوست'
      });
    }
    
    await deleteMultipleImages(post.images);
    await Post.findByIdAndDelete(id);
    
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
    
    const imageToDelete = post.images[index];
    if (imageToDelete.publicId) {
      await cloudinary.uploader.destroy(imageToDelete.publicId);
    }
    
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

// @desc    جلب المحادثات للمشاركة
// @route   GET /api/posts/conversations-for-sharing
// @access  Private
export const getConversationsForSharing = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📋 Fetching conversations for sharing for user: ${userId}`);
    
    // جلب جميع المحادثات التي يشارك فيها المستخدم
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username profileImage role')
      .sort({ lastMessageAt: -1 });
    
    console.log(`📋 Found ${conversations.length} conversations`);
    
    // استخراج المستخدمين الآخرين (استبعاد المستخدم الحالي)
    const usersMap = new Map();
    
    conversations.forEach(conv => {
      // البحث عن المشارك الآخر (ليس المستخدم الحالي)
      const otherUser = conv.participants.find(p => p._id.toString() !== userId);
      
      if (otherUser && otherUser._id) {
        const userIdStr = otherUser._id.toString();
        
        // التأكد من عدم إضافة المستخدم الحالي وعدم التكرار
        if (userIdStr !== userId && !usersMap.has(userIdStr)) {
          usersMap.set(userIdStr, {
            _id: otherUser._id,
            username: otherUser.username,
            profileImage: otherUser.profileImage || '/uploads/profiles/default-avatar.png',
            role: otherUser.role,
            lastMessageAt: conv.lastMessageAt
          });
        }
      }
    });
    
    const users = Array.from(usersMap.values());
    
    console.log(`📋 Found ${users.length} unique users for sharing`);
    console.log('📋 Users:', users.map(u => ({ id: u._id, username: u.username })));
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get conversations for sharing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب المحادثات'
    });
  }
};

// @desc    جلب عدد الإعجابات
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

export default {
  createPost,
  getPosts,
  getPostById,
  likePost,
  getLikesCount,
  updatePost,
  deletePost,
  deletePostImage,
  getSavedPosts,
  savePost,
  sharePost,
  getConversationsForSharing,
  getUserPosts
};