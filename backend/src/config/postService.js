// backend/src/config/postService.js
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

class PostService {
  constructor() {
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.maxImageSize = 5 * 1024 * 1024; // 5MB
    this.maxImagesPerPost = 5;
  }

  // رفع صورة إلى Cloudinary
  async uploadImage(file, userId) {
    try {
      // التحقق من نوع الملف
      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new Error('نوع الملف غير مدعوم. يرجى رفع صور بصيغة JPEG, PNG, GIF أو WebP');
      }

      // التحقق من حجم الملف
      if (file.size > this.maxImageSize) {
        throw new Error('حجم الصورة كبير جداً. الحد الأقصى 5MB');
      }

      // رفع الصورة إلى Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `posts/${userId}`,
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // رفع صور متعددة
  async uploadMultipleImages(files, userId) {
    try {
      if (!files || files.length === 0) return [];
      
      if (files.length > this.maxImagesPerPost) {
        throw new Error(`يمكن رفع ${this.maxImagesPerPost} صور كحد أقصى`);
      }

      const uploadPromises = files.map(file => this.uploadImage(file, userId));
      const images = await Promise.all(uploadPromises);
      
      return images;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  // حذف صورة من Cloudinary
  async deleteImage(publicId) {
    try {
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  // حذف جميع صور بوست
  async deletePostImages(images) {
    try {
      if (images && images.length > 0) {
        const deletePromises = images.map(img => 
          this.deleteImage(img.publicId)
        );
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('Error deleting post images:', error);
    }
  }

  // إنشاء بوست جديد مع الصور
  async createPost(postData, files, userId) {
    try {
      // رفع الصور إذا وجدت
      let images = [];
      if (files && files.length > 0) {
        images = await this.uploadMultipleImages(files, userId);
      }

      const post = new Post({
        ...postData,
        author: userId,
        images: images.map(img => ({
          url: img.url,
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          format: img.format
        }))
      });
      
      await post.save();
      
      // إضافة البوست إلى ملف المستخدم
      await User.findByIdAndUpdate(userId, {
        $push: { posts: post._id }
      });
      
      return post;
    } catch (error) {
      // إذا فشل الإنشاء، حذف الصور المرفوعة
      if (images && images.length > 0) {
        await this.deletePostImages(images);
      }
      throw error;
    }
  }

  // تحديث بوست مع الصور
  async updatePost(postId, updateData, files, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      
      // التحقق من أن المستخدم هو صاحب البوست
      if (post.author.toString() !== userId) {
        throw new Error('Only the post owner can update this post');
      }
      
      // معالجة الصور الجديدة
      let newImages = [];
      if (files && files.length > 0) {
        newImages = await this.uploadMultipleImages(files, userId);
      }
      
      // دمج الصور الجديدة مع القديمة (إذا لم يتم حذف القديمة)
      const keepExistingImages = updateData.keepImages !== false;
      const updatedImages = keepExistingImages 
        ? [...post.images, ...newImages.map(img => ({
            url: img.url,
            publicId: img.publicId,
            width: img.width,
            height: img.height,
            format: img.format
          }))]
        : newImages.map(img => ({
            url: img.url,
            publicId: img.publicId,
            width: img.width,
            height: img.height,
            format: img.format
          }));
      
      // حذف الصور القديمة إذا تم طلب عدم الاحتفاظ بها
      if (!keepExistingImages && post.images.length > 0) {
        await this.deletePostImages(post.images);
      }
      
      // تحديث البوست
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          ...updateData,
          images: updatedImages,
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      return updatedPost;
    } catch (error) {
      throw error;
    }
  }

  // حذف بوست
  async deletePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      
      // التحقق من أن المستخدم هو صاحب البوست
      if (post.author.toString() !== userId) {
        throw new Error('Only the post owner can delete this post');
      }
      
      // حذف الصور المرتبطة
      if (post.images && post.images.length > 0) {
        await this.deletePostImages(post.images);
      }
      
      // حذف البوست
      await Post.findByIdAndDelete(postId);
      
      // إزالة البوست من ملف المستخدم
      await User.findByIdAndUpdate(userId, {
        $pull: { posts: postId }
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // حذف صورة محددة من البوست
  async deletePostImage(postId, imageIndex, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      
      // التحقق من أن المستخدم هو صاحب البوست
      if (post.author.toString() !== userId) {
        throw new Error('Only the post owner can delete images');
      }
      
      if (imageIndex >= post.images.length) {
        throw new Error('Image not found');
      }
      
      // حذف الصورة من Cloudinary
      const imageToDelete = post.images[imageIndex];
      await this.deleteImage(imageToDelete.publicId);
      
      // إزالة الصورة من المصفوفة
      post.images.splice(imageIndex, 1);
      await post.save();
      
      return post;
    } catch (error) {
      throw error;
    }
  }

  // جلب البوستات
  async getPosts(filters = {}, page = 1, limit = 10) {
    try {
      const query = { ...filters };
      
      // فلترة حسب النوع
      if (filters.type) {
        query.type = filters.type;
      }
      
      // فلترة حسب الحالة
      if (filters.status) {
        query.status = filters.status;
      }
      
      // فلترة حسب الفئة
      if (filters.category) {
        query.category = filters.category;
      }
      
      // فلترة حسب الموقع
      if (filters.location) {
        query.location = { $regex: filters.location, $options: 'i' };
      }
      
      // فلترة حسب الميزانية
      if (filters.minBudget || filters.maxBudget) {
        query.budget = {};
        if (filters.minBudget) query.budget.$gte = filters.minBudget;
        if (filters.maxBudget) query.budget.$lte = filters.maxBudget;
      }
      
      const posts = await Post.find(query)
        .populate('author', 'username profileImage role rating stats')
        .populate('proposals.artisan', 'username profileImage role rating professionalInfo')
        .populate('selectedArtisan', 'username profileImage role rating')
        .populate('ratings.reviewer', 'username profileImage')
        .populate('ratings.reviewee', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Post.countDocuments(query);
      
      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  // جلب بوست بواسطة ID
  async getPostById(postId) {
    try {
      const post = await Post.findById(postId)
        .populate('author', 'username profileImage role location rating stats professionalInfo')
        .populate('proposals.artisan', 'username profileImage role rating professionalInfo')
        .populate('selectedArtisan', 'username profileImage role rating professionalInfo')
        .populate('ratings.reviewer', 'username profileImage')
        .populate('ratings.reviewee', 'username profileImage');
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // زيادة عدد المشاهدات
      post.stats.views += 1;
      await post.save();
      
      return post;
    } catch (error) {
      throw error;
    }
  }
  
  // تقديم عرض على بوست
  async submitProposal(postId, userId, proposalData) {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      
      // التحقق من أن البوست لا يزال مفتوحاً
      if (post.status !== 'open') {
        throw new Error('This post is no longer accepting proposals');
      }
      
      // التحقق من عدم تقديم عرض مسبق
      const existingProposal = post.proposals.find(
        p => p.artisan.toString() === userId
      );
      if (existingProposal) {
        throw new Error('You have already submitted a proposal for this post');
      }
      
      // إضافة العرض
      post.proposals.push({
        artisan: userId,
        ...proposalData
      });
      post.stats.proposalsCount += 1;
      
      await post.save();
      
      // إرسال إشعار لصاحب البوست
      await this.createNotification({
        recipient: post.author,
        sender: userId,
        type: 'new_proposal',
        title: 'عرض جديد على طلبك',
        message: `تم استلام عرض جديد من مستخدم على طلبك: ${post.title}`,
        relatedId: post._id,
        relatedModel: 'Post'
      });
      
      return post;
    } catch (error) {
      throw error;
    }
  }
  
  // اختيار عرض
  async selectProposal(postId, proposalId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      
      // التحقق من أن المستخدم هو صاحب البوست
      if (post.author.toString() !== userId) {
        throw new Error('Only the post owner can select a proposal');
      }
      
      // التحقق من أن البوست لا يزال مفتوحاً
      if (post.status !== 'open') {
        throw new Error('This post is no longer open');
      }
      
      const proposal = post.proposals.id(proposalId);
      if (!proposal) throw new Error('Proposal not found');
      
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
      await this.createNotification({
        recipient: proposal.artisan,
        sender: userId,
        type: 'proposal_accepted',
        title: 'تم قبول عرضك',
        message: `تم قبول عرضك على طلب: ${post.title}`,
        relatedId: post._id,
        relatedModel: 'Post'
      });
      
      return post;
    } catch (error) {
      throw error;
    }
  }
  
  // إكمال العمل
  async completeWork(postId, userId, workDetails) {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      
      // التحقق من أن المستخدم هو صاحب البوست أو الحرفي المختار
      const isAuthor = post.author.toString() === userId;
      const isArtisan = post.selectedArtisan?.toString() === userId;
      
      if (!isAuthor && !isArtisan) {
        throw new Error('Only the post owner or selected artisan can complete the work');
      }
      
      // تحديث تفاصيل العمل
      post.workDetails = {
        ...post.workDetails,
        ...workDetails,
        endDate: new Date()
      };
      post.status = 'completed';
      
      await post.save();
      
      // إضافة العمل إلى ملفات المستخدمين
      await User.findByIdAndUpdate(post.author, {
        $push: { completedJobs: post._id }
      });
      
      await User.findByIdAndUpdate(post.selectedArtisan, {
        $push: { completedJobs: post._id }
      });
      
      return post;
    } catch (error) {
      throw error;
    }
  }
  
  // إضافة تقييم
  async addRating(postId, userId, ratingData) {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');
      
      // التحقق من أن العمل قد اكتمل
      if (post.status !== 'completed') {
        throw new Error('Cannot rate an incomplete work');
      }
      
      // التحقق من أن المستخدم هو صاحب البوست أو الحرفي
      const isAuthor = post.author.toString() === userId;
      const isArtisan = post.selectedArtisan?.toString() === userId;
      
      if (!isAuthor && !isArtisan) {
        throw new Error('Only participants can rate this work');
      }
      
      // تحديد من يتم تقييمه
      const reviewee = isAuthor ? post.selectedArtisan : post.author;
      
      // التحقق من عدم وجود تقييم مسبق
      const existingRating = post.ratings.find(
        r => r.reviewer.toString() === userId && r.reviewee.toString() === reviewee
      );
      
      if (existingRating) {
        throw new Error('You have already rated this work');
      }
      
      // إضافة التقييم
      post.ratings.push({
        reviewer: userId,
        reviewee,
        ...ratingData
      });
      
      await post.save();
      
      // تحديث متوسط التقييم للمستخدم
      await this.updateUserRating(reviewee);
      
      return post;
    } catch (error) {
      throw error;
    }
  }
  
  // تحديث تقييم المستخدم
  async updateUserRating(userId) {
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
      throw error;
    }
  }
  
  // جلب بوستات المستخدم
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const posts = await Post.find({ author: userId })
        .populate('author', 'username profileImage role')
        .populate('selectedArtisan', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Post.countDocuments({ author: userId });
      
      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  // جلب بوستات تم العمل عليها
  async getUserWorkedPosts(userId, page = 1, limit = 10) {
    try {
      const posts = await Post.find({ 
        $or: [
          { author: userId },
          { selectedArtisan: userId }
        ],
        status: 'completed'
      })
        .populate('author', 'username profileImage role')
        .populate('selectedArtisan', 'username profileImage')
        .populate('ratings', 'reviewer reviewee rating comment')
        .sort({ 'workDetails.endDate': -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Post.countDocuments({ 
        $or: [
          { author: userId },
          { selectedArtisan: userId }
        ],
        status: 'completed'
      });
      
      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  // إنشاء إشعار
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // إرسال عبر Socket إذا كان متاحاً
      try {
        const io = require('../socket').getIO();
        if (io) {
          io.to(notificationData.recipient.toString()).emit('notification:new', notification);
        }
      } catch (socketError) {
        console.error('Socket notification error:', socketError);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }
}

module.exports = new PostService();