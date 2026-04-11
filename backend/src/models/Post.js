import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'العنوان يجب أن يكون 5 أحرف على الأقل'],
    maxlength: [200, 'العنوان يجب أن يكون أقل من 200 حرف']
  },
  description: {
    type: String,
    required: true,
    minlength: [20, 'الوصف يجب أن يكون 20 حرفاً على الأقل']
  },
  type: {
    type: String,
    enum: ['service_request', 'job_opportunity'],
    required: true
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: [1000, 'الميزانية يجب أن تكون 1000 دج على الأقل']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },

  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    width: Number,
    height: Number,
    format: String,
    size: Number
  }],
  
  stats: {
    views: { type: Number, default: 0 },
    proposalsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 }
  },
  
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ إزالة الفهارس التي تشير إلى حقول محذوفة
postSchema.index({ title: 'text', description: 'text' });
postSchema.index({ author: 1 });
postSchema.index({ location: 1 }); 
postSchema.index({ createdAt: -1 });
postSchema.index({ 'stats.views': -1 });
postSchema.index({ 'stats.savesCount': -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ 'shares.user': 1 });

postSchema.methods.toggleSave = async function(userId) {
  const index = this.savedBy.findIndex(id => id.toString() === userId.toString());
  
  if (index === -1) {
    this.savedBy.push(userId);
    this.stats.savesCount += 1;
    await this.save();
    return { saved: true, savesCount: this.stats.savesCount };
  } else {
    this.savedBy.splice(index, 1);
    this.stats.savesCount -= 1;
    await this.save();
    return { saved: false, savesCount: this.stats.savesCount };
  }
};

postSchema.methods.isSavedBy = function(userId) {
  return this.savedBy.some(id => id.toString() === userId.toString());
};

postSchema.methods.addShare = async function(userId, recipientId) {
  if (!this.sharedWith.some(s => s.user.toString() === recipientId.toString())) {
    this.sharedWith.push({ user: recipientId });
    this.stats.sharesCount += 1;
    await this.save();
    return true;
  }
  return false;
};

postSchema.methods.incrementViews = async function() {
  this.stats.views += 1;
  await this.save();
  return this.stats.views;
};

postSchema.methods.incrementProposals = async function() {
  this.stats.proposalsCount += 1;
  await this.save();
  return this.stats.proposalsCount;
};

postSchema.methods.toggleLike = async function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId);
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId);
    this.stats.likesCount = this.likes.length;
    return { liked: false, likesCount: this.stats.likesCount };
  } else {
    this.likes.push({ user: userId });
    this.stats.likesCount = this.likes.length;
    return { liked: true, likesCount: this.stats.likesCount };
  }
};

postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId);
};

postSchema.statics.getTrending = async function(limit = 10) {
  return this.find()
    .sort({ 'stats.views': -1, 'stats.savesCount': -1, createdAt: -1 })
    .limit(limit)
    .populate('author', 'username profileImage');
};

postSchema.statics.getNearby = async function(location, radius = 50, limit = 20) {
  return this.find({
    location: { $regex: location, $options: 'i' }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'username profileImage');
};

postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (next && typeof next === 'function') {
    next();
  }
});

postSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Post save error:', error);
  }
  if (next && typeof next === 'function') {
    next();
  }
});

const Post = mongoose.model('Post', postSchema);
export default Post;