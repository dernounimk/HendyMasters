import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Block from '../models/Block.js';

const canUsersMessage = async (user1Id, user2Id) => {
  try {
    const [user1, user2] = await Promise.all([
      User.findById(user1Id).select('_id username role isActive'),
      User.findById(user2Id).select('_id username role isActive')
    ]);
    
    if (!user1 || !user2) {
      return { allowed: false, reason: 'أحد المستخدمين غير موجود' };
    }
    
    // لا يمكن مراسلة النفس
    if (user1._id.toString() === user2._id.toString()) {
      return { allowed: false, reason: 'لا يمكنك مراسلة نفسك' };
    }
    
    // التحقق من نشاط المستخدمين
    if (!user1.isActive || !user2.isActive) {
      return { allowed: false, reason: 'أحد المستخدمين غير نشط' };
    }
    
    // الحصول على الأدوار المسموح للمستخدم الأول بالتواصل معها
    const getAllowedMessageRecipients = (role) => {
      switch(role) {
        case 'client':
          return ['artisan'];
        case 'artisan':
          return ['client', 'worker'];
        case 'worker':
          return ['artisan'];
        default:
          return [];
      }
    };
    
    const allowedRoles1 = getAllowedMessageRecipients(user1.role);
    const allowedRoles2 = getAllowedMessageRecipients(user2.role);
    
    // التحقق من أن المستخدم الأول يمكنه مراسلة المستخدم الثاني
    if (!allowedRoles1.includes(user2.role)) {
      const roleNames = { client: 'العميل', artisan: 'الحرفي', worker: 'العامل' };
      return { 
        allowed: false, 
        reason: `لا يمكن لـ ${roleNames[user1.role]} مراسلة ${roleNames[user2.role]}` 
      };
    }
    
    // التحقق من أن المستخدم الثاني يمكنه استقبال رسائل من المستخدم الأول
    if (!allowedRoles2.includes(user1.role)) {
      const roleNames = { client: 'العميل', artisan: 'الحرفي', worker: 'العامل' };
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

export const startConversation = async (req, res) => {
  try {
    const { recipientId, initialMessage } = req.body;
    
    const permission = await canUsersMessage(req.user.id, recipientId);
    
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.reason
      });
    }
    
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId], $size: 2 }
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId],
        lastMessageAt: new Date()
      });
    }
    
    if (initialMessage && initialMessage.trim()) {
      const message = await Message.create({
        conversation: conversation._id,
        sender: req.user.id,
        content: initialMessage.trim(),
        readBy: [req.user.id]
      });
      
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = message.createdAt;
      await conversation.save();
      
      const io = req.app.get('io');
      if (io) {
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username profileImage');
        
        io.to(recipientId).emit('message:new', {
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
      data: populatedConversation
    });
    
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const blockedUsers = await Block.find({ blocker: req.user.id }).distinct('blocked');
    const conversations = await Conversation.find({
      participants: req.user.id,
      'participants': { $nin: blockedUsers } // تجاهل المحادثات مع المحظورين
    })
      .populate('participants', 'username profileImage role isOnline')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username profileImage' }
      })
      .sort({ lastMessageAt: -1 });
    
    const filteredConversations = [];
    
    for (const conv of conversations) {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== req.user.id);
      
      if (otherParticipant) {
        const permission = await canUsersMessage(req.user.id, otherParticipant._id);
        
        if (permission.allowed) {
          const unreadCount = await Message.countDocuments({
            conversation: conv._id,
            sender: { $ne: req.user.id },
            readBy: { $ne: req.user.id }
          });
          
          filteredConversations.push({
            ...conv.toObject(),
            unreadCount
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: filteredConversations
    });
    
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user.id
    }).populate('participants', 'username profileImage role');
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه المحادثة'
      });
    }
    
    const otherParticipant = conversation.participants.find(p => p._id.toString() !== req.user.id);
    
    if (otherParticipant) {
      const permission = await canUsersMessage(req.user.id, otherParticipant._id);
      
      if (!permission.allowed) {
        return res.status(403).json({
          success: false,
          message: permission.reason
        });
      }
    }
    
    const messages = await Message.find({ conversation: id })
      .populate('sender', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: messages.reverse(),
      hasMore: messages.length === parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );
    
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


export const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    }).populate('participants', 'username profileImage role');
    
    let totalUnread = 0;
    
    for (const conv of conversations) {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== req.user.id);
      
      if (otherParticipant) {
        const permission = await canUsersMessage(req.user.id, otherParticipant._id);
        
        if (permission.allowed) {
          const unreadCount = await Message.countDocuments({
            conversation: conv._id,
            sender: { $ne: req.user.id },
            readBy: { $ne: req.user.id }
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

export const checkMessagingPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const permission = await canUsersMessage(req.user.id, userId);
    
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
// @access  Private
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // التحقق من وجود المحادثة وأن المستخدم مشارك فيها
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
    
    // حذف جميع الرسائل
    await Message.deleteMany({ conversation: id });
    
    // حذف المحادثة
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