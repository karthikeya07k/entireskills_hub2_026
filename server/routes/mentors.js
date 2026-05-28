const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/mentors
// @desc    Get all verified mentors
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Mentors who have role = mentor AND are approved by admin
    const mentors = await User.find({ 
      role: 'mentor', 
      isApprovedMentor: true 
    }).select('-password');
    
    res.json(mentors);
  } catch (err) {
    console.error('Fetch mentors error:', err);
    res.status(500).json({ message: 'Server error fetching mentors' });
  }
});

// @route   POST /api/mentors/apply
// @desc    Apply to become a mentor
// @access  Private
router.post('/apply', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'mentor') {
      return res.status(400).json({ message: 'You are already a mentor' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admins cannot apply to be mentors' });
    }

    // Set role to mentor, but isApprovedMentor = false (waiting for admin verification)
    user.role = 'mentor';
    user.isApprovedMentor = false;
    
    // Add any skills submitted in application
    if (req.body.skills && Array.isArray(req.body.skills)) {
      user.skills = req.body.skills;
    }

    await user.save();

    res.json({
      message: 'Mentor application submitted. Awaiting administrator approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isApprovedMentor: user.isApprovedMentor
      }
    });

  } catch (err) {
    console.error('Mentor application error:', err);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

module.exports = router;
