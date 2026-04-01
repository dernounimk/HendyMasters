// backend/src/controllers/notificationController.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const notifications = await Notification.find({
      recipient: req.user.id
    })
      .populate('sender', 'username profileImage role')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let enriched = notification.toObject();
        
        if (notification.referenceId && notification.referenceModel) {
          try {
            if (notification.referenceModel === 'Post') {
              const post = await Post.findById(notification.referenceId)
                .select('title type images');
              if (post) {
                enriched.reference = {
                  id: post._id,
                  title: post.title,
                  type: post.type,
                  image: post.images?.[0]?.url
                };
              }
            } else if (notification.referenceModel === 'User') {
              const user = await User.findById(notification.referenceId)
                .select('username profileImage');
              if (user) {
                enriched.reference = {
                  id: user._id,
                  username: user.username,
                  profileImage: user.profileImage
                };
              }
            }
          } catch (err) {
            console.error('Error enriching notification:', err);
          }
        }
        
        return enriched;
      })
    );
    
    res.json({
      success: true,
      data: {
        notifications: enrichedNotifications,
        unreadCount,
        hasMore: notifications.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { read: true },
      { new: true }
    ).populate('sender', 'username profileImage');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      message: 'تم تعليم جميع الإشعارات كمقروءة'
    });
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }
    
    res.json({
      success: true,
      message: 'تم حذف الإشعار'
    });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
    
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};