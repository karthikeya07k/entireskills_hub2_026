const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'mentor', 'admin'], 
    default: 'user' 
  },
  skills: [{ 
    type: String 
  }],
  bookmarkedIdeas: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BusinessIdea' 
  }],
  isApprovedMentor: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
