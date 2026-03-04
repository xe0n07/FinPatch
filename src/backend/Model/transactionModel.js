import { DataTypes } from 'sequelize';
import { sequelize } from '../Database/db.js';

export const Transaction = sequelize.define('transaction', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  accountId: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
});