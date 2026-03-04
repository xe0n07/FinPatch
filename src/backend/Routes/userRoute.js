import express from 'express';
import { getAll, save, getUserById, updateUserById, deleteUserById, register, login, completeOnboarding, getProfile } from '../Controller/userController.js';
import { auth } from '../Middleware/auth.js';

const userroute = express.Router();

userroute.get('/', auth, getAll);
userroute.post('/', auth, save);
userroute.get('/profile', auth, getProfile);
userroute.put('/onboarding', auth, completeOnboarding);
userroute.get('/:id', auth, getUserById);
userroute.patch('/:id', auth, updateUserById);
userroute.delete('/:id', auth, deleteUserById);
userroute.post('/register', register);
userroute.post('/login', login);

export { userroute };