// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'اسم المستخدم مطلوب'],
    unique: true,
    trim: true,
    minlength: [3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'],
    maxlength: [30, 'اسم المستخدم يجب أن يكون أقل من 30 حرف']
  },
  lastUsernameChange: {
    type: Date,
    default: null
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/, 'البريد الإلكتروني غير صالح']
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'],
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'artisan', 'worker'],
    required: true,
    default: 'client'
  },
  
  // ✅ حقول التوثيق (علامة زرقاء)
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  
  profileImage: {
    type: String,
    default: '/uploads/profiles/default-avatar.png'
  },
  profileImagePublicId: String,
  bio: {
    type: String,
    maxlength: [500, 'السيرة الذاتية يجب أن تكون أقل من 500 حرف']
  },
  location: {
    type: String,
    trim: true
  },
  
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  completedJobs: [{
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    role: {
      type: String,
      enum: ['client', 'artisan', 'worker']
    },
    title: String,
    budget: Number,
    completedAt: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    ratingComment: String,
    earnings: Number
  }],
  
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  proposals: [{
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    message: String,
    proposedBudget: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  professionalInfo: {
    craft: {
      type: String,
      enum: [
        'electrician', 'plumber', 'carpenter', 'painter', 'mason',
        'mover', 'cleaner', 'ac_technician', 'tiler', 'blacksmith',
        'gardener', 'handyman', 'cabinet_maker', 'upholsterer',
        'glass_worker', 'flooring_specialist', 'facade_worker',
        'roofer', 'kitchen_installer', 'bathroom_installer',
        'solar_installer', 'electronics_repair', 'security_systems',
        'network_tech', 'satellite_installer', 'cctv_installer',
        'smart_home_tech', 'hvac_tech', 'elevator_tech', 'pool_tech',
        'gas_tech', 'auto_electrician', 'generator_tech',
        'interior_designer', 'decorator', 'landscape_designer',
        'stone_cutter', 'wood_carver', 'foundation_worker',
        'steel_fixer', 'plasterer', 'window_installer',
        'door_installer', 'appliance_repair', 'furniture_repair',
        'pest_control', 'water_tank_cleaner'
      ]
    },
    experience: {
      type: String,
      enum: ['0-1', '1-3', '3-5', '5-10', '10+']
    },
    dailyRate: {
      type: Number,
      min: [1000, 'لا يمكن أن يكون السعر اليومي أقل من 1000 دج'],
      max: [50000, 'لا يمكن أن يتجاوز السعر اليومي 50000 دج']
    },
    skills: [String],
    verified: { type: Boolean, default: false },
    workCraft: {
      type: String,
      enum: [
        'construction', 'plumbing', 'electrical', 'painting',
        'carpentry', 'ac_maintenance', 'cleaning', 'gardening',
        'moving', 'general'
      ]
    }
  },
  
  stats: {
    postsCount: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },

  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  
  resetCode: {
    type: String,
    select: false
  },
  resetCodeExpires: {
    type: Date,
    select: false
  },
  
  privacy: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true }
  },
  
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
userSchema.virtual('userPosts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'reviewedUser'
});

userSchema.virtual('userProposals', {
  ref: 'Proposal',
  localField: '_id',
  foreignField: 'artisan'
});

// Indexes
userSchema.index({ username: 'text', bio: 'text' });
userSchema.index({ location: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ 'professionalInfo.craft': 1 });
userSchema.index({ 'professionalInfo.skills': 1 });
userSchema.index({ 'professionalInfo.workCraft': 1 });

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('🔐 [COMPARE] Comparing password...');
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('✅ [COMPARE] Password match:', isMatch);
  return isMatch;
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createResetCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetCode = code;
  this.resetCodeExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

userSchema.methods.verifyResetCode = function(code) {
  if (!this.resetCode || !this.resetCodeExpires) {
    return false;
  }
  const isExpired = this.resetCodeExpires < Date.now();
  const isMatch = this.resetCode === code;
  if (isExpired) return false;
  return isMatch;
};

userSchema.methods.clearResetCode = function() {
  this.resetCode = undefined;
  this.resetCodeExpires = undefined;
};

userSchema.methods.getAllowedMessageRecipients = function() {
  switch(this.role) {
    case 'client':
      return ['artisan'];
    case 'artisan':
      return ['client', 'worker'];
    case 'worker':
      return ['artisan'];
    default:
      return [];
  }
};

userSchema.methods.calculateRating = function(newRating) {
  const oldTotal = this.stats.rating * this.stats.totalRatings;
  this.stats.totalRatings += 1;
  this.stats.rating = (oldTotal + newRating) / this.stats.totalRatings;
};

userSchema.methods.addCompletedJob = async function(post, role, earnings, rating, ratingComment) {
  this.completedJobs.push({
    post: post._id,
    role,
    title: post.title,
    budget: post.budget,
    completedAt: new Date(),
    earnings: earnings || post.budget,
    rating: rating || null,
    ratingComment: ratingComment || ''
  });
  
  this.stats.completedJobsCount += 1;
  if (earnings) {
    this.stats.totalEarnings += earnings;
  }
  
  await this.save();
  return this;
};

userSchema.methods.addProposal = async function(postId, message, proposedBudget) {
  const existingProposal = this.proposals.find(
    p => p.post.toString() === postId.toString() && p.status === 'pending'
  );
  
  if (existingProposal) {
    throw new Error('لقد قمت بتقديم عرض مسبقاً على هذا البوست');
  }
  
  this.proposals.push({
    post: postId,
    message,
    proposedBudget,
    status: 'pending',
    createdAt: new Date()
  });
  
  this.stats.proposalsCount += 1;
  await this.save();
  return this;
};

userSchema.methods.updateProposalStatus = async function(proposalId, status) {
  const proposal = this.proposals.id(proposalId);
  if (!proposal) {
    throw new Error('العرض غير موجود');
  }
  
  proposal.status = status;
  if (status === 'accepted') {
    this.stats.acceptedProposalsCount += 1;
  }
  
  await this.save();
  return proposal;
};

userSchema.methods.addPost = function(postId) {
  if (!this.posts.includes(postId)) {
    this.posts.push(postId);
    this.stats.postsCount += 1;
  }
  return this;
};

userSchema.methods.toggleSavePost = function(postId) {
  const index = this.savedPosts.indexOf(postId);
  if (index === -1) {
    this.savedPosts.push(postId);
    return true;
  } else {
    this.savedPosts.splice(index, 1);
    return false;
  }
};

userSchema.methods.canCreatePost = function() {
  return this.role === 'client' || this.role === 'artisan';
};

userSchema.methods.canApplyToPost = function(post) {
  if (this.role !== 'worker') return false;
  if (post.type !== 'job_opportunity') return false;
  if (post.status !== 'open') return false;
  const hasProposal = this.proposals.some(p => p.post.toString() === post._id.toString());
  if (hasProposal) return false;
  return true;
};

userSchema.methods.canReceiveProposals = function(post) {
  if (this.role !== 'artisan') return false;
  if (post.type !== 'job_opportunity') return false;
  if (post.status !== 'open') return false;
  if (post.author.toString() !== this._id.toString()) return false;
  return true;
};

userSchema.methods.getAcceptedProposals = function() {
  return this.proposals.filter(p => p.status === 'accepted');
};

userSchema.methods.getProjectStats = function() {
  const completedJobs = this.completedJobs;
  const totalJobs = completedJobs.length;
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.earnings || 0), 0);
  const ratings = completedJobs.filter(job => job.rating).map(job => job.rating);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : 0;
  
  return {
    totalJobs,
    totalEarnings,
    averageRating: Number(averageRating.toFixed(1)),
    ratingCount: ratings.length,
    recentJobs: completedJobs.sort((a, b) => b.completedAt - a.completedAt).slice(0, 5)
  };
};

userSchema.methods.getAllowedPostTypes = function() {
  switch(this.role) {
    case 'client':
      return ['service_request'];
    case 'artisan':
      return ['job_opportunity'];
    case 'worker':
      return [];
    default:
      return [];
  }
};

userSchema.methods.getApplicablePostTypes = function() {
  switch(this.role) {
    case 'worker':
      return ['job_opportunity'];
    case 'artisan':
      return ['service_request'];
    default:
      return [];
  }
};

userSchema.methods.getDaysUntilUsernameChange = function() {
  if (!this.lastUsernameChange) return 0;
  
  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
  const timeSinceLastChange = Date.now() - this.lastUsernameChange.getTime();
  
  if (timeSinceLastChange >= FIFTEEN_DAYS) return 0;
  
  return Math.ceil((FIFTEEN_DAYS - timeSinceLastChange) / (24 * 60 * 60 * 1000));
};

// Statics
userSchema.statics.getByRole = async function(role, limit = 20) {
  return this.find({ role, isActive: true })
    .select('username profileImage role location stats professionalInfo isVerified')
    .limit(limit)
    .sort({ createdAt: -1 });
};

userSchema.statics.getArtisansByCraft = async function(craft, limit = 20) {
  return this.find({ 
    role: 'artisan', 
    'professionalInfo.craft': craft,
    isActive: true 
  })
    .select('username profileImage role location stats professionalInfo isVerified')
    .limit(limit);
};

userSchema.statics.getWorkersByCraft = async function(workCraft, limit = 20) {
  return this.find({ 
    role: 'worker', 
    'professionalInfo.workCraft': workCraft,
    isActive: true 
  })
    .select('username profileImage role location stats professionalInfo isVerified')
    .limit(limit);
};

const User = mongoose.model('User', userSchema);
export default User;