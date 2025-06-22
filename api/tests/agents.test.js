const request = require('supertest');
const app = require('../server');

describe('Agent Endpoints', () => {
  let authToken;
  let agentId;

  beforeAll(async () => {
    // Register and login to get auth token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'agenttest',
        email: 'agenttest@example.com',
        password: 'password123'
      });
    authToken = userRes.body.token;
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'TestWorker1',
          type: 'worker',
          sessionId: 'multiagent:0.1'
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('TestWorker1');
      expect(res.body.type).toBe('worker');
      expect(res.body.status).toBe('active');
      agentId = res.body.id;
    });

    it('should validate agent type', async () => {
      await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'InvalidAgent',
          type: 'invalid'
        })
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/agents')
        .send({
          name: 'TestAgent',
          type: 'worker'
        })
        .expect(401);
    });
  });

  describe('GET /api/agents', () => {
    it('should list all agents', async () => {
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('agents');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.agents).toBeInstanceOf(Array);
    });

    it('should filter agents by type', async () => {
      const res = await request(app)
        .get('/api/agents?type=worker')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.agents.every(agent => agent.type === 'worker')).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/agents?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should get agent by ID', async () => {
      const res = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(agentId);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('type');
    });

    it('should return 404 for non-existent agent', async () => {
      await request(app)
        .get('/api/agents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/agents/:id', () => {
    it('should update agent', async () => {
      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'UpdatedWorker',
          status: 'busy'
        })
        .expect(200);

      expect(res.body.name).toBe('UpdatedWorker');
      expect(res.body.status).toBe('busy');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should validate status values', async () => {
      await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid-status'
        })
        .expect(400);
    });
  });

  describe('GET /api/agents/:id/status', () => {
    it('should get agent status', async () => {
      const res = await request(app)
        .get(`/api/agents/${agentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('lastActive');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should delete agent', async () => {
      const res = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Agent deleted successfully');

      // Verify agent is deleted
      await request(app)
        .get(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});