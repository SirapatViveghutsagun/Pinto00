import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

interface TransactionRow {
  id: string
  user_id: string
  type: string
  category: string
  amount: number
  description: string
  date: string
  created_at: string
  updated_at: string
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as 'income' | 'expense',
    category: row.category,
    amount: row.amount,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1TransactionRepository implements TransactionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(userId: string): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, user_id, type, category, amount, description, date, created_at, updated_at FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC')
      .bind(userId)
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.db
      .prepare('SELECT id, user_id, type, category, amount, description, date, created_at, updated_at FROM transactions WHERE id = ?')
      .bind(id)
      .first<TransactionRow>()
    return row ? toTransaction(row) : null
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO transactions (id, user_id, type, category, amount, description, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.userId, input.type, input.category, input.amount, input.description, input.date, now, now)
      .run()
    return { id, ...input, createdAt: now, updatedAt: now }
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const type = input.type ?? existing.type
    const category = input.category ?? existing.category
    const amount = input.amount ?? existing.amount
    const description = input.description ?? existing.description
    const date = input.date ?? existing.date
    const now = new Date().toISOString()

    await this.db
      .prepare('UPDATE transactions SET type = ?, category = ?, amount = ?, description = ?, date = ?, updated_at = ? WHERE id = ?')
      .bind(type, category, amount, description, date, now, id)
      .run()

    return { ...existing, type, category, amount, description, date, updatedAt: now }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
