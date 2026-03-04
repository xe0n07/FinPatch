import { DataTypes } from 'sequelize';
import { sequelize } from '../Database/db.js';

export const Budget = sequelize.define('budget', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  budgetLimit: { type: DataTypes.FLOAT, allowNull: false },
  color: { type: DataTypes.STRING, defaultValue: '#F4927A' },
});