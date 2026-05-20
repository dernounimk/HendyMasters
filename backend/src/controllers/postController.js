// backend/src/controllers/postController.js

// ✅ جميع الاستيرادات في بداية الملف - مرة واحدة فقط
import Post from '../models/Post.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Block from '../models/Block.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import { cloudinary, deleteFromCloudinary, uploadMultipleImages } from '../config/cloudinary.js';

// ============== Helper Functions ==============

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

// @desc    إنشاء بوست جديد
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    console.log('📝 Creating post for user:', req.user.id);
    console.log('📎 Files received:', req.files?.length || 0);
    console.log('📝 Body:', req.body);
    
    const files = req.files || [];
    const postData = req.body;
    
    // معالجة الميزانية
    let budget = parseFloat(postData.budget);
    if (isNaN(budget)) {
      budget = 1000;
    }
    
    // رفع الصور
    let images = [];
    if (files.length > 0) {
      console.log('📸 Uploading images to Cloudinary...');
      images = await uploadMultipleImages(files, req.user.id);
      console.log(`📸 Uploaded ${images.length} images successfully`);
    }
    
    // إنشاء البوست
    const post = new Post({
      title: postData.title,
      description: postData.description,
      type: postData.type,
      budget: budget,
      location: postData.location,
      author: req.user.id,
      images: images
    });
    
    await post.save();
    console.log(`✅ Post created successfully: ${post._id}`);
    console.log(`📸 Images count: ${post.images.length}`);
    
    // تحديث المستخدم
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: post._id },
      $inc: { 'stats.postsCount': 1 }
    });
    
    // جلب البوست مع بيانات المؤلف
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

// @desc    جلب جميع البوستات
// @route   GET /api/posts
// @access  Private
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
      location,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10
    } = req.query;
    
    const query = {};
    
    if (type && type !== 'all') query.type = type;
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
    
    const posts = await Post.find(query)
      .populate('author', 'username profileImage role')
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
// @route   GET /api/posts/:id
// @access  Private
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const post = await Post.findById(id)
      .populate('author', 'username profileImage role');
    
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
    const isLiked = post.likes?.some(like => like.user.toString() === userId) || false;
    
    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isSaved,
        isLiked
      }
    });
  } catch (error) {
    console.error('❌ Get post error:', error);
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
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكنك تعديل هذا البوست'
      });
    }
    
    // رفع الصور الجديدة
    let newImages = [];
    if (files.length > 0) {
      console.log(`📸 Uploading ${files.length} new images`);
      newImages = await uploadMultipleImages(files, req.user.id);
    }
    
    // تحديث الحقول
    if (updateData.title) post.title = updateData.title;
    if (updateData.description) post.description = updateData.description;
    if (updateData.budget) post.budget = parseFloat(updateData.budget);
    if (updateData.location) post.location = updateData.location;
    
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
    console.error('❌ Update post error:', error);
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
    
    // تحديث المستخدم
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { posts: id },
      $inc: { 'stats.postsCount': -1 }
    });
    
    res.json({
      success: true,
      message: 'تم حذف البوست بنجاح'
    });
  } catch (error) {
    console.error('❌ Delete post error:', error);
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
    
    const imageToDelete = post.images[index];
    if (imageToDelete.publicId) {
      await deleteFromCloudinary(imageToDelete.publicId);
    }
    
    post.images.splice(index, 1);
    await post.save();
    
    res.json({
      success: true,
      data: post,
      message: 'تم حذف الصورة بنجاح'
    });
  } catch (error) {
    console.error('❌ Delete image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل حذف الصورة'
    });
  }
};

// @desc    إعجاب ببوست
// @route   POST /api/posts/:id/like
// @access  Private
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
    console.error('❌ Like post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل الإعجاب'
    });
  }
};

// @desc    جلب عدد الإعجابات
// @route   GET /api/posts/:id/likes-count
// @access  Private
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
    
    const isLiked = post.likes?.some(like => like.user.toString() === req.user.id) || false;
    
    res.json({
      success: true,
      data: {
        likesCount: post.stats.likesCount || post.likes?.length || 0,
        isLiked
      }
    });
  } catch (error) {
    console.error('❌ Get likes count error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب عدد الإعجابات'
    });
  }
};

// @desc    حفظ/إلغاء حفظ بوست
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
    console.error('❌ Save post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل حفظ البوست'
    });
  }
};

// @desc    جلب المحفوظات
// @route   GET /api/posts/saved
// @access  Private
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
    
    let allSavedPosts = await Post.find({
      _id: { $in: savedPostIds }
    })
      .populate('author', 'username profileImage role')
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
    console.error('❌ Get saved posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب المحفوظات'
    });
  }
};

// @desc    جلب بوستات المستخدم
// @route   GET /api/posts/user/:userId
// @access  Private
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
    
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profileImage role')
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
    console.error('❌ Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب بوستات المستخدم'
    });
  }
};

// @desc    مشاركة بوست
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
        if (targetUserId === userId) continue;
        
        const alreadyShared = post.sharedWith.some(s => s.user.toString() === targetUserId);
        
        if (!alreadyShared) {
          post.sharedWith.push({ user: targetUserId });
          sharedWithUsers.push(targetUserId);
          
          await createNotification({
            recipient: targetUserId,
            sender: userId,
            type: 'share',
            title: 'تمت المشاركة 🔗',
            message: `${user.username} شارك معك منشوراً "${post.title.substring(0, 50)}"`,
            relatedId: post._id,
            relatedModel: 'Post'
          }, req);
          
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
          
          try {
            let conversation = await Conversation.findOne({
              participants: { $all: [userId, targetUserId], $size: 2 }
            });
            
            if (!conversation) {
              conversation = await Conversation.create({
                participants: [userId, targetUserId],
                lastMessageAt: new Date()
              });
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
    console.error('❌ Share post error:', error);
    res.status(500).json({
      success: false,
      message: error.message
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
    
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username profileImage role')
      .sort({ lastMessageAt: -1 });
    
    const usersMap = new Map();
    
    conversations.forEach(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId);
      
      if (otherUser && otherUser._id) {
        const userIdStr = otherUser._id.toString();
        
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
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('❌ Get conversations for sharing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'فشل جلب المحادثات'
    });
  }
};