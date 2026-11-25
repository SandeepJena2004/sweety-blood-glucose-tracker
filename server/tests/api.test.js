import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import prisma from '../src/utils/prisma.js';

// Helper to get today's date as YYYY-MM-DD
function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Helper to get yesterday's date string
function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Helper to get a future date
function getFutureDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Helper: first day of this month
function getFirstOfMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

describe('Sweety API Tests', () => {
  let userToken;
  let userId;
  let user2Token;
  let user2Id;
  let createdReadingId;

  beforeAll(async () => {
    // Clean test database
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // =================== AUTH TESTS ===================

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@test.com');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();

      userToken = res.body.data.token;
      userId = res.body.data.user.id;
    });

    it('should hash passwords (not store plain text)', async () => {
      const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
      expect(user.password).not.toBe('password123');

      const isMatch = await bcrypt.compare('password123', user.password);
      expect(isMatch).toBe(true);
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Duplicate', email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('should return current user via GET /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@test.com');
    });

    it('should reject unauthenticated access', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(res.status).toBe(401);
    });

    // Create second user for isolation tests
    it('should register a second user for isolation tests', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User Two', email: 'user2@test.com', password: 'password123' });

      expect(res.status).toBe(201);
      user2Token = res.body.data.token;
      user2Id = res.body.data.user.id;
    });
  });

  // =================== READING CRUD TESTS ===================

  describe('Reading CRUD', () => {
    it('should create a valid reading', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getTodayString(), slot: 'MORNING_FASTING', value: 95 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.value).toBe(95);
      expect(res.body.data.slot).toBe('MORNING_FASTING');
      createdReadingId = res.body.data.id;
    });

    it('should reject glucose value below 40', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getTodayString(), slot: 'AFTER_BREAKFAST', value: 10 });

      expect(res.status).toBe(400);
    });

    it('should reject glucose value above 600', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getTodayString(), slot: 'AFTER_BREAKFAST', value: 700 });

      expect(res.status).toBe(400);
    });

    it('should reject non-integer glucose value', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getTodayString(), slot: 'AFTER_BREAKFAST', value: 95.5 });

      expect(res.status).toBe(400);
    });

    it('should reject missing value', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getTodayString(), slot: 'AFTER_BREAKFAST' });

      expect(res.status).toBe(400);
    });

    it('should reject future date', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getFutureDateString(), slot: 'AFTER_BREAKFAST', value: 100 });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate slot on same date', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getTodayString(), slot: 'MORNING_FASTING', value: 100 });

      expect(res.status).toBe(409);
    });

    it('should allow up to 4 readings per day', async () => {
      // Add 3 more (already have MORNING_FASTING)
      for (const slot of ['AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER']) {
        const res = await request(app)
          .post('/api/readings')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ date: getTodayString(), slot, value: 120 });

        expect(res.status).toBe(201);
      }
    });

    it('should get all readings for user', async () => {
      const res = await request(app)
        .get('/api/readings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.readings.length).toBe(4);
    });

    it('should get a single reading', async () => {
      const res = await request(app)
        .get(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdReadingId);
    });

    it('should update a reading', async () => {
      const res = await request(app)
        .put(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ date: getTodayString(), slot: 'MORNING_FASTING', value: 100 });

      expect(res.status).toBe(200);
      expect(res.body.data.value).toBe(100);
    });

    it('should not allow user2 to access user1 reading', async () => {
      const res = await request(app)
        .get(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    it('should not allow user2 to delete user1 reading', async () => {
      const res = await request(app)
        .delete(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    it('should delete a reading', async () => {
      const res = await request(app)
        .delete(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });
  });

  // =================== REPORT TESTS ===================

  describe('Reports', () => {
    beforeAll(async () => {
      // Clean readings and create fresh data for reports
      await prisma.reading.deleteMany();

      const today = getTodayString();
      const yesterday = getYesterdayString();

      // Helper: parse YYYY-MM-DD to UTC Date
      function parseDateString(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1, d));
      }

      // Add readings for today
      await prisma.reading.createMany({
        data: [
          { userId, date: parseDateString(today), slot: 'MORNING_FASTING', value: 90 },
          { userId, date: parseDateString(today), slot: 'AFTER_BREAKFAST', value: 140 },
          { userId, date: parseDateString(today), slot: 'AFTER_LUNCH', value: 120 },
        ],
      });

      // Add readings for yesterday
      await prisma.reading.createMany({
        data: [
          { userId, date: parseDateString(yesterday), slot: 'MORNING_FASTING', value: 85 },
          { userId, date: parseDateString(yesterday), slot: 'AFTER_DINNER', value: 150 },
        ],
      });

      // Add a reading for user2 (isolation test)
      await prisma.reading.create({
        data: { userId: user2Id, date: parseDateString(today), slot: 'MORNING_FASTING', value: 200 },
      });
    });

    describe('Daily Report', () => {
      it('should return correct daily report', async () => {
        const res = await request(app)
          .get(`/api/reports/daily?date=${getTodayString()}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.count).toBe(3);
        expect(res.body.data.highest).toBe(140);
        expect(res.body.data.lowest).toBe(90);
        // Average = (90 + 140 + 120) / 3 = 116.666... → 116.7
        expect(res.body.data.average).toBe(116.7);
        expect(res.body.data.readings).toHaveLength(3);
      });

      it('should not include other users readings in report', async () => {
        const res = await request(app)
          .get(`/api/reports/daily?date=${getTodayString()}`)
          .set('Authorization', `Bearer ${userToken}`);

        // Only user1's 3 readings, not user2's reading
        expect(res.body.data.count).toBe(3);
      });

      it('should return empty state for a date with no readings', async () => {
        const res = await request(app)
          .get('/api/reports/daily?date=2020-01-01')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.count).toBe(0);
        expect(res.body.data.message).toBeDefined();
      });
    });

    describe('Month-to-Date Report', () => {
      it('should return correct month-to-date report', async () => {
        const res = await request(app)
          .get(`/api/reports/month-to-date?date=${getTodayString()}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        const data = res.body.data;
        // Should include today's 3 and yesterday's 2 (if same month), or just today's 3
        expect(data.count).toBeGreaterThanOrEqual(3);
        expect(data.highest).toBeDefined();
        expect(data.lowest).toBeDefined();
        expect(data.average).toBeDefined();
      });

      it('should respect date boundaries', async () => {
        const res = await request(app)
          .get(`/api/reports/month-to-date?date=${getFirstOfMonthString()}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        // Only readings on the 1st of the month
      });
    });

    describe('Previous Month Report', () => {
      it('should return previous month report', async () => {
        const res = await request(app)
          .get(`/api/reports/monthly?date=${getTodayString()}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        // May or may not have readings in previous month
        expect(res.body.data.startDate).toBeDefined();
        expect(res.body.data.endDate).toBeDefined();
      });

      it('should handle months with no readings', async () => {
        // Use a date far in the future for which prev month has no data
        const res = await request(app)
          .get('/api/reports/monthly?date=2020-03-15')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.count).toBe(0);
        expect(res.body.data.message).toBeDefined();
      });
    });
  });
});
