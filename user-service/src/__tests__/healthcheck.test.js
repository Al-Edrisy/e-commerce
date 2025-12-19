const request = require('supertest');
const app = require('../app');

describe('Healthcheck', () => {
  it('should return 200 for /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

