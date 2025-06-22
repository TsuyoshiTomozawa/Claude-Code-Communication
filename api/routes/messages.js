const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

// In-memory message store (replace with database in production)
const messages = new Map();
const messagesByAgent = new Map();

// Get all messages
router.get('/', [
  query('from').optional(),
  query('to').optional(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { from, to, page = 1, limit = 20 } = req.query;
    const startIndex = (page - 1) * limit;

    let messageList = Array.from(messages.values());

    // Filter by sender
    if (from) {
      messageList = messageList.filter(msg => msg.from === from);
    }

    // Filter by recipient
    if (to) {
      messageList = messageList.filter(msg => msg.to === to);
    }

    // Sort by timestamp (newest first)
    messageList.sort((a, b) => b.timestamp - a.timestamp);

    const paginatedMessages = messageList.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      messages: paginatedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messageList.length,
        pages: Math.ceil(messageList.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get message by ID
router.get('/:id', [
  param('id').notEmpty()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = messages.get(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Send message
router.post('/', [
  body('from').notEmpty().trim(),
  body('to').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('type').optional().isIn(['text', 'command', 'status'])
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { from, to, content, type = 'text' } = req.body;
    const id = `msg-${Date.now()}`;

    const message = {
      id,
      from,
      to,
      content,
      type,
      timestamp: new Date(),
      status: 'sent',
      userId: req.user.id
    };

    messages.set(id, message);

    // Store message reference for agents
    if (!messagesByAgent.has(from)) {
      messagesByAgent.set(from, []);
    }
    if (!messagesByAgent.has(to)) {
      messagesByAgent.set(to, []);
    }
    messagesByAgent.get(from).push(id);
    messagesByAgent.get(to).push(id);

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// Update message status
router.patch('/:id/status', [
  param('id').notEmpty(),
  body('status').isIn(['sent', 'delivered', 'read', 'failed'])
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = messages.get(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.status = req.body.status;
    message.updatedAt = new Date();

    messages.set(req.params.id, message);

    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:id', [
  param('id').notEmpty()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = messages.get(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only allow deletion by message sender
    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this message' });
    }

    messages.delete(req.params.id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get conversation between two agents
router.get('/conversation/:agent1/:agent2', [
  param('agent1').notEmpty(),
  param('agent2').notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { agent1, agent2 } = req.params;
    const { limit = 50 } = req.query;

    const conversation = Array.from(messages.values())
      .filter(msg => 
        (msg.from === agent1 && msg.to === agent2) ||
        (msg.from === agent2 && msg.to === agent1)
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);

    res.json({
      conversation,
      participants: [agent1, agent2],
      messageCount: conversation.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;