// backend/src/controllers/messageController.js
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Block from '../models/Block.js';

// دالة التحقق من صلاحية التواصل
const canUsersMessage = async (user1Id, user2Id) => {
  try {
    const [user1, user2] = await Promise.all([
      User.findById(user1Id).select('_id username role isActive'),
      User.findById(user2Id).select('_id username role isActive')
    ]);
    
    if (!user1 || !user2) {
      return { allowed: false, reason: 'أحد المستخدمين غير موجود' };
    }
    
    if (user1._id.toString() === user2._id.toString()) {
      return { allowed: false, reason: 'لا يمكنك مراسلة نفسك' };
    }
    
    if (!user1.isActive || !user2.isActive) {
      return { allowed: false, reason: 'أحد المستخدمين غير نشط' };
    }
    
    // التحقق من الحظر
    const isBlocked = await Block.findOne({
      $or: [
        { blocker: user1Id, blocked: user2Id },
        { blocker: user2Id, blocked: user1Id }
      ]
    });
    
    if (isBlocked) {
      return { allowed: false, reason: 'لا يمكنك التواصل مع هذا المستخدم' };
    }
    
    const getAllowedMessageRecipients = (role) => {
      switch(role) {
        case 'client': return ['artisan'];
        case 'artisan': return ['client', 'worker'];
        case 'worker': return ['artisan'];
        default: return [];
      }
    };
    
    const allowedRoles1 = getAllowedMessageRecipients(user1.role);
    const allowedRoles2 = getAllowedMessageRecipients(user2.role);
    
    const roleNames = { client: 'العميل', artisan: 'الحرفي', worker: 'العامل' };
    
    if (!allowedRoles1.includes(user2.role)) {
      return { 
        allowed: false, 
        reason: `لا يمكن لـ ${roleNames[user1.role]} مراسلة ${roleNames[user2.role]}` 
      };
    }
    
    if (!allowedRoles2.includes(user1.role)) {
      return { 
        allowed: false, 
        reason: `لا يمكن لـ ${roleNames[user2.role]} استقبال رسائل من ${roleNames[user1.role]}` 
      };
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('Error checking messaging permission:', error);
    return { allowed: false, reason: 'حدث خطأ في التحقق من الصلاحيات' };
  }
};

// @desc    إنشاء محادثة جديدة
// @route   POST /api/messages/conversations
export const startConversation = async (req, res) => {
  try {
    const { recipientId, initialMessage } = req.body;
    const senderId = req.user.id;
    
    console.log(`📨 Starting conversation between ${senderId} and ${recipientId}`);
    
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستلم مطلوب'
      });
    }
    
    const permission = await canUsersMessage(senderId, recipientId);
    
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.reason
      });
    }
    
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 }
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        lastMessageAt: new Date()
      });
      console.log(`✅ New conversation created: ${conversation._id}`);
    }
    
    let message = null;
    if (initialMessage && initialMessage.trim()) {
      message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        recipient: recipientId,
        content: initialMessage.trim(),
        readBy: [senderId]
      });
      
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = message.createdAt;
      await conversation.save();
      
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username profileImage');
      
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${recipientId}`).emit('message:new', {
          conversationId: conversation._id,
          message: populatedMessage
        });
      }
    }
    
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username profileImage role isOnline')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username profileImage' }
      });
    
    res.json({
      success: true,
      data: {
        conversation: populatedConversation,
        message: message ? await Message.findById(message._id).populate('sender', 'username profileImage') : null
      }
    });
    
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    جلب المحادثات
// @route   GET /api/messages/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // جلب قائمة المستخدمين المحظورين
    const blocks = await Block.find({
      $or: [
        { blocker: userId },
        { blocked: userId }
      ]
    });
    
    const blockedUserIds = blocks.map(block => {
      if (block.blocker.toString() === userId) return block.blocked.toString();
      return block.blocker.toString();
    });
    
    // إضافة المستخدم الحالي إلى قائمة الاستبعاد
    const excludedUsers = [...new Set([userId, ...blockedUserIds])];
    
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
      'participants.0': { $nin: excludedUsers },
      'participants.1': { $nin: excludedUsers }
    })
      .populate('participants', 'username profileImage role isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    
    // تصفية المحادثات التي تحتوي على مستخدمين محظورين أو النفس
    const filteredConversations = conversations.filter(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
      // التأكد من وجود مشارك آخر وليس المستخدم الحالي
      return otherParticipant && otherParticipant._id.toString() !== userId && !blockedUserIds.includes(otherParticipant._id.toString());
    });
    
    res.json({
      success: true,
      data: filteredConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    جلب رسائل محادثة
// @route   GET /api/messages/conversations/:id/messages
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 30 } = req.query;
    
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }
    
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه المحادثة'
      });
    }
    
    const otherParticipant = conversation.participants.find(p => p.toString() !== userId);
    
    if (otherParticipant) {
      const isBlocked = await Block.findOne({
        $or: [
          { blocker: userId, blocked: otherParticipant },
          { blocker: otherParticipant, blocked: userId }
        ]
      });
      
      if (isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بالوصول إلى هذه المحادثة'
        });
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    const messages = await Message.find({ conversation: id })
      .populate('sender', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      success: true,
      data: messages.reverse(),
      hasMore: messages.length === limitNum
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    تعليم الرسائل كمقروءة
// @route   PUT /api/messages/conversations/:id/read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    const io = req.app.get('io');
    if (io) {
      const conversation = await Conversation.findById(id);
      if (conversation) {
        const sender = conversation.participants.find(p => p.toString() !== userId);
        if (sender) {
          io.to(`user:${sender}`).emit('messages:read', {
            conversationId: id,
            readBy: userId
          });
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'تم تحديث حالة القراءة',
      updatedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    جلب عدد الرسائل غير المقروءة
// @route   GET /api/messages/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    });
    
    let totalUnread = 0;
    
    for (const conv of conversations) {
      const otherParticipant = conv.participants.find(p => p.toString() !== userId);
      
      if (otherParticipant) {
        const permission = await canUsersMessage(userId, otherParticipant);
        
        if (permission.allowed) {
          const unreadCount = await Message.countDocuments({
            conversation: conv._id,
            sender: { $ne: userId },
            readBy: { $ne: userId }
          });
          totalUnread += unreadCount;
        }
      }
    }
    
    res.json({
      success: true,
      data: { totalUnread }
    });
    
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    التحقق من صلاحية المراسلة
// @route   GET /api/messages/check/:userId
export const checkMessagingPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    const permission = await canUsersMessage(currentUserId, userId);
    
    if (permission.allowed) {
      const targetUser = await User.findById(userId).select('username profileImage role');
      res.json({
        success: true,
        data: {
          allowed: true,
          targetUser,
          reason: null
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          allowed: false,
          reason: permission.reason
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking messaging permission:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    الحصول على المستخدمين المسموح بالتواصل معهم
// @route   GET /api/messages/allowed-recipients
export const getAllowedRecipients = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    const getAllowedRoles = (role) => {
      switch(role) {
        case 'client': return ['artisan'];
        case 'artisan': return ['client', 'worker'];
        case 'worker': return ['artisan'];
        default: return [];
      }
    };
    
    const allowedRoles = getAllowedRoles(currentUser.role);
    
    const recipients = await User.find({
      _id: { $ne: req.user.id },
      role: { $in: allowedRoles },
      isActive: true
    }).select('username profileImage role isOnline location');
    
    res.json({
      success: true,
      data: recipients
    });
    
  } catch (error) {
    console.error('Error getting allowed recipients:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    حذف محادثة
// @route   DELETE /api/messages/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId
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
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف المحادثة'
    });
  }
};