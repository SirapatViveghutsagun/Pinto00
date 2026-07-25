import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

export class MemoryTransactionRepository implements TransactionRepository {
  private readonly transactions = new Map<string, Transaction>()

  async findAll(userId: string): Promise<Transaction[]> {
    return [...this.transactions.values()]
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) ?? null
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const now = new Date().toISOString()
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }
    this.transactions.set(transaction.id, transaction)
    return transaction
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = this.transactions.get(id)
    if (!existing) return null
    const updated: Transaction = {
      ...existing,
      type: input.type ?? existing.type,
      category: input.category ?? existing.category,
      amount: input.amount ?? existing.amount,
      description: input.description ?? existing.description,
      date: input.date ?? existing.date,
      updatedAt: new Date().toISOString(),
    }
    this.transactions.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.transactions.delete(id)
  }
}
