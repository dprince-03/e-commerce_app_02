import request from 'supertest';
import { createApp } from '../src/app.js';

let app;

beforeAll(async () => {
  app = await createApp();
});

test('health endpoint', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
});

