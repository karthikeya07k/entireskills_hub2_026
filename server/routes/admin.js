const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BusinessIdea = require('../models/BusinessIdea');
const Roadmap = require('../models/Roadmap');
const Lesson = require('../models/Lesson');
const Message = require('../models/Message');
const { auth, authorize } = require('../middleware/auth');

// Protect all routes with auth + admin checks
router.use(auth);
router.use(authorize('admin'));

// @route   GET /api/admin/telemetry
// @desc    Get high-level system telemetry and user logs
// @access  Private (Admin Only)
router.get('/telemetry', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMentors = await User.countDocuments({ role: 'mentor', isApprovedMentor: true });
    const pendingMentors = await User.countDocuments({ role: 'mentor', isApprovedMentor: false });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalIdeas = await BusinessIdea.countDocuments({});
    const totalMessages = await Message.countDocuments({});

    // Fetch lists for detailed inspection
    const recentUsers = await User.find({}).select('-password').sort({ createdAt: -1 }).limit(10);
    const recentMessages = await Message.find({})
      .populate('userId', 'name email')
      .populate('mentorId', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      counts: {
        users: totalUsers,
        mentors: totalMentors,
        pendingMentors,
        admins: totalAdmins,
        ideas: totalIdeas,
        messages: totalMessages
      },
      recentUsers,
      recentMessages
    });
  } catch (err) {
    console.error('Fetch telemetry error:', err);
    res.status(500).json({ message: 'Server error fetching telemetry' });
  }
});

// @route   GET /api/admin/pending-mentors
// @desc    List all unapproved mentors
// @access  Private (Admin Only)
router.get('/pending-mentors', async (req, res) => {
  try {
    const pending = await User.find({ 
      role: 'mentor', 
      isApprovedMentor: false 
    }).select('-password');
    
    res.json(pending);
  } catch (err) {
    console.error('Fetch pending mentors error:', err);
    res.status(500).json({ message: 'Server error fetching pending mentors' });
  }
});

// @route   POST /api/admin/verify-mentor/:id
// @desc    Approve or reject a mentor application
// @access  Private (Admin Only)
router.post('/verify-mentor/:id', async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const mentorId = req.params.id;

    const user = await User.findById(mentorId);
    if (!user) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }

    if (action === 'approve') {
      user.isApprovedMentor = true;
      await user.save();
      res.json({ message: 'Mentor verified and approved successfully.', user });
    } else if (action === 'reject') {
      // Revert role back to user
      user.role = 'user';
      user.isApprovedMentor = undefined;
      await user.save();
      res.json({ message: 'Mentor application rejected. User reverted to student.', user });
    } else {
      res.status(400).json({ message: 'Invalid action. Specify approve or reject.' });
    }
  } catch (err) {
    console.error('Verify mentor error:', err);
    res.status(500).json({ message: 'Server error verifying mentor' });
  }
});

// @route   POST /api/admin/ideas/create
// @desc    Create a new course configuration (BusinessIdea + Roadmap + Lesson)
// @access  Private (Admin Only)
router.post('/ideas/create', async (req, res) => {
  try {
    const { title, description, matchingSkills, steps, modules } = req.body;

    if (!title || !description || !matchingSkills || !steps || !modules) {
      return res.status(400).json({ message: 'Please provide all details: title, description, matchingSkills, steps, modules' });
    }

    // Create BusinessIdea document
    const newIdea = new BusinessIdea({
      title,
      description,
      matchingSkills
    });

    await newIdea.save();

    // Create Roadmap document
    const newRoadmap = new Roadmap({
      businessIdeaId: newIdea._id,
      steps: steps.map((s, idx) => ({
        stepNumber: s.stepNumber || idx + 1,
        title: s.title,
        description: s.description,
        toolsRequired: s.toolsRequired || [],
        estimatedCost: s.estimatedCost || 0,
        isCompleted: false
      }))
    });

    await newRoadmap.save();

    // Create Lesson document
    const newLesson = new Lesson({
      businessIdeaId: newIdea._id,
      modules: modules.map(m => ({
        moduleTitle: m.moduleTitle,
        durationText: m.durationText || '10 mins',
        contentType: m.contentType || 'article_markdown',
        resourceUrl: m.resourceUrl || '',
        summaryBody: m.summaryBody
      }))
    });

    await newLesson.save();

    // Link Roadmap and Lesson back to BusinessIdea
    newIdea.roadmapId = newRoadmap._id;
    newIdea.lessonTrackId = newLesson._id;
    await newIdea.save();

    res.status(201).json({
      message: 'New course/roadmap configuration created successfully.',
      idea: newIdea,
      roadmap: newRoadmap,
      lesson: newLesson
    });

  } catch (err) {
    console.error('Create course config error:', err);
    res.status(500).json({ message: 'Server error creating course configuration' });
  }
});

module.exports = router;
