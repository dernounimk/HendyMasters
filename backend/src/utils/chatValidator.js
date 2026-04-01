// utils/chatValidator.js
import User from '../models/User.js';

/**
 * التحقق من إمكانية التواصل بين مستخدمين
 * @param {string} userId1 - معرف المستخدم الأول
 * @param {string} userId2 - معرف المستخدم الثاني
 * @returns {Promise<{isValid: boolean, reason: string}>}
 */
export const validateChat = async (userId1, userId2) => {
  try {
    const users = await User.find({ _id: { $in: [userId1, userId2] } }).select('role');
    
    if (users.length !== 2) {
      return {
        isValid: false,
        reason: 'أحد المستخدمين غير موجود'
      };
    }
    
    const user1 = users[0];
    const user2 = users[1];
    
    // قواعد التواصل:
    // 1. العامل الحر (worker) -> يتواصل فقط مع الحرفي (artisan)
    // 2. العميل (client) -> يتواصل فقط مع الحرفي (artisan)
    // 3. الحرفي (artisan) -> يمكنه التواصل مع الكل
    
    // إذا كان أي منهما حرفي - مسموح
    if (user1.role === 'artisan' || user2.role === 'artisan') {
      return {
        isValid: true,
        reason: 'الحرفي يمكنه التواصل مع الجميع'
      };
    }
    
    // عامل مع عامل - غير مسموح
    if (user1.role === 'worker' && user2.role === 'worker') {
      return {
        isValid: false,
        reason: 'العمال لا يمكنهم التواصل مع بعضهم البعض'
      };
    }
    
    // عميل مع عميل - غير مسموح
    if (user1.role === 'client' && user2.role === 'client') {
      return {
        isValid: false,
        reason: 'العملاء لا يمكنهم التواصل مع بعضهم البعض'
      };
    }
    
    // عامل مع عميل - غير مسموح
    if ((user1.role === 'worker' && user2.role === 'client') ||
        (user1.role === 'client' && user2.role === 'worker')) {
      return {
        isValid: false,
        reason: 'العامل لا يمكنه التواصل مباشرة مع العميل'
      };
    }
    
    // باقي الحالات مسموحة
    return {
      isValid: true,
      reason: 'محادثة مسموحة'
    };
    
  } catch (error) {
    console.error('Error validating chat:', error);
    return {
      isValid: false,
      reason: 'حدث خطأ في التحقق من صلاحية المحادثة'
    };
  }
};