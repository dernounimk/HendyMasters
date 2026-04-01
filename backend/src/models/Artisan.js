// backend/models/Artisan.js
import mongoose from 'mongoose';

const artisanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  craft: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  portfolio: [{
    title: String,
    description: String,
    images: [String],
    date: Date
  }],
  certificates: [{
    name: String,
    issuer: String,
    date: Date,
    file: String
  }]
}, {
  timestamps: true
});

const Artisan = mongoose.model('Artisan', artisanSchema);
export default Artisan;