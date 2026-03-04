import { Account } from '../Model/accountModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await Account.findAll({ where: { userId: req.user.id } });
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    const { name, type, balance, color } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Name and type required' });
    const data = await Account.create({ userId: req.user.id, name, type, balance: parseFloat(balance) || 0, color });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const remove = async (req, res) => {
  try {
    const a = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!a) return res.status(404).json({ message: 'Account not found' });
    await a.destroy();
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getTotalBalance = async (req, res) => {
  try {
    const accounts = await Account.findAll({ where: { userId: req.user.id } });
    const total = accounts.reduce((s, a) => s + a.balance, 0);
    res.status(200).json({ total, count: accounts.length });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};