/**
 * budgets_accounts.test.js — Budget and Account endpoint tests.
 * All database calls are mocked. No PostgreSQL connection needed.
 */

// ─── Set JWT_SECRET before anything loads ────────────────────────────────────
process.env.JWT_SECRET = 'finpatch_jwt_secret_2024';

// ─── Mock db.js FIRST ────────────────────────────────────────────────────────
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
import { Budget } from '../Model/budgetModel.js';
import { Transaction } from '../Model/TransactionModel.js';
import { Account } from '../Model/accountModel.js';

const JWT_SECRET = 'finpatch_jwt_secret_2024';
const USER_ID = 'budget-test-user';
const validToken = () =>
  `Bearer ${jwt.sign({ id: USER_ID, email: 'budget@test.com' }, JWT_SECRET, { expiresIn: '7d' })}`;


// ════════════════════════════════════════════════════════════════════════════
//  BUDGETS — FETCH ALL
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/budgets', () => {

  test('returns all budgets with a spent field attached', async () => {
    Budget.findAll.mockResolvedValue([{
      id: 'budget-001',
      category: 'Food',
      budgetLimit: 5000,
      color: '#F4927A',
      toJSON: () => ({ id: 'budget-001', category: 'Food', budgetLimit: 5000, color: '#F4927A' }),
    }]);

    // Simulate Rs. 1200 spent on Food this month
    Transaction.findAll.mockResolvedValue([
      { type: 'expense', amount: 800 },
      { type: 'expense', amount: 400 },
    ]);

    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('spent');
    expect(res.body[0].spent).toBe(1200);        // 800 + 400
    expect(res.body[0].budgetLimit).toBe(5000);
  });

  test('returns empty array when there are no budgets', async () => {
    Budget.findAll.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  BUDGETS — CREATE
// ════════════════════════════════════════════════════════════════════════════
describe('POST /api/budgets', () => {

  test('creates a budget and returns 201', async () => {
    Budget.create.mockResolvedValue({
      id: 'budget-002', userId: USER_ID, category: 'Transport', budgetLimit: 3000, color: '#3B82F6',
    });

    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', validToken())
      .send({ category: 'Transport', budgetLimit: 3000, color: '#3B82F6' });

    expect(res.statusCode).toBe(201);
    expect(res.body.category).toBe('Transport');
    expect(res.body.budgetLimit).toBe(3000);
  });

  test('returns 400 when category or budgetLimit is missing', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', validToken())
      .send({ color: '#3B82F6' });  // missing category and budgetLimit

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  BUDGETS — DELETE
// ════════════════════════════════════════════════════════════════════════════
describe('DELETE /api/budgets/:id', () => {

  test('deletes a budget that belongs to the user', async () => {
    const mockDestroy = jest.fn().mockResolvedValue(true);
    Budget.findOne.mockResolvedValue({ id: 'budget-001', destroy: mockDestroy });

    const res = await request(app)
      .delete('/api/budgets/budget-001')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(mockDestroy).toHaveBeenCalled();
  });

  test('returns 404 when the budget does not exist', async () => {
    Budget.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/budgets/does-not-exist')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(404);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  ACCOUNTS — FETCH ALL
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/accounts', () => {

  test('returns all accounts for the logged-in user', async () => {
    Account.findAll.mockResolvedValue([
      { id: 'acc-001', name: 'Main Bank', type: 'Bank',    balance: 45000 },
      { id: 'acc-002', name: 'Savings',   type: 'Savings', balance: 120000 },
    ]);

    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Main Bank');
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  ACCOUNTS — CREATE
// ════════════════════════════════════════════════════════════════════════════
describe('POST /api/accounts', () => {

  test('creates an account and returns 201', async () => {
    Account.create.mockResolvedValue({
      id: 'acc-003', userId: USER_ID, name: 'My Wallet', type: 'Wallet', balance: 5000, color: '#22C55E',
    });

    const res = await request(app)
      .post('/api/accounts')
      .set('Authorization', validToken())
      .send({ name: 'My Wallet', type: 'Wallet', balance: 5000, color: '#22C55E' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('My Wallet');
    expect(res.body.type).toBe('Wallet');
  });

  test('returns 400 when name or type is missing', async () => {
    const res = await request(app)
      .post('/api/accounts')
      .set('Authorization', validToken())
      .send({ balance: 5000 });  // missing name and type

    expect(res.statusCode).toBe(400);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  ACCOUNTS — TOTAL BALANCE
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/accounts/total', () => {

  test('returns the correct combined balance across all accounts', async () => {
    Account.findAll.mockResolvedValue([
      { balance: 45000 },
      { balance: 120000 },
      { balance: 8500 },
    ]);

    const res = await request(app)
      .get('/api/accounts/total')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(173500);  // 45000 + 120000 + 8500
    expect(res.body.count).toBe(3);
  });

  test('returns 0 when the user has no accounts', async () => {
    Account.findAll.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/accounts/total')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(0);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  ACCOUNTS — DELETE
// ════════════════════════════════════════════════════════════════════════════
describe('DELETE /api/accounts/:id', () => {

  test('deletes an account and returns 200', async () => {
    const mockDestroy = jest.fn().mockResolvedValue(true);
    Account.findOne.mockResolvedValue({ id: 'acc-001', destroy: mockDestroy });

    const res = await request(app)
      .delete('/api/accounts/acc-001')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(mockDestroy).toHaveBeenCalled();
  });

  test('returns 404 when the account is not found', async () => {
    Account.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/accounts/nonexistent')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(404);
  });

});