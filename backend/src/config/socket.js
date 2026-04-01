// backend/src/socket/index.js
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const onlineUsers = new Map();

// ✅ دالة التحقق من صلاحية التواصل بين مستخدمين
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
          return ['artisan']; // العميل يمكنه التواصل مع الحرفي فقط
        case 'artisan':
          return ['client', 'worker']; // الحرفي يمكنه التواصل مع العميل والعامل
        case 'worker':
          return ['artisan']; // العامل يمكنه التواصل مع الحرفي فقط
        default:
          return [];
      }
    };
    
    const allowedRoles1 = getAllowedMessageRecipients(user1.role);
    const allowedRoles2 = getAllowedMessageRecipients(user2.role);
    
    // التحقق من أن المستخدم الأول يمكنه مراسلة المستخدم الثاني
    if (!allowedRoles1.includes(user2.role)) {
      return { 
        allowed: false, 
        reason: `لا يمكن لـ ${getRoleName(user1.role)} مراسلة ${getRoleName(user2.role)}` 
      };
    }
    
    // التحقق من أن المستخدم الثاني يمكنه استقبال رسائل من المستخدم الأول
    if (!allowedRoles2.includes(user1.role)) {
      return { 
        allowed: false, 
        reason: `لا يمكن لـ ${getRoleName(user2.role)} استقبال رسائل من ${getRoleName(user1.role)}` 
      };
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('Error checking messaging permission:', error);
    return { allowed: false, reason: 'حدث خطأ في التحقق من الصلاحيات' };
  }
};

// دالة مساعدة للحصول على اسم الدور بالعربية
const getRoleName = (role) => {
  const roleNames = {
    client: 'العميل',
    artisan: 'الحرفي',
    worker: 'العامل'
  };
  return roleNames[role] || role;
};

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // مصادقة Socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id username profileImage role isOnline isActive');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      if (!user.isActive) {
        return next(new Error('User account is disabled'));
      }

      socket.user = {
        _id: user._id.toString(),
        username: user.username,
        profileImage: user.profileImage,
        role: user.role
      };
      
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (Role: ${socket.user.role})`);

    onlineUsers.set(socket.user._id, {
      socketId: socket.id,
      user: socket.user
    });

    updateUserStatus(socket.user._id, true);
    io.emit('users:online', getOnlineUsersList());
    socket.join(`user:${socket.user._id}`);

    // ✅ التحقق من صلاحية التواصل مع مستخدم
    socket.on('messaging:check', async (data, callback) => {
      try {
        const { userId } = data;
        
        if (!userId) {
          if (callback && typeof callback === 'function') {
            callback({ allowed: false, reason: 'معرف المستخدم مطلوب' });
          }
          return;
        }
        
        const permission = await canUsersMessage(socket.user._id, userId);
        
        if (permission.allowed) {
          const targetUser = await User.findById(userId).select('username profileImage role');
          if (callback && typeof callback === 'function') {
            callback({ 
              allowed: true, 
              data: targetUser,
              reason: null
            });
          }
        } else {
          if (callback && typeof callback === 'function') {
            callback({ 
              allowed: false, 
              reason: permission.reason 
            });
          }
        }
        
      } catch (error) {
        console.error('Error checking messaging permission:', error);
        if (callback && typeof callback === 'function') {
          callback({ allowed: false, reason: error.message });
        }
      }
    });

    // ✅ الحصول على المستخدمين المسموح بالتواصل معهم
    socket.on('messaging:allowed-recipients', async (data, callback) => {
      try {
        const getAllowedRoles = (role) => {
          switch(role) {
            case 'client': return ['artisan'];
            case 'artisan': return ['client', 'worker'];
            case 'worker': return ['artisan'];
            default: return [];
          }
        };
        
        const allowedRoles = getAllowedRoles(socket.user.role);
        
        const recipients = await User.find({
          _id: { $ne: socket.user._id },
          role: { $in: allowedRoles },
          isActive: true
        }).select('username profileImage role isOnline location');
        
        if (callback && typeof callback === 'function') {
          callback({ success: true, data: recipients });
        }
        
      } catch (error) {
        console.error('Error getting allowed recipients:', error);
        if (callback && typeof callback === 'function') {
          callback({ success: false, message: error.message, data: [] });
        }
      }
    });

    // ✅ إنشاء محادثة جديدة مع التحقق من الصلاحيات
socket.on('conversation:start', async (data, callback) => {
  try {
    const { recipientId, initialMessage } = data;
    
    console.log(`📨 Starting conversation between ${socket.user.username} (${socket.user.role}) and ${recipientId}`);
    
    if (!recipientId) {
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: 'معرف المستلم مطلوب' });
      }
      return;
    }
    
    // التحقق من أن المستخدم لا يرسل لنفسه
    if (recipientId === socket.user._id) {
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: 'لا يمكنك بدء محادثة مع نفسك' });
      }
      return;
    }
    
    // التحقق من وجود المستلم
    const recipient = await User.findById(recipientId).select('_id username role');
    if (!recipient) {
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: 'المستخدم المطلوب غير موجود' });
      }
      return;
    }
    
    // ✅ البحث عن محادثة موجودة بشكل صحيح
    let conversation = await Conversation.findOne({
      participants: { $all: [socket.user._id, recipientId], $size: 2 }
    });
    
    // ✅ إذا لم توجد محادثة، قم بإنشاء واحدة جديدة
    if (!conversation) {
      console.log(`Creating new conversation between ${socket.user.username} and ${recipient.username}`);
      
      try {
        conversation = await Conversation.create({
          participants: [socket.user._id, recipientId]
        });
        console.log(`✅ Conversation created: ${conversation._id}`);
      } catch (createError) {
        console.error('Error creating conversation:', createError);
        
        // إذا كان الخطأ بسبب التكرار، حاول البحث مرة أخرى
        if (createError.code === 11000) {
          conversation = await Conversation.findOne({
            participants: { $all: [socket.user._id, recipientId], $size: 2 }
          });
          
          if (!conversation) {
            throw new Error('Failed to find existing conversation after duplicate error');
          }
        } else {
          throw createError;
        }
      }
    }
    
    // التأكد من وجود المحادثة
    if (!conversation) {
      throw new Error('Failed to create or find conversation');
    }
    
    // Populate participants
    await conversation.populate('participants', 'username profileImage role');
    
    let message = null;
    if (initialMessage && initialMessage.trim()) {
      message = await Message.create({
        conversation: conversation._id,
        sender: socket.user._id,
        content: initialMessage.trim(),
        readBy: [socket.user._id]
      });
      
      await message.populate('sender', 'username profileImage');
      
      // إرسال إشعار للمستلم
      const recipientSocket = getSocketByUserId(recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('message:new', {
          conversationId: conversation._id,
          message
        });
      }
      
      // تحديث آخر رسالة في المحادثة
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = message.createdAt;
      await conversation.save();
    }
    
    if (callback && typeof callback === 'function') {
      callback({
        success: true,
        data: { 
          conversation: conversation.toObject(), 
          message: message ? message.toObject() : null 
        }
      });
    }
    
  } catch (error) {
    console.error('Error starting conversation:', error);
    if (callback && typeof callback === 'function') {
      callback({ success: false, message: error.message || 'فشل في إنشاء المحادثة' });
    }
  }
});

    // ✅ إرسال رسالة مع التحقق من الصلاحيات
    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, recipientId, content } = data;
        
        if (!content?.trim()) {
          if (callback && typeof callback === 'function') {
            callback({ success: false, message: 'الرسالة لا يمكن أن تكون فارغة' });
          }
          return;
        }
        
        let conversation;
        let targetRecipientId = recipientId;
        
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            if (callback && typeof callback === 'function') {
              callback({ success: false, message: 'المحادثة غير موجودة' });
            }
            return;
          }
          
          // تحديد المستلم من المحادثة
          targetRecipientId = conversation.participants.find(
            p => p.toString() !== socket.user._id
          );
          
        } else if (recipientId) {
          // ✅ التحقق من صلاحية التواصل قبل إنشاء محادثة جديدة
          const permission = await canUsersMessage(socket.user._id, recipientId);
          
          if (!permission.allowed) {
            if (callback && typeof callback === 'function') {
              callback({ success: false, message: permission.reason });
            }
            return;
          }
          
          conversation = await Conversation.findOne({
            participants: { $all: [socket.user._id, recipientId] }
          });
          
          if (!conversation) {
            try {
              conversation = await Conversation.create({
                participants: [socket.user._id, recipientId]
              });
            } catch (createError) {
              if (createError.code === 11000) {
                conversation = await Conversation.findOne({
                  participants: { $all: [socket.user._id, recipientId] }
                });
              } else {
                throw createError;
              }
            }
          }
          
          targetRecipientId = recipientId;
        } else {
          if (callback && typeof callback === 'function') {
            callback({ success: false, message: 'معرف المحادثة أو المستلم مطلوب' });
          }
          return;
        }
        
        if (!conversation) {
          if (callback && typeof callback === 'function') {
            callback({ success: false, message: 'المحادثة غير موجودة' });
          }
          return;
        }
        
        // التحقق من أن المستخدم مشارك في المحادثة
        if (!conversation.participants.some(p => p.toString() === socket.user._id)) {
          if (callback && typeof callback === 'function') {
            callback({ success: false, message: 'غير مصرح لك بالرسالة في هذه المحادثة' });
          }
          return;
        }
        
        // ✅ التحقق من صلاحية التواصل مرة أخرى للتأكد
        if (targetRecipientId) {
          const permission = await canUsersMessage(socket.user._id, targetRecipientId);
          if (!permission.allowed) {
            if (callback && typeof callback === 'function') {
              callback({ success: false, message: permission.reason });
            }
            return;
          }
        }
        
        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          content: content.trim(),
          readBy: [socket.user._id]
        });
        
        const populatedMessage = await message.populate('sender', 'username profileImage');
        
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
        
        // إرسال للمشارك الآخر
        const recipient = conversation.participants.find(
          p => p.toString() !== socket.user._id
        );
        
        if (recipient) {
          const recipientSocket = getSocketByUserId(recipient.toString());
          if (recipientSocket) {
            io.to(recipientSocket).emit('message:new', {
              conversationId: conversation._id,
              message: populatedMessage
            });
          }
        }
        
        if (callback && typeof callback === 'function') {
          callback({
            success: true,
            data: {
              conversationId: conversation._id,
              message: populatedMessage
            }
          });
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        if (callback && typeof callback === 'function') {
          callback({ success: false, message: error.message });
        }
      }
    });

    // جلب المحادثات - تصفية حسب الصلاحيات
    socket.on('conversations:fetch', async (data, callback) => {
      try {
        const { page = 1, limit = 20 } = data || {};
        
        const conversations = await Conversation.find({
          participants: socket.user._id
        })
          .populate('participants', 'username profileImage role')
          .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'username profileImage' }
          })
          .sort({ lastMessageAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        
        // ✅ تصفية المحادثات حسب صلاحية التواصل
        const filteredConversations = [];
        
        for (const conv of conversations) {
          const otherParticipant = conv.participants.find(
            p => p._id.toString() !== socket.user._id
          );
          
          if (otherParticipant) {
            const permission = await canUsersMessage(socket.user._id, otherParticipant._id);
            
            if (permission.allowed) {
              const unreadCount = await Message.countDocuments({
                conversation: conv._id,
                sender: { $ne: socket.user._id },
                readBy: { $ne: socket.user._id }
              });
              filteredConversations.push({ ...conv.toObject(), unreadCount });
            }
          }
        }
        
        if (callback && typeof callback === 'function') {
          callback({ success: true, data: filteredConversations });
        }
        
      } catch (error) {
        console.error('Error fetching conversations:', error);
        if (callback && typeof callback === 'function') {
          callback({ success: false, message: error.message });
        }
      }
    });

    // جلب الرسائل مع التحقق من الصلاحيات
    socket.on('messages:fetch', async (data, callback) => {
      try {
        const { conversationId, page = 1, limit = 50 } = data;
        
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id
        }).populate('participants', 'username profileImage role');
        
        if (!conversation) {
          if (callback && typeof callback === 'function') {
            callback({ success: false, message: 'غير مصرح لك بالوصول' });
          }
          return;
        }
        
        // ✅ التحقق من صلاحية التواصل مع الطرف الآخر
        const otherParticipant = conversation.participants.find(
          p => p._id.toString() !== socket.user._id
        );
        
        if (otherParticipant) {
          const permission = await canUsersMessage(socket.user._id, otherParticipant._id);
          
          if (!permission.allowed) {
            if (callback && typeof callback === 'function') {
              callback({ success: false, message: permission.reason });
            }
            return;
          }
        }
        
        const messages = await Message.find({ conversation: conversationId })
          .populate('sender', 'username profileImage')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        
        if (callback && typeof callback === 'function') {
          callback({
            success: true,
            data: messages.reverse(),
            hasMore: messages.length === limit
          });
        }
        
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (callback && typeof callback === 'function') {
          callback({ success: false, message: error.message });
        }
      }
    });

    // وضع علامة مقروء
    socket.on('messages:read', async (data) => {
      try {
        const { conversationId } = data;
        
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.user._id },
            readBy: { $ne: socket.user._id }
          },
          { $addToSet: { readBy: socket.user._id } }
        );
        
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          const sender = conversation.participants.find(
            p => p.toString() !== socket.user._id
          );
          
          if (sender) {
            const senderSocket = getSocketByUserId(sender.toString());
            if (senderSocket) {
              io.to(senderSocket).emit('messages:read', {
                conversationId,
                readBy: socket.user._id
              });
            }
          }
        }
        
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // بدء الكتابة - مع التحقق من الصلاحية
    socket.on('typing:start', async (data) => {
      try {
        const { conversationId, recipientId } = data;
        
        // التحقق من صلاحية التواصل قبل إرسال إشعار الكتابة
        if (recipientId) {
          const permission = await canUsersMessage(socket.user._id, recipientId);
          if (!permission.allowed) return;
        }
        
        const recipientSocket = getSocketByUserId(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('typing:start', {
            conversationId,
            userId: socket.user._id,
            username: socket.user.username
          });
        }
      } catch (error) {
        console.error('Error in typing:start:', error);
      }
    });

    // إنهاء الكتابة
    socket.on('typing:stop', async (data) => {
      try {
        const { conversationId, recipientId } = data;
        
        const recipientSocket = getSocketByUserId(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('typing:stop', {
            conversationId,
            userId: socket.user._id
          });
        }
      } catch (error) {
        console.error('Error in typing:stop:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
      onlineUsers.delete(socket.user._id);
      updateUserStatus(socket.user._id, false);
      io.emit('users:online', getOnlineUsersList());
    });
  });
const getSocketByUserId = (userId) => {
  if (!userId) return null;
  const userIdStr = userId.toString();
  return onlineUsers.get(userIdStr)?.socketId;
};

const getOnlineUsersList = () => {
  const users = [];
  for (const [userId, data] of onlineUsers) {
    users.push({
      id: userId,
      username: data.user.username,
      profileImage: data.user.profileImage,
      role: data.user.role
    });
  }
  return users;
};

const updateUserStatus = async (userId, isOnline) => {
  try {
    // ✅ التحقق من اتصال قاعدة البيانات
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Database not connected, skipping user status update');
      return;
    }
    
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: isOnline ? null : new Date()
    });
  } catch (error) {
    // ✅ تجاهل أخطاء الشبكة
    if (error.name !== 'MongoNetworkError' && error.name !== 'MongoServerSelectionError') {
      console.error('Error updating user status:', error);
    }
  }
};

  return io;
};

export default configureSocket;