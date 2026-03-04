import { DataTypes } from 'sequelize';
import { sequelize } from '../Database/db.js';

export const Account = sequelize.define('account', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('Bank', 'Savings', 'Wallet', 'Investing', 'Other'), allowNull: false },
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  color: { type: DataTypes.STRING, defaultValue: '#22C55E' },
});