import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Expense Tracker API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.DB_PATH = ':memory:';
    process.env.SEED_DEMO = 'false';
    process.env.JWT_SECRET = 'e2e-secret';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  it('rejects unauthenticated access to protected routes', () =>
    request(app.getHttpServer()).get('/api/expenses').expect(401));

  it('validates the register payload', () =>
    request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: '', email: 'not-an-email', password: 'short' })
      .expect(400));

  it('supports the full register → categorise → track → summarise flow', async () => {
    const server = app.getHttpServer();
    const reg = await request(server)
      .post('/api/auth/register')
      .send({ name: 'E2E', email: 'e2e@example.com', password: 'password123' })
      .expect(201);
    const auth = { Authorization: `Bearer ${reg.body.accessToken}` };

    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: 'e2e@example.com', password: 'password123' })
      .expect(200);
    expect(login.body.user.email).toBe('e2e@example.com');

    const cats = await request(server).get('/api/categories').set(auth).expect(200);
    expect(cats.body.length).toBeGreaterThan(0);
    const food = cats.body.find((c: { name: string }) => c.name === 'Food');

    const created = await request(server)
      .post('/api/expenses')
      .set(auth)
      .send({ description: 'Ramen', amount: 14.5, date: '2025-05-02', categoryId: food.id })
      .expect(201);

    await request(server)
      .patch(`/api/expenses/${created.body.id}`)
      .set(auth)
      .send({ amount: 16 })
      .expect(200);

    const summary = await request(server).get('/api/expenses/summary?month=2025-05').set(auth).expect(200);
    expect(summary.body).toMatchObject({ month: '2025-05', total: 16, count: 1 });

    await request(server).delete(`/api/categories/${food.id}`).set(auth).expect(409);
    await request(server).delete(`/api/expenses/${created.body.id}`).set(auth).expect(204);
    await request(server).get(`/api/expenses/${created.body.id}`).set(auth).expect(404);
  });
});
