const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Get all active conversations for the logged-in user (as student or mentor)
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    let query = {};
    if (currentUserRole === 'mentor') {
      query = { mentorId: currentUserId };
    } else if (currentUserRole === 'user') {
      query = { userId: currentUserId };
    } else {
      // Admins can see all messages, or we can let them see conversations they participate in
      query = { $or: [{ userId: currentUserId }, { mentorId: currentUserId }] };
    }

    // Find messages sorted by latest
    const messages = await Message.find(query)
      .populate('userId', 'name email role skills')
      .populate('mentorId', 'name email role skills')
      .sort({ timestamp: -1 });

    // Group by conversation peer
    const conversationsMap = {};

    messages.forEach(msg => {
      // Determine who the other person is
      let peer = null;
      if (currentUserRole === 'mentor') {
        peer = msg.userId;
      } else {
        peer = msg.mentorId;
      }

      if (!peer) return;

      const peerIdStr = peer._id.toString();

      // If peer is not yet added, or this message is newer
      if (!conversationsMap[peerIdStr]) {
        conversationsMap[peerIdStr] = {
          peer,
          lastMessage: {
            contentText: msg.contentText,
            senderType: msg.senderType,
            timestamp: msg.timestamp
          }
        };
      }
    });

    const conversations = Object.values(conversationsMap);
    res.json(conversations);
  } catch (err) {
    console.error('Fetch conversations error:', err);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// @route   GET /api/messages/thread/:peerId
// @desc    Get complete chat history between current user and a peer (student/mentor)
// @access  Private
router.get('/thread/:peerId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    const peerId = req.params.peerId;

    let query = {};
    if (currentUserRole === 'mentor') {
      // Current user is mentor, peer is student (userId)
      query = { userId: peerId, mentorId: currentUserId };
    } else {
      // Current user is student (userId), peer is mentor
      query = { userId: currentUserId, mentorId: peerId };
    }

    const messages = await Message.find(query)
      .populate('userId', 'name email')
      .populate('mentorId', 'name email')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Fetch message thread error:', err);
    res.status(500).json({ message: 'Server error fetching message thread' });
  }
});

// @route   POST /api/messages/send
// @desc    Send a new message to a peer
// @access  Private
router.post('/send', auth, async (req, res) => {
  try {
    const { peerId, contentText } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    if (!peerId || !contentText || !contentText.trim()) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    // Verify recipient exists
    const peer = await User.findById(peerId);
    if (!peer) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    let userId, mentorId, senderType;

    if (currentUserRole === 'mentor') {
      userId = peerId; // The recipient is the student
      mentorId = currentUserId; // The sender is the mentor
      senderType = 'mentor';
    } else {
      userId = currentUserId; // The sender is the student
      mentorId = peerId; // The recipient is the mentor
      senderType = 'user';
    }

    const newMessage = new Message({
      userId,
      mentorId,
      senderType,
      contentText: contentText.trim()
    });

    await newMessage.save();

    // Populate for response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('userId', 'name email')
      .populate('mentorId', 'name email');

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;
