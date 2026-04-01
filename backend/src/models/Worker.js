// models/Work.js
import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  // المشاركون في العمل
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['artisan', 'worker', 'client'],
      required: true
    },
    confirmed: {
      type: Boolean,
      default: false
    },
    confirmedAt: Date
  }],
  
  // تفاصيل العمل
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // نوع العمل
  type: {
    type: String,
    enum: ['service', 'job', 'project'],
    required: true
  },
  
  // تاريخ البدء والانتهاء
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // الموقع
  location: String,
  
  // السعر
  price: {
    amount: Number,
    currency: { type: String, default: 'DZD' }
  },
  
  // حالة العمل
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // تأكيد الإنجاز من جميع الأطراف
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confirmedAt: Date
  }],
  
  // التقييمات المرتبطة
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  
  // صور العمل
  images: [String],
  
  // ملاحظات
  notes: String
}, {
  timestamps: true
});

// فهرس للبحث
workSchema.index({ participants: 1 });
workSchema.index({ status: 1, createdAt: -1 });

// التحقق من إمكانية التقييم
workSchema.methods.canReview = function(userId) {
  // التحقق من أن المستخدم مشارك في العمل
  const isParticipant = this.participants.some(p => p.user.toString() === userId.toString());
  if (!isParticipant) return false;
  
  // التحقق من أن العمل مكتمل
  if (this.status !== 'completed') return false;
  
  // التحقق من أن جميع المشاركين أكدوا الإنجاز
  if (this.completedBy.length !== this.participants.length) return false;
  
  return true;
};

// الحصول على المشاركين الآخرين
workSchema.methods.getOtherParticipants = function(userId) {
  return this.participants.filter(p => p.user.toString() !== userId.toString());
};

const Work = mongoose.model('Work', workSchema);
export default Work;