const mongoose = require('mongoose');

const UserRoadmapProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  businessIdeaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BusinessIdea', 
    required: true 
  },
  completedSteps: [{ 
    type: Number // Array of completed stepNumbers (e.g., [1, 2])
  }]
}, { timestamps: true });

// Combine userId and businessIdeaId as a unique index to optimize querying
UserRoadmapProgressSchema.index({ userId: 1, businessIdeaId: 1 }, { unique: true });

module.exports = mongoose.model('UserRoadmapProgress', UserRoadmapProgressSchema);
