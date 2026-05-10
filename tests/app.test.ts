import request from 'supertest';
import app from '../src/app';

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('code', 200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'healthy');
  });
});

describe('API Routes', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
  });
});
