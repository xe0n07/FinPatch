import express from 'express';
import { getAll, create, remove, update, settle, getSummary } from '../Controller/loanController.js';
import { auth } from '../Middleware/auth.js';

const loanRoute = express.Router();

loanRoute.get('/summary', auth, getSummary);
loanRoute.get('/', auth, getAll);
loanRoute.post('/', auth, create);
loanRoute.patch('/:id', auth, update);
loanRoute.put('/:id/settle', auth, settle);
loanRoute.delete('/:id', auth, remove);

export { loanRoute };