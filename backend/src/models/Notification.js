// backend/src/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'save', 'share', 'message', 'proposal', 'proposal_accepted', 'work_completed', 'rating', 'follow'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false,  // ✅ إزالة required
    default: ''
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Post', 'Message', 'User', 'Proposal']
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;