import { z } from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense'])

export const createTransactionSchema = z.object({
  userId: z.string().uuid(),
  type: transactionTypeSchema,
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string().min(1),
})

export const updateTransactionSchema = z.object({
  type: transactionTypeSchema.optional(),
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
})

export const transactionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: transactionTypeSchema,
  category: z.string(),
  amount: z.number(),
  description: z.string(),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const idParamSchema = z.object({
  id: z.string().uuid(),
})

export const listTransactionsQuerySchema = z.object({
  userId: z.string().uuid(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
