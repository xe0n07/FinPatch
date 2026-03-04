import express from 'express';
import { getAll, create, remove } from '../Controller/budgetController.js';
import { auth } from '../Middleware/auth.js';

const budgetRoute = express.Router();

budgetRoute.get('/', auth, getAll);
budgetRoute.post('/', auth, create);
budgetRoute.delete('/:id', auth, remove);

export { budgetRoute };