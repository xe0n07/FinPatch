import { Loan } from '../Model/loanModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await Loan.findAll({ where: { userId: req.user.id }, order: [['date', 'DESC']] });
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    const { personName, amount, type, date, description } = req.body;
    if (!personName || !amount || !type || !date) return res.status(400).json({ message: 'All fields are required' });
    const data = await Loan.create({ userId: req.user.id, personName, amount: parseFloat(amount), type, date, description });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const remove = async (req, res) => {
  try {
    const l = await Loan.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!l) return res.status(404).json({ message: 'Loan not found' });
    await l.destroy();
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getSummary = async (req, res) => {
  try {
    const loans = await Loan.findAll({ where: { userId: req.user.id } });
    const lent = loans.filter(l => l.type === 'lent').reduce((s, l) => s + l.amount, 0);
    const owed = loans.filter(l => l.type === 'owed').reduce((s, l) => s + l.amount, 0);
    res.status(200).json({ lent, owed });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};