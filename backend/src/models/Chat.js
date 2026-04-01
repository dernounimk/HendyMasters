// models/Chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // نوع المحادثة
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  
  // آخر رسالة
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // للمحادثات الجماعية
  name: String,
  avatar: String,
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // صلاحيات التواصل (التحقق من صحة المحادثة)
  validation: {
    // هل المحادثة مسموح بها حسب الأدوار
    isValid: { type: Boolean, default: false },
    // سبب السماح أو المنع
    reason: String,
    // تاريخ التحقق
    validatedAt: Date
  },
  
  // حالة المحادثة
  isActive: {
    type: Boolean,
    default: true
  },
  
  // للمحادثات المرتبطة بخدمة أو طلب
  reference: {
    type: {
      type: String,
      enum: ['service', 'job', 'request']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reference.type'
    }
  }
}, {
  timestamps: true
});

// فهرس للمشاركين
chatSchema.index({ participants: 1 });

// التحقق من صحة المحادثة حسب الأدوار
chatSchema.pre('save', async function(next) {
  if (this.participants.length === 2) {
    // محادثة مباشرة - تحقق من الأدوار
    const User = mongoose.model('User');
    const users = await User.find({ _id: { $in: this.participants } }).select('role');
    
    if (users.length !== 2) {
      this.validation = {
        isValid: false,
        reason: 'أحد المستخدمين غير موجود',
        validatedAt: new Date()
      };
      return next();
    }
    
    const user1 = users[0];
    const user2 = users[1];
    
    // قواعد التواصل:
    // 1. العامل الحر (worker) -> يتواصل فقط مع الحرفي (artisan)
    // 2. العميل (client) -> يتواصل فقط مع الحرفي (artisan)
    // 3. الحرفي (artisan) -> يمكنه التواصل مع الكل
    
    if (user1.role === 'artisan' || user2.role === 'artisan') {
      // الحرفي موجود - المحادثة مسموحة
      this.validation = {
        isValid: true,
        reason: 'الحرفي يمكنه التواصل مع الجميع',
        validatedAt: new Date()
      };
    } else if (user1.role === 'worker' && user2.role === 'worker') {
      // عاملان يحاولان التواصل - غير مسموح
      this.validation = {
        isValid: false,
        reason: 'العمال لا يمكنهم التواصل مع بعضهم البعض',
        validatedAt: new Date()
      };
    } else if (user1.role === 'client' && user2.role === 'client') {
      // عميلان يحاولان التواصل - غير مسموح
      this.validation = {
        isValid: false,
        reason: 'العملاء لا يمكنهم التواصل مع بعضهم البعض',
        validatedAt: new Date()
      };
    } else if (user1.role === 'worker' && user2.role === 'client') {
      // عامل مع عميل - غير مسموح
      this.validation = {
        isValid: false,
        reason: 'العامل لا يمكنه التواصل مباشرة مع العميل',
        validatedAt: new Date()
      };
    } else {
      // باقي الحالات مسموحة
      this.validation = {
        isValid: true,
        reason: 'محادثة مسموحة',
        validatedAt: new Date()
      };
    }
  }
  
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;