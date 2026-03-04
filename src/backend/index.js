import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';
import { connectDB } from './Database/db.js';
import { userroute } from './Routes/userRoute.js';
import { transactionRoute } from './Routes/transactionRoute.js';
import { budgetRoute } from './Routes/budgetRoute.js';
import { accountRoute } from './Routes/accountRoute.js';
import { loanRoute } from './Routes/loanRoute.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userroute);
app.use('/api/transactions', transactionRoute);
app.use('/api/budgets', budgetRoute);
app.use('/api/accounts', accountRoute);
app.use('/api/loans', loanRoute);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Finpatch server running on http://localhost:${PORT}`));
});