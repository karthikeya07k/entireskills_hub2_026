const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  businessIdeaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BusinessIdea', 
    required: true 
  },
  steps: [{
    stepNumber: { 
      type: Number, 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    toolsRequired: [{ 
      type: String 
    }],
    estimatedCost: { 
      type: Number, 
      default: 0 
    },
    isCompleted: { 
      type: Boolean, 
      default: false 
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', RoadmapSchema);
