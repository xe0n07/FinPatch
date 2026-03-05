// app.js — Express app exported separately from server startup.
// This lets the test files import the app without triggering
// a real database connection or a listen() call.

import express from 'express';
import cors from 'cors';
import { userroute } from './Routes/userRoute.js';
import { transactionRoute } from './Routes/transactionRoute.js';
import { budgetRoute } from './Routes/budgetRoute.js';
import { accountRoute } from './Routes/accountRoute.js';
import { loanRoute } from './Routes/loanRoute.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userroute);
app.use('/api/transactions', transactionRoute);
app.use('/api/budgets', budgetRoute);
app.use('/api/accounts', accountRoute);
app.use('/api/loans', loanRoute);

export default app;