import { Transaction } from '../Model/TransactionModel.js';
import { Op } from 'sequelize';

const monthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { start, end };
};

export const getAll = async (req, res) => {
  try {
    const data = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    if (!title || !amount || !type || !category || !date)
      return res.status(400).json({ message: 'All fields are required' });
    const data = await Transaction.create({ userId: req.user.id, title, amount: parseFloat(amount), type, category, date });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const remove = async (req, res) => {
  try {
    const t = await Transaction.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!t) return res.status(404).json({ message: 'Transaction not found' });
    await t.destroy();
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getSummary = async (req, res) => {
  try {
    const { start, end } = monthRange();
    const txs = await Transaction.findAll({ where: { userId: req.user.id, date: { [Op.between]: [start, end] } } });
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    res.status(200).json({ income, expense, net: income - expense });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getMonthlyData = async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      const txs = await Transaction.findAll({ where: { userId: req.user.id, date: { [Op.between]: [start, end] } } });
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      months.push({ month: d.toLocaleString('default', { month: 'short' }), income, expense });
    }
    res.status(200).json(months);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getCategoryData = async (req, res) => {
  try {
    const { start, end } = monthRange();
    const txs = await Transaction.findAll({ where: { userId: req.user.id, type: 'expense', date: { [Op.between]: [start, end] } } });
    const map = {};
    txs.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    const data = Object.entries(map).map(([name, value]) => ({ name, value, percent: total ? Math.round((value / total) * 100) : 0 }));
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};