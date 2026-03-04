import { DataTypes } from 'sequelize';
import { sequelize } from '../Database/db.js';

export const users = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  customerPassword: { type: DataTypes.STRING, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'USD' },
  currencySymbol: { type: DataTypes.STRING, defaultValue: '$' },
  onboardingComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
});