// backend/controllers/chatController.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    الحصول على محادثات المستخدم
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'username profileImage role isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username profileImage'
        }
      })
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    // حساب عدد الرسائل غير المقروءة
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user.id },
          readBy: { $ne: req.user.id }
        });
        
        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );
    
    res.json({
      success: true,
      data: conversationsWithUnread
    });
    
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب المحادثات'
    });
  }
};

// @desc    الحصول على رسائل محادثة
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // التحقق من أن المستخدم مشارك في المحادثة
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول لهذه المحادثة'
      });
    }
    
    const messages = await Message.find({ conversation: id })
      .populate('sender', 'username profileImage role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: await Message.countDocuments({ conversation: id })
      }
    });
    
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب الرسائل'
    });
  }
};

// @desc    إنشاء محادثة جديدة
// @route   POST /api/chat/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    
    if (recipientId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك بدء محادثة مع نفسك'
      });
    }
    
    // التحقق من وجود المحادثة
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] }
    }).populate('participants', 'username profileImage role isOnline lastSeen');
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId]
      });
      conversation = await conversation.populate('participants', 'username profileImage role isOnline lastSeen');
    }
    
    res.json({
      success: true,
      data: conversation
    });
    
  } catch (error) {
    console.error('Error in createConversation:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء المحادثة'
    });
  }
};

// @desc    وضع علامة مقروء على الرسائل
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      {
        $addToSet: { readBy: req.user.id }
      }
    );
    
    res.json({
      success: true,
      message: 'تم تحديث حالة القراءة'
    });
    
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث حالة القراءة'
    });
  }
};

// @desc    حذف محادثة
// @route   DELETE /api/chat/conversations/:id
// @access  Private
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }
    
    await Message.deleteMany({ conversation: id });
    await conversation.deleteOne();
    
    res.json({
      success: true,
      message: 'تم حذف المحادثة بنجاح'
    });
    
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف المحادثة'
    });
  }
};