// backend/src/services/notificationService.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';

class NotificationService {
  constructor(io = null) {
    this.io = io;
  }

  setIO(io) {
    this.io = io;
  }

  async createNotification(notificationData) {
    try {
      // التحقق من وجود المستخدم المستلم
      const recipient = await User.findById(notificationData.recipient);
      if (!recipient) {
        console.log(`Recipient ${notificationData.recipient} not found`);
        return null;
      }

      // لا ترسل إشعار للمستخدم نفسه
      if (notificationData.sender && notificationData.sender.toString() === notificationData.recipient.toString()) {
        console.log('Skipping self notification');
        return null;
      }

      const notification = new Notification(notificationData);
      await notification.save();

      // إرسال عبر Socket.IO
      if (this.io) {
        this.io.to(`user:${notificationData.recipient}`).emit('notification:new', {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          relatedId: notification.relatedId,
          relatedModel: notification.relatedModel,
          metadata: notification.metadata,
          createdAt: notification.createdAt
        });
      }

      console.log(`📧 Notification sent to ${notificationData.recipient}: ${notificationData.type}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // إشعار إعجاب
  async notifyLike(recipientId, senderId, postId, postTitle, senderUsername) {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'like',
      title: 'إعجاب جديد ❤️',
      message: `${senderUsername} أعجب ببوستك "${postTitle.substring(0, 50)}"`,
      relatedId: postId,
      relatedModel: 'Post',
      metadata: { postTitle }
    });
  }

  // إشعار حفظ بوست
  async notifySave(recipientId, senderId, postId, postTitle, senderUsername) {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'save',
      title: 'تم حفظ بوستك 📌',
      message: `${senderUsername} حفظ بوستك "${postTitle.substring(0, 50)}"`,
      relatedId: postId,
      relatedModel: 'Post',
      metadata: { postTitle }
    });
  }

  // إشعار مشاركة
  async notifyShare(recipientId, senderId, postId, postTitle, senderUsername) {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'share',
      title: 'تمت المشاركة 🔗',
      message: `${senderUsername} شارك بوستك "${postTitle.substring(0, 50)}"`,
      relatedId: postId,
      relatedModel: 'Post',
      metadata: { postTitle }
    });
  }

  // إشعار تقييم بروفايل
  async notifyReview(recipientId, senderId, reviewId, rating, comment, senderUsername) {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'review',
      title: 'تقييم جديد ⭐',
      message: `${senderUsername} قيمك بـ ${rating}/5 نجوم`,
      relatedId: reviewId,
      relatedModel: 'Review',
      metadata: { rating, comment: comment?.substring(0, 100) }
    });
  }

  // جلب إشعارات المستخدم
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .populate('sender', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // تعليم إشعار كمقروء
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
    return notification;
  }

  // تعليم جميع الإشعارات كمقروءة
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
    return result.modifiedCount;
  }

  // جلب عدد الإشعارات غير المقروءة
  async getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, read: false });
  }

  // حذف إشعار
  async deleteNotification(notificationId, userId) {
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    return result;
  }
}

export default new NotificationService();