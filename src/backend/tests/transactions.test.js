/**
 * transactions.test.js — Transaction endpoint tests.
 * All database calls are mocked. No PostgreSQL connection needed.
 */

// ─── Set JWT_SECRET before anything loads ────────────────────────────────────
// auth.js reads process.env.JWT_SECRET. In tests dotenv may not load,
// so we set it here to match the value in .env.
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
import { Transaction } from '../Model/TransactionModel.js';

const JWT_SECRET = 'finpatch_jwt_secret_2024';
const USER_ID = 'user-uuid-abc';
const validToken = () =>
  `Bearer ${jwt.sign({ id: USER_ID, email: 'user@test.com' }, JWT_SECRET, { expiresIn: '7d' })}`;

const sampleTransaction = {
  id: 'txn-uuid-001',
  userId: USER_ID,
  title: 'Groceries',
  amount: 1200,
  type: 'expense',
  category: 'Food',
  date: '2026-03-01',
  destroy: jest.fn().mockResolvedValue(true),
};

const sampleIncome = {
  id: 'txn-uuid-002',
  userId: USER_ID,
  title: 'Freelance Payment',
  amount: 30000,
  type: 'income',
  category: 'Freelance',
  date: '2026-03-05',
};


// ════════════════════════════════════════════════════════════════════════════
//  FETCH ALL TRANSACTIONS
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/transactions', () => {

  test('returns all transactions for the logged-in user', async () => {
    Transaction.findAll.mockResolvedValue([sampleTransaction, sampleIncome]);

    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Groceries');
  });

  test('returns an empty array when user has no transactions', async () => {
    Transaction.findAll.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 401 if no token is provided', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(401);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  CREATE TRANSACTION
// ════════════════════════════════════════════════════════════════════════════
describe('POST /api/transactions', () => {

  test('creates a valid expense transaction and returns 201', async () => {
    Transaction.create.mockResolvedValue(sampleTransaction);

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', validToken())
      .send({ title: 'Groceries', amount: 1200, type: 'expense', category: 'Food', date: '2026-03-01' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Groceries');
    expect(res.body.type).toBe('expense');
  });

  test('creates a valid income transaction and returns 201', async () => {
    Transaction.create.mockResolvedValue(sampleIncome);

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', validToken())
      .send({ title: 'Freelance Payment', amount: 30000, type: 'income', category: 'Freelance', date: '2026-03-05' });

    expect(res.statusCode).toBe(201);
    expect(res.body.amount).toBe(30000);
  });

  test('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', validToken())
      .send({ title: 'Incomplete transaction' });  // missing amount, type, category, date

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test('returns 400 when amount is missing', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', validToken())
      .send({ title: 'No amount', type: 'expense', category: 'Food', date: '2026-03-01' });

    expect(res.statusCode).toBe(400);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  DELETE TRANSACTION
// ════════════════════════════════════════════════════════════════════════════
describe('DELETE /api/transactions/:id', () => {

  test('deletes a transaction that belongs to the user', async () => {
    Transaction.findOne.mockResolvedValue(sampleTransaction);

    const res = await request(app)
      .delete(`/api/transactions/${sampleTransaction.id}`)
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    expect(sampleTransaction.destroy).toHaveBeenCalled();
  });

  test('returns 404 when the transaction does not exist', async () => {
    Transaction.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/transactions/nonexistent-id')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(404);
  });

  test('returns 404 when the transaction belongs to a different user', async () => {
    // Controller scopes findOne by userId, so another user's record returns null
    Transaction.findOne.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/transactions/someone-elses-txn')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(404);
  });

});


// ════════════════════════════════════════════════════════════════════════════
//  MONTHLY SUMMARY
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/transactions/summary', () => {

  test('correctly sums income and expense for the current month', async () => {
    Transaction.findAll.mockResolvedValue([
      { type: 'income',  amount: 50000 },
      { type: 'expense', amount: 12000 },
      { type: 'expense', amount: 5000  },
    ]);

    const res = await request(app)
      .get('/api/transactions/summary')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body.income).toBe(50000);
    expect(res.body.expense).toBe(17000);
    expect(res.body.net).toBe(33000);
  });

  test('returns zeros when there are no transactions this month', async () => {
    Transaction.findAll.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/transactions/summary')
      .set('Authorization', validToken());

    expect(res.statusCode).toBe(200);
    expect(res.body.income).toBe(0);
    expect(res.body.expense).toBe(0);
    expect(res.body.net).toBe(0);
  });

});