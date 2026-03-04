import express from 'express';
import { getAll, create, remove, getSummary, getMonthlyData, getCategoryData } from '../Controller/transactionController.js';
import { auth } from '../Middleware/auth.js';

const transactionRoute = express.Router();

transactionRoute.get('/', auth, getAll);
transactionRoute.post('/', auth, create);
transactionRoute.delete('/:id', auth, remove);
transactionRoute.get('/summary', auth, getSummary);
transactionRoute.get('/monthly', auth, getMonthlyData);
transactionRoute.get('/categories', auth, getCategoryData);

export { transactionRoute };