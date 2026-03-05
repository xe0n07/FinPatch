/**
 * auth.test.js — Registration, Login, and Profile endpoint tests.
 * All database calls are mocked. No PostgreSQL connection needed.
 */

// ─── Set JWT_SECRET before anything else loads ───────────────────────────────
// auth.js reads process.env.JWT_SECRET via dotenv. In the test environment
// .env may not load, so we set it manually here first.
process.env.JWT_SECRET = 'finpatch_jwt_secret_2024';

// ─── Mock db.js FIRST — before any other imports ────────────────────────────
jest.mock('../Database/db.js', () => {
  const fakeModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  };
  return {
    connectDB: jest.fn(),
    sequelize: {
      define: jest.fn(() => fakeModel),
      authenticate: jest.fn().mockResolvedValue(true),
      sync: jest.fn().mockResolvedValue(true),
    },
  };
});

// ─── Mock all models ─────────────────────────────────────────────────────────
jest.mock('../Model/userModel.js', () => ({
  users: { findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn(), findAll: jest.fn() },
}));
jest.mock('../Model/transactionModel.js', () => ({
  Transaction: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
}));
jest.mock('../Model/budgetModel.js', () => ({
  Budget: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
}));
jest.mock('../Model/accountModel.js', () => ({
  Account: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
}));
jest.mock('../Model/loanModel.js', () => ({
  Loan: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { users } from '../Model/userModel.js';

const JWT_SECRET = 'finpatch_jwt_secret_2024';
const makeToken = (id = 'test-uuid-1234', email = 'test@example.com') =>
  jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });


// ════════════════════════════════════════════════════════════════════════════
//  REGISTRATION
// ════════════════════════════════════════════════════════════════════════════
describe('POST /api/users/register', () => {

  test('registers a new user and returns a token', async () => {
    users.findOne.mockResolvedValue(null); // no existing user

    users.create.mockResolvedValue({
      id: 'new-uuid-9999',
      customerName: 'John Doe',
      email: 'john@example.com',
      currency: 'USD',
      currencySymbol: '$',
      onboardingComplete: false,
    });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        customerName: 'John Doe',
        email: 'john@example.com',
        customerPassword: 'securepassword123',
        confirmPassword: 'securepassword123',  // controller requires this field
        currency: 'USD',
        currencySymbol: '$',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('customerPassword');
  });

  test('rejects registration if email is already taken', async () => {
    users.findOne.mockResolvedValue({ id: 'existing', email: 'taken@example.com' });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        customerName: 'Jane',
        email: 'taken@example.com',
        customerPassword: 'password123',
        confirmPassword: 'password123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already/i);
  });

  test('rejects registration when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        customerName: 'Jane',
        email: 'jane@example.com',
        customerPassword: 'password123',
        confirmPassword: 'differentpassword',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/passwords do not match/i);
  });

  test('rejects registration when email is missing', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ customerPassword: 'password123', confirmPassword: 'password123' });

    expect(res.statusCode).toBe(400);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════════════════════
describe('POST /api/users/login', () => {

  // NOTE: The login controller compares passwords as plain strings
  // (user.customerPassword !== customerPassword), not with bcrypt.
  // Tests reflect the actual controller behaviour.

  test('logs in with correct credentials and returns a token', async () => {
    users.findOne.mockResolvedValue({
      id: 'test-uuid-1234',
      customerName: 'Test User',
      email: 'test@example.com',
      customerPassword: 'correctpassword',  // plain string — matches controller logic
      currency: 'USD',
      currencySymbol: '$',
      onboardingComplete: true,
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', customerPassword: 'correctpassword' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  test('rejects login with the wrong password', async () => {
    users.findOne.mockResolvedValue({
      id: 'test-uuid-1234',
      email: 'test@example.com',
      customerPassword: 'correctpassword',
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', customerPassword: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('rejects login if email does not exist', async () => {
    users.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nobody@example.com', customerPassword: 'somepassword' });

    expect(res.statusCode).toBe(404);
  });

  test('rejects login when email field is missing', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ customerPassword: 'somepassword' });

    expect(res.statusCode).toBe(400);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/users/profile', () => {

  // getProfile uses users.findByPk (not findOne)
  test('returns the user profile with a valid token', async () => {
    users.findByPk.mockResolvedValue({
      id: 'test-uuid-1234',
      customerName: 'Test User',
      email: 'test@example.com',
      currency: 'USD',
      currencySymbol: '$',
      onboardingComplete: true,
    });

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });

  test('returns 401 if no token is provided', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
  });

  test('returns 401 if the token is invalid', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer this.is.not.valid');
    expect(res.statusCode).toBe(401);
  });

});