const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderType: { 
    type: String, 
    enum: ['user', 'mentor'], 
    required: true 
  },
  contentText: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Add index for fast retrieval of user-to-mentor messaging history
MessageSchema.index({ userId: 1, mentorId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', MessageSchema);
