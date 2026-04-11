// backend/src/controllers/blockController.js
import Block from '../models/Block.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;

    console.log(`🔒 Blocking user: ${blockerId} -> ${userId}`);

    if (blockerId === userId) {
      return res.status(400).json({ success: false, message: 'لا يمكنك حظر نفسك' });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const existingBlock = await Block.findOne({ blocker: blockerId, blocked: userId });
    if (existingBlock) {
      return res.status(400).json({ success: false, message: 'المستخدم محظور بالفعل' });
    }

    await Block.create({ blocker: blockerId, blocked: userId });
    
    // حظر متبادل
    const reverseBlock = await Block.findOne({ blocker: userId, blocked: blockerId });
    if (!reverseBlock) {
      await Block.create({ blocker: userId, blocked: blockerId });
      console.log(`🔄 Mutual block created between ${blockerId} and ${userId}`);
    }

    // ========== لا تحذف المحادثة، فقط ضع علامة محظورة ==========
    // بدلاً من حذف المحادثة، يمكننا إضافة حقل isBlocked أو تحديث المحادثة
    const conversation = await Conversation.findOne({
      participants: { $all: [blockerId, userId], $size: 2 }
    });

    if (conversation) {
      // بدلاً من الحذف، نقوم بتحديث المحادثة لجعلها غير مرئية
      conversation.isBlocked = true;
      conversation.blockedBy = blockerId;
      await conversation.save();
      console.log(`🔒 Conversation ${conversation._id} marked as blocked`);
    }
    // ==========================================================

    res.json({ 
      success: true, 
      message: 'تم حظر المستخدم بنجاح' 
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء حظر المستخدم' 
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;

    console.log(`🔓 Unblocking user: ${blockerId} -> ${userId}`);

    const userToUnblock = await User.findById(userId);
    if (!userToUnblock) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    await Block.findOneAndDelete({ blocker: blockerId, blocked: userId });
    await Block.findOneAndDelete({ blocker: userId, blocked: blockerId });
    
    // إعادة تفعيل المحادثة
    const conversation = await Conversation.findOne({
      participants: { $all: [blockerId, userId], $size: 2 }
    });

    if (conversation) {
      conversation.isBlocked = false;
      conversation.blockedBy = null;
      await conversation.save();
      console.log(`🔓 Conversation ${conversation._id} unblocked`);
    }

    res.json({ 
      success: true, 
      message: 'تم إلغاء حظر المستخدم' 
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء إلغاء الحظر' 
    });
  }
};

// جلب قائمة المستخدمين المحظورين
export const getBlockedUsers = async (req, res) => {
  try {
    const blockerId = req.user.id;
    
    console.log(`📋 Fetching blocked users for: ${blockerId}`);
    
    const blocks = await Block.find({ blocker: blockerId })
      .populate('blocked', 'username profileImage role email');
    
    console.log(`📋 Found ${blocks.length} blocked users`);
    
    const blockedUsers = blocks.map(block => ({
      _id: block.blocked._id,
      username: block.blocked.username,
      profileImage: block.blocked.profileImage,
      role: block.blocked.role,
      email: block.blocked.email,
      blockedAt: block.createdAt
    }));
    
    res.json({ 
      success: true, 
      data: blockedUsers 
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في جلب المحظورين' 
    });
  }
};