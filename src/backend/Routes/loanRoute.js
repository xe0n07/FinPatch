import express from 'express';
import { getAll, create, remove, getSummary } from '../Controller/loanController.js';
import { auth } from '../Middleware/auth.js';

const loanRoute = express.Router();

loanRoute.get('/summary', auth, getSummary);
loanRoute.get('/', auth, getAll);
loanRoute.post('/', auth, create);
loanRoute.delete('/:id', auth, remove);

export { loanRoute };