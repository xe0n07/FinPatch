import express from 'express';
import { getAll, create, remove, getTotalBalance } from '../Controller/accountController.js';
import { auth } from '../Middleware/auth.js';

const accountRoute = express.Router();

accountRoute.get('/total', auth, getTotalBalance);
accountRoute.get('/', auth, getAll);
accountRoute.post('/', auth, create);
accountRoute.delete('/:id', auth, remove);

export { accountRoute };