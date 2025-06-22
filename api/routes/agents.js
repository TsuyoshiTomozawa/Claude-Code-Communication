const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

// In-memory agent store (replace with database in production)
const agents = new Map();

// Get all agents
router.get('/', (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const startIndex = (page - 1) * limit;
  
  let agentList = Array.from(agents.values());
  
  // Filter by type if provided
  if (type) {
    agentList = agentList.filter(agent => agent.type === type);
  }
  
  const paginatedAgents = agentList.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    agents: paginatedAgents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: agentList.length,
      pages: Math.ceil(agentList.length / limit)
    }
  });
});

// Get agent by ID
router.get('/:id', [
  param('id').notEmpty()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const agent = agents.get(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Create new agent
router.post('/', [
  body('name').notEmpty().trim().escape(),
  body('type').isIn(['president', 'boss', 'worker']),
  body('sessionId').optional().trim()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, sessionId } = req.body;
    const id = `${type}-${Date.now()}`;

    const agent = {
      id,
      name,
      type,
      sessionId: sessionId || `multiagent:${type === 'boss' ? '0.0' : '0.1'}`,
      status: 'active',
      createdAt: new Date(),
      createdBy: req.user.id
    };

    agents.set(id, agent);

    res.status(201).json(agent);
  } catch (error) {
    next(error);
  }
});

// Update agent
router.put('/:id', [
  param('id').notEmpty(),
  body('name').optional().trim().escape(),
  body('status').optional().isIn(['active', 'inactive', 'busy'])
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const agent = agents.get(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Update allowed fields
    if (req.body.name) agent.name = req.body.name;
    if (req.body.status) agent.status = req.body.status;
    agent.updatedAt = new Date();

    agents.set(req.params.id, agent);

    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Delete agent
router.delete('/:id', [
  param('id').notEmpty()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const agent = agents.get(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agents.delete(req.params.id);

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get agent status
router.get('/:id/status', [
  param('id').notEmpty()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const agent = agents.get(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      id: agent.id,
      status: agent.status,
      lastActive: agent.updatedAt || agent.createdAt
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;