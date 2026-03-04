import express from 'express';
import cors from 'cors';
import { connectDB } from './src/Database/db.js';
import { userroute } from './src/Routes/userRoute.js';
import process from 'process';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// API routes
app.use('/api/users', userroute);

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
