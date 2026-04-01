// backend/src/controllers/blockController.js
import Block from '../models/Block.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// حظر مستخدم
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;

    if (blockerId === userId) {
      return res.status(400).json({ success: false, message: 'لا يمكنك حظر نفسك' });
    }

    // التحقق من وجود الحظر مسبقاً
    const existingBlock = await Block.findOne({ blocker: blockerId, blocked: userId });
    if (existingBlock) {
      return res.status(400).json({ success: false, message: 'المستخدم محظور بالفعل' });
    }

    // إنشاء سجل الحظر
    await Block.create({ blocker: blockerId, blocked: userId });

    // حذف المحادثة بين المستخدمين (اختياري)
    await Conversation.findOneAndDelete({
      participants: { $all: [blockerId, userId], $size: 2 }
    });

    res.json({ success: true, message: 'تم حظر المستخدم بنجاح' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حظر المستخدم' });
  }
};

// إلغاء حظر مستخدم
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user.id;

    const result = await Block.findOneAndDelete({ blocker: blockerId, blocked: userId });
    if (!result) {
      return res.status(404).json({ success: false, message: 'المستخدم غير محظور' });
    }

    res.json({ success: true, message: 'تم إلغاء حظر المستخدم' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إلغاء الحظر' });
  }
};

// جلب قائمة المستخدمين المحظورين
export const getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user.id }).populate('blocked', 'username profileImage');
    const blockedUsers = blocks.map(block => block.blocked);
    res.json({ success: true, data: blockedUsers });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب المحظورين' });
  }
};