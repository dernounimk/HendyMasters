// backend/src/models/Post.js
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
  
  category: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: [1000, 'الميزانية يجب أن تكون 1000 دج على الأقل']
  },
  duration: {
    type: String,
    enum: ['one_day', 'one_week', 'one_month', 'custom'],
    default: 'one_day'
  },
  customDuration: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  
  requiredSkills: [{
    type: String,
    trim: true
  }],
  
  proposals: [{
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      maxlength: [1000, 'الرسالة يجب أن تكون أقل من 1000 حرف']
    },
    proposedBudget: {
      type: Number,
      required: true,
      min: [1000, 'الميزانية المقترحة يجب أن تكون 1000 دج على الأقل']
    },
    proposedDuration: {
      type: String,
      default: 'one_day'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  selectedProposal: {
    type: mongoose.Schema.Types.ObjectId
  },
  selectedArtisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  workDetails: {
    startDate: Date,
    endDate: Date,
    actualBudget: Number,
    notes: String,
    attachments: [{
      url: String,
      type: String,
      name: String
    }]
  },
  
  ratings: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: [500, 'التعليق يجب أن يكون أقل من 500 حرف']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

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
  
  activityLog: [{
    action: {
      type: String,
      enum: ['created', 'proposal_submitted', 'proposal_accepted', 'proposal_rejected', 'work_started', 'work_completed', 'rating_added', 'shared', 'saved', 'liked']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
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

postSchema.index({ title: 'text', description: 'text' });
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
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

postSchema.methods.addProposal = async function(proposalData) {
  const existingProposal = this.proposals.find(
    p => p.artisan.toString() === proposalData.artisan.toString()
  );
  
  if (existingProposal) {
    throw new Error('لقد قمت بتقديم عرض مسبقاً على هذا البوست');
  }
  
  this.proposals.push(proposalData);
  this.stats.proposalsCount += 1;
  
  await this.save();
  return this;
};

postSchema.methods.selectProposal = async function(proposalId, userId) {
  const proposal = this.proposals.id(proposalId);
  if (!proposal) {
    throw new Error('العرض غير موجود');
  }
  
  if (this.author.toString() !== userId) {
    throw new Error('فقط صاحب البوست يمكنه اختيار عرض');
  }
  
  this.selectedProposal = proposalId;
  this.selectedArtisan = proposal.artisan;
  this.workDetails = {
    ...this.workDetails,
    startDate: new Date()
  };
  
  this.proposals.forEach(p => {
    if (p._id.toString() === proposalId) {
      p.status = 'accepted';
    } else if (p.status === 'pending') {
      p.status = 'rejected';
    }
  });
  
  await this.save();
  return this;
};

postSchema.methods.completeWork = async function(workDetails, userId) {
  const isAuthor = this.author.toString() === userId;
  const isArtisan = this.selectedArtisan?.toString() === userId;
  
  if (!isAuthor && !isArtisan) {
    throw new Error('فقط صاحب البوست أو الحرفي المختار يمكنه إكمال العمل');
  }
  
  this.workDetails = {
    ...this.workDetails,
    actualBudget: workDetails.actualBudget || this.budget,
    notes: workDetails.notes || '',
    endDate: new Date()
  };
  
  await this.save();
  return this;
};

postSchema.methods.addRating = async function(ratingData, userId) {
  const isAuthor = this.author.toString() === userId;
  const isArtisan = this.selectedArtisan?.toString() === userId;
  
  if (!isAuthor && !isArtisan) {
    throw new Error('فقط المشاركون في العمل يمكنهم التقييم');
  }
  
  const reviewee = isAuthor ? this.selectedArtisan : this.author;
  
  const existingRating = this.ratings.find(
    r => r.reviewer.toString() === userId && r.reviewee.toString() === reviewee
  );
  
  if (existingRating) {
    throw new Error('لقد قمت بتقييم هذا العمل مسبقاً');
  }
  
  this.ratings.push({
    reviewer: userId,
    reviewee,
    rating: ratingData.rating,
    comment: ratingData.comment || ''
  });
  
  this.stats.ratingsCount += 1;
  
  const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.stats.averageRating = totalRating / this.ratings.length;
  
  await this.save();
  return this;
};

postSchema.methods.logActivity = async function(action, user, details = {}) {
  this.activityLog.push({
    action,
    user,
    details,
    timestamp: new Date()
  });
  await this.save();
};

postSchema.methods.getProposalStats = function() {
  return {
    total: this.proposals.length,
    pending: this.proposals.filter(p => p.status === 'pending').length,
    accepted: this.proposals.filter(p => p.status === 'accepted').length,
    rejected: this.proposals.filter(p => p.status === 'rejected').length,
    withdrawn: this.proposals.filter(p => p.status === 'withdrawn').length
  };
};

postSchema.methods.getUserRatings = function(userId) {
  return this.ratings.filter(r => r.reviewee.toString() === userId);
};

postSchema.methods.getWorkRatings = function() {
  return {
    clientRating: this.ratings.find(r => r.reviewer.toString() === this.author.toString()),
    artisanRating: this.ratings.find(r => r.reviewer.toString() === this.selectedArtisan?.toString())
  };
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