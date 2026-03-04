import { Budget } from '../Model/budgetModel.js';
import { Transaction } from '../Model/TransactionModel.js';
import { Op } from 'sequelize';

const getSpentThisMonth = async (userId, category) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const txs = await Transaction.findAll({ where: { userId, category, type: 'expense', date: { [Op.between]: [start, end] } } });
  return txs.reduce((s, t) => s + t.amount, 0);
};

export const getAll = async (req, res) => {
  try {
    const budgets = await Budget.findAll({ where: { userId: req.user.id } });
    const data = await Promise.all(budgets.map(async (b) => {
      const spent = await getSpentThisMonth(req.user.id, b.category);
      return { ...b.toJSON(), spent };
    }));
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    const { category, budgetLimit, color } = req.body;
    if (!category || !budgetLimit) return res.status(400).json({ message: 'Category and limit required' });
    const data = await Budget.create({ userId: req.user.id, category, budgetLimit: parseFloat(budgetLimit), color });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const remove = async (req, res) => {
  try {
    const b = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!b) return res.status(404).json({ message: 'Budget not found' });
    await b.destroy();
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};