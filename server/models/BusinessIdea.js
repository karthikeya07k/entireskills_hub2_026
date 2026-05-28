const mongoose = require('mongoose');

const BusinessIdeaSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  matchingSkills: [{ 
    type: String 
  }],
  roadmapId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Roadmap' 
  },
  lessonTrackId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  }
}, { timestamps: true });

module.exports = mongoose.model('BusinessIdea', BusinessIdeaSchema);
