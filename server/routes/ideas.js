const express = require('express');
const router = express.Router();
const BusinessIdea = require('../models/BusinessIdea');
const Roadmap = require('../models/Roadmap');
const Lesson = require('../models/Lesson');
const UserRoadmapProgress = require('../models/UserRoadmapProgress');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/ideas/all
// @desc    Get all business ideas
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const ideas = await BusinessIdea.find({});
    res.json(ideas);
  } catch (err) {
    console.error('Fetch all ideas error:', err);
    res.status(500).json({ message: 'Server error fetching business ideas' });
  }
});

// @route   POST /api/ideas/assess
// @desc    Update user skills and return matching business ideas
// @access  Private
router.post('/assess', auth, async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }

    // Update user's profile skills
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills },
      { new: true }
    ).select('-password');

    // Matching pipeline: Find business ideas where at least one of the matchingSkills matches the user's selected skills
    const recommendations = await BusinessIdea.find({
      matchingSkills: { $in: skills }
    });

    res.json({
      user,
      recommendations
    });
  } catch (err) {
    console.error('Skill assessment error:', err);
    res.status(500).json({ message: 'Server error during assessment' });
  }
});

// @route   GET /api/ideas/recommendations
// @desc    Get recommendations based on current user's skills
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find matches
    const recommendations = await BusinessIdea.find({
      matchingSkills: { $in: user.skills }
    });

    res.json(recommendations);
  } catch (err) {
    console.error('Fetch recommendations error:', err);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
});

// @route   GET /api/ideas/:id
// @desc    Get detailed business idea including roadmap steps & lesson track modules
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const idea = await BusinessIdea.findById(req.id || req.params.id);
    if (!idea) {
      return res.status(404).json({ message: 'Business idea not found' });
    }

    // Fetch associated roadmap and lessons
    const roadmap = await Roadmap.findOne({ businessIdeaId: idea._id });
    const lesson = await Lesson.findOne({ businessIdeaId: idea._id });

    // Fetch user progress for this roadmap
    let progress = await UserRoadmapProgress.findOne({
      userId: req.user.id,
      businessIdeaId: idea._id
    });

    if (!progress) {
      // Create an empty progress record if not exist
      progress = new UserRoadmapProgress({
        userId: req.user.id,
        businessIdeaId: idea._id,
        completedSteps: []
      });
      await progress.save();
    }

    res.json({
      idea,
      roadmap: roadmap ? roadmap.steps : [],
      lesson: lesson ? lesson.modules : [],
      completedSteps: progress.completedSteps
    });
  } catch (err) {
    console.error('Fetch idea details error:', err);
    res.status(500).json({ message: 'Server error fetching idea details' });
  }
});

// @route   POST /api/ideas/:id/bookmark
// @desc    Bookmark or unbookmark a business idea
// @access  Private
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const ideaId = req.params.id;
    const idea = await BusinessIdea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: 'Business idea not found' });
    }

    const user = await User.findById(req.user.id);
    const isBookmarked = user.bookmarkedIdeas.includes(ideaId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarkedIdeas = user.bookmarkedIdeas.filter(id => id.toString() !== ideaId);
    } else {
      // Add bookmark
      user.bookmarkedIdeas.push(ideaId);
    }

    await user.save();
    res.json({ bookmarkedIdeas: user.bookmarkedIdeas, isBookmarked: !isBookmarked });
  } catch (err) {
    console.error('Bookmark toggle error:', err);
    res.status(500).json({ message: 'Server error toggling bookmark' });
  }
});

// @route   GET /api/ideas/:id/progress
// @desc    Get user-specific roadmap completed steps
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const progress = await UserRoadmapProgress.findOne({
      userId: req.user.id,
      businessIdeaId: req.params.id
    });

    res.json({ completedSteps: progress ? progress.completedSteps : [] });
  } catch (err) {
    console.error('Fetch progress error:', err);
    res.status(500).json({ message: 'Server error fetching progress' });
  }
});

// @route   POST /api/ideas/:id/progress
// @desc    Toggle user roadmap step completion status (check/uncheck)
// @access  Private
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { stepNumber, isCompleted } = req.body;
    const ideaId = req.params.id;

    if (stepNumber === undefined) {
      return res.status(400).json({ message: 'stepNumber is required' });
    }

    let progress = await UserRoadmapProgress.findOne({
      userId: req.user.id,
      businessIdeaId: ideaId
    });

    if (!progress) {
      progress = new UserRoadmapProgress({
        userId: req.user.id,
        businessIdeaId: ideaId,
        completedSteps: []
      });
    }

    const stepIndex = progress.completedSteps.indexOf(stepNumber);

    if (isCompleted) {
      // Add step to completed array if not already present
      if (stepIndex === -1) {
        progress.completedSteps.push(stepNumber);
      }
    } else {
      // Remove step from completed array if present
      if (stepIndex > -1) {
        progress.completedSteps.splice(stepIndex, 1);
      }
    }

    await progress.save();
    res.json({ completedSteps: progress.completedSteps });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ message: 'Server error updating progress' });
  }
});

module.exports = router;
