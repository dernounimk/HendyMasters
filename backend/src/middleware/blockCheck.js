import Block from '../models/Block.js';

// Middleware للتحقق من أن المستخدمين لم يحظروا بعضهم البعض
export const checkBlocked = (paramName = 'userId') => {
  return async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const targetId = req.params[paramName];
      
      if (!currentUserId || !targetId || currentUserId === targetId) {
        return next();
      }
      
      // التحقق من الحظر الثنائي
      const blockExists = await Block.findOne({
        $or: [
          { blocker: currentUserId, blocked: targetId },
          { blocker: targetId, blocked: currentUserId }
        ]
      });
      
      if (blockExists) {
        return res.status(403).json({
          success: false,
          message: 'لا يمكنك الوصول إلى هذا المحتوى'
        });
      }
      
      next();
    } catch (error) {
      console.error('Block check error:', error);
      next();
    }
  };
};