import { users } from '../Model/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'finpatch_jwt_secret_2024';
const signToken = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

export const getAll = async (req, res) => {
  try {
    const data = await users.findAll({ attributes: { exclude: ['customerPassword'] } });
    res.status(200).json({ data, message: 'Data fetched successfully' });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching data', error: e.message });
  }
};

export const save = async (req, res) => {
  try {
    const user = await users.create(req.body);
    res.status(201).json({ data: user, message: 'User created successfully' });
  } catch (e) {
    res.status(501).json({ message: 'Error creating user', error: e.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await users.findOne({ where: { id: req.params.id }, attributes: { exclude: ['customerPassword'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ data: user, message: 'Data fetched successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const result = await users.update(req.body, { where: { id: req.params.id } });
    if (result[0] === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const result = await users.destroy({ where: { id: req.params.id } });
    if (result === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const register = async (req, res) => {
  try {
    const { customerName, email, customerPassword, confirmPassword } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    if (!customerPassword) return res.status(400).json({ message: 'Password required' });
    if (customerPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      return res.status(400).json({ message: 'Invalid email format' });

    const existing = await users.findOne({ where: { email: trimmedEmail } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const newUser = await users.create({
      customerName: customerName || trimmedEmail.split('@')[0],
      email: trimmedEmail,
      customerPassword,
    });

    const token = signToken(newUser);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, customerName: newUser.customerName, email: newUser.email, currency: newUser.currency, currencySymbol: newUser.currencySymbol, onboardingComplete: newUser.onboardingComplete },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, customerPassword } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    if (!customerPassword) return res.status(400).json({ message: 'Password required' });

    const trimmedEmail = email.trim();
    const user = await users.findOne({ where: { email: trimmedEmail } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.customerPassword !== customerPassword) return res.status(401).json({ message: 'Invalid password' });

    const token = signToken(user);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, customerName: user.customerName, email: user.email, currency: user.currency, currencySymbol: user.currencySymbol, onboardingComplete: user.onboardingComplete },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const { customerName, currency, currencySymbol } = req.body;
    const user = await users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ customerName, currency, currencySymbol, onboardingComplete: true });
    res.status(200).json({
      message: 'Onboarding complete',
      user: { id: user.id, customerName: user.customerName, email: user.email, currency: user.currency, currencySymbol: user.currencySymbol, onboardingComplete: user.onboardingComplete },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await users.findByPk(req.user.id, { attributes: { exclude: ['customerPassword'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};