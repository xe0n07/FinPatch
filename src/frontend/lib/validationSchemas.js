import { z } from 'zod';

export const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  accountId: z.coerce.number().optional().nullable(),
});

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  budgetLimit: z.coerce.number().positive('Budget limit must be greater than 0'),
});

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  balance: z.coerce.number().default(0),
});

export const loanSchema = z.object({
  personName: z.string().min(1, 'Person/Entity name is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  type: z.enum(['lent', 'owed']),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});
