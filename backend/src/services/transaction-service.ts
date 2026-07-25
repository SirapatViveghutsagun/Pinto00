import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async listTransactions(userId: string): Promise<Transaction[]> {
    if (!userId?.trim()) throw new ValidationError('userId is required')
    return this.transactionRepository.findAll(userId)
  }

  async getTransaction(id: string): Promise<Transaction> {
    if (!id?.trim()) throw new ValidationError('id is required')
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    this.validateTransaction(input)

    return this.transactionRepository.create({
      userId: input.userId,
      type: input.type,
      category: input.category,
      amount: input.amount,
      description: input.description.trim(),
      date: input.date,
    })
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (!id?.trim()) throw new ValidationError('id is required')

    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError('amount must be greater than 0')
    }
    if (input.type !== undefined && !['income', 'expense'].includes(input.type)) {
      throw new ValidationError('type must be "income" or "expense"')
    }

    const updated = await this.transactionRepository.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!id?.trim()) throw new ValidationError('id is required')
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }

  private validateTransaction(input: CreateTransactionInput): void {
    if (!input.userId?.trim()) throw new ValidationError('userId is required')
    if (!['income', 'expense'].includes(input.type)) throw new ValidationError('type must be "income" or "expense"')
    if (!input.category?.trim()) throw new ValidationError('category is required')
    if (!input.amount || input.amount <= 0) throw new ValidationError('amount must be greater than 0')
    if (!input.description?.trim()) throw new ValidationError('description is required')
    if (!input.date?.trim()) throw new ValidationError('date is required')
    if (isNaN(Date.parse(input.date))) throw new ValidationError('date must be a valid ISO date')
  }
}
