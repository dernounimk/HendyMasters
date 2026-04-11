// backend/src/config/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Block from '../models/Block.js';

const onlineUsers = new Map();

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
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: isOnline ? null : new Date()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
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

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id username profileImage role isOnline isActive');
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
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
    console.log(`🔌 User connected: ${socket.user.username} (${socket.user.role})`);

    onlineUsers.set(socket.user._id, {
      socketId: socket.id,
      user: socket.user
    });

    updateUserStatus(socket.user._id, true);
    io.emit('users:online', getOnlineUsersList());
    socket.join(`user:${socket.user._id}`);

    // إنشاء محادثة جديدة
    socket.on('conversation:start', async (data, callback) => {
      try {
        const { recipientId, initialMessage } = data;
        
        console.log(`📨 Starting conversation: ${socket.user.username} -> ${recipientId}`);
        
        if (!recipientId) {
          return callback({ success: false, message: 'معرف المستلم مطلوب' });
        }
        
        let conversation = await Conversation.findOne({
          participants: { $all: [socket.user._id, recipientId], $size: 2 }
        });
        
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [socket.user._id, recipientId],
            lastMessageAt: new Date()
          });
          console.log(`✅ New conversation created: ${conversation._id}`);
        }
        
        await conversation.populate('participants', 'username profileImage role');
        
        let message = null;
        if (initialMessage && initialMessage.trim()) {
          message = await Message.create({
            conversation: conversation._id,
            sender: socket.user._id,
            recipient: recipientId,
            content: initialMessage.trim(),
            readBy: [socket.user._id]
          });
          
          await message.populate('sender', 'username profileImage');
          
          conversation.lastMessage = message._id;
          conversation.lastMessageAt = message.createdAt;
          await conversation.save();
          
          const recipientSocket = getSocketByUserId(recipientId);
          if (recipientSocket) {
            io.to(recipientSocket).emit('message:new', {
              conversationId: conversation._id,
              message
            });
          }
        }
        
        callback({
          success: true,
          data: { conversation: conversation.toObject(), message: message?.toObject() || null }
        });
        
      } catch (error) {
        console.error('Error starting conversation:', error);
        callback({ success: false, message: error.message });
      }
    });

    // إرسال رسالة
    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, recipientId, content } = data;
        
        if (!content?.trim()) {
          return callback({ success: false, message: 'الرسالة لا يمكن أن تكون فارغة' });
        }
        
        let conversation;
        let targetRecipientId = recipientId;
        
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            return callback({ success: false, message: 'المحادثة غير موجودة' });
          }
          targetRecipientId = conversation.participants.find(p => p.toString() !== socket.user._id);
        } else if (recipientId) {
          conversation = await Conversation.findOne({
            participants: { $all: [socket.user._id, recipientId], $size: 2 }
          });
          
          if (!conversation) {
            conversation = await Conversation.create({
              participants: [socket.user._id, recipientId],
              lastMessageAt: new Date()
            });
          }
          targetRecipientId = recipientId;
        } else {
          return callback({ success: false, message: 'معرف المحادثة أو المستلم مطلوب' });
        }
        
        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          recipient: targetRecipientId,
          content: content.trim(),
          readBy: [socket.user._id]
        });
        
        const populatedMessage = await message.populate('sender', 'username profileImage');
        
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
        
        const recipientSocket = getSocketByUserId(targetRecipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('message:new', {
            conversationId: conversation._id,
            message: populatedMessage
          });
        }
        
        callback({
          success: true,
          data: { conversationId: conversation._id, message: populatedMessage }
        });
        
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ success: false, message: error.message });
      }
    });

    // جلب المحادثات
    socket.on('conversations:fetch', async (data, callback) => {
      try {
        const conversations = await Conversation.find({
          participants: socket.user._id
        })
          .populate('participants', 'username profileImage role')
          .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'username profileImage' }
          })
          .sort({ lastMessageAt: -1 });
        
        const conversationsWithUnread = [];
        for (const conv of conversations) {
          const unreadCount = await Message.countDocuments({
            conversation: conv._id,
            sender: { $ne: socket.user._id },
            readBy: { $ne: socket.user._id }
          });
          
          conversationsWithUnread.push({
            ...conv.toObject(),
            unreadCount
          });
        }
        
        callback({ success: true, data: conversationsWithUnread });
        
      } catch (error) {
        console.error('Error fetching conversations:', error);
        callback({ success: false, message: error.message, data: [] });
      }
    });

    // تعليم الرسائل كمقروءة
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
          const sender = conversation.participants.find(p => p.toString() !== socket.user._id);
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

    // إيقاف الكتابة
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

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
      onlineUsers.delete(socket.user._id);
      updateUserStatus(socket.user._id, false);
      io.emit('users:online', getOnlineUsersList());
    });
  });

  return io;
};

export default configureSocket;