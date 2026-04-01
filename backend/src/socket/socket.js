// backend/socket/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// تخزين المستخدمين المتصلين
const onlineUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Middleware للمصادقة
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id username profileImage role isOnline');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.user._id})`);

    // إضافة المستخدم للمستخدمين المتصلين
    onlineUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user
    });

    // تحديث حالة المستخدم
    updateUserStatus(socket.user._id, true);

    // إرسال قائمة المستخدمين المتصلين للجميع
    io.emit('users:online', getOnlineUsersList());

    // الانضمام إلى غرفة المستخدم الخاصة
    socket.join(`user:${socket.user._id}`);

    // ============== أحداث المحادثات ==============
    
    // بدء محادثة جديدة
    socket.on('conversation:start', async (data, callback) => {
      try {
        const { recipientId, initialMessage } = data;
        
        // التحقق من وجود المحادثة
        let conversation = await Conversation.findOne({
          participants: { $all: [socket.user._id, recipientId] }
        }).populate('participants', 'username profileImage role');
        
        if (!conversation) {
          // إنشاء محادثة جديدة
          conversation = await Conversation.create({
            participants: [socket.user._id, recipientId]
          });
          conversation = await conversation.populate('participants', 'username profileImage role');
        }
        
        // إنشاء الرسالة إذا وجدت
        let message = null;
        if (initialMessage) {
          message = await Message.create({
            conversation: conversation._id,
            sender: socket.user._id,
            content: initialMessage,
            readBy: [socket.user._id]
          });
          
          message = await message.populate('sender', 'username profileImage');
          
          // إرسال إشعار للمستقبل
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
        
        callback({
          success: true,
          data: {
            conversation,
            message
          }
        });
        
      } catch (error) {
        console.error('Error starting conversation:', error);
        callback({ success: false, message: error.message });
      }
    });

    // إرسال رسالة
    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, content, recipientId } = data;
        
        let conversation;
        
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            return callback({ success: false, message: 'المحادثة غير موجودة' });
          }
        } else if (recipientId) {
          // إنشاء محادثة جديدة
          conversation = await Conversation.findOneAndUpdate(
            {
              participants: { $all: [socket.user._id, recipientId] }
            },
            {
              $setOnInsert: {
                participants: [socket.user._id, recipientId]
              }
            },
            { upsert: true, new: true }
          );
        } else {
          return callback({ success: false, message: 'معرف المحادثة أو المستلم مطلوب' });
        }
        
        // إنشاء الرسالة
        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          content,
          readBy: [socket.user._id]
        });
        
        const populatedMessage = await message.populate('sender', 'username profileImage role');
        
        // تحديث آخر رسالة في المحادثة
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
        
        // إرسال الرسالة للمستقبل
        const recipient = conversation.participants.find(
          p => p.toString() !== socket.user._id.toString()
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
        
        // تأكيد الإرسال للمرسل
        callback({
          success: true,
          data: {
            conversationId: conversation._id,
            message: populatedMessage
          }
        });
        
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ success: false, message: error.message });
      }
    });

    // قراءة الرسائل
    socket.on('message:read', async (data, callback) => {
      try {
        const { conversationId } = data;
        
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.user._id },
            readBy: { $ne: socket.user._id }
          },
          {
            $addToSet: { readBy: socket.user._id }
          }
        );
        
        // تحديث عدد الرسائل غير المقروءة للمرسل
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          const sender = conversation.participants.find(
            p => p.toString() !== socket.user._id.toString()
          );
          
          if (sender) {
            const senderSocket = getSocketByUserId(sender.toString());
            if (senderSocket) {
              io.to(senderSocket).emit('message:read', {
                conversationId,
                readBy: socket.user._id
              });
            }
          }
        }
        
        callback({ success: true });
        
      } catch (error) {
        console.error('Error marking messages as read:', error);
        callback({ success: false, message: error.message });
      }
    });

    // جلب الرسائل القديمة
    socket.on('messages:fetch', async (data, callback) => {
      try {
        const { conversationId, page = 1, limit = 50 } = data;
        
        const messages = await Message.find({ conversation: conversationId })
          .populate('sender', 'username profileImage role')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        
        callback({
          success: true,
          data: messages.reverse(),
          pagination: {
            page,
            limit,
            hasMore: messages.length === limit
          }
        });
        
      } catch (error) {
        console.error('Error fetching messages:', error);
        callback({ success: false, message: error.message });
      }
    });

    // بدء الكتابة
    socket.on('typing:start', (data) => {
      const { conversationId, recipientId } = data;
      
      const recipientSocket = getSocketByUserId(recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('typing:start', {
          conversationId,
          userId: socket.user._id,
          username: socket.user.username
        });
      }
    });

    // إنهاء الكتابة
    socket.on('typing:stop', (data) => {
      const { conversationId, recipientId } = data;
      
      const recipientSocket = getSocketByUserId(recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('typing:stop', {
          conversationId,
          userId: socket.user._id
        });
      }
    });

    // جلب المحادثات
    socket.on('conversations:fetch', async (data, callback) => {
      try {
        const { page = 1, limit = 20 } = data;
        
        const conversations = await Conversation.find({
          participants: socket.user._id
        })
          .populate('participants', 'username profileImage role')
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
        
        // حساب عدد الرسائل غير المقروءة لكل محادثة
        const conversationsWithUnread = await Promise.all(
          conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
              conversation: conv._id,
              sender: { $ne: socket.user._id },
              readBy: { $ne: socket.user._id }
            });
            
            return {
              ...conv.toObject(),
              unreadCount
            };
          })
        );
        
        callback({
          success: true,
          data: conversationsWithUnread
        });
        
      } catch (error) {
        console.error('Error fetching conversations:', error);
        callback({ success: false, message: error.message });
      }
    });

    // ============== أحداث الحالة ==============
    
    socket.on('user:online', () => {
      updateUserStatus(socket.user._id, true);
      io.emit('users:online', getOnlineUsersList());
    });

    // ============== انقطاع الاتصال ==============
    
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.username} (${socket.user._id})`);
      onlineUsers.delete(socket.user._id.toString());
      updateUserStatus(socket.user._id, false);
      io.emit('users:online', getOnlineUsersList());
    });
  });

  // دوال مساعدة
  const getSocketByUserId = (userId) => {
    const user = onlineUsers.get(userId.toString());
    return user?.socketId;
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
      await User.findByIdAndUpdate(userId, {
        isOnline,
        lastSeen: isOnline ? null : new Date()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return io;
};