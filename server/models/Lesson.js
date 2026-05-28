const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  businessIdeaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BusinessIdea', 
    required: true 
  },
  modules: [{
    moduleTitle: { 
      type: String, 
      required: true 
    },
    durationText: { 
      type: String, 
      required: true 
    },
    contentType: { 
      type: String, 
      enum: ['video_embed', 'article_markdown'], 
      required: true 
    },
    resourceUrl: { 
      type: String 
    },
    summaryBody: { 
      type: String, 
      required: true 
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);
