import type { Context } from 'hono'
import type { CreateTransactionInput, UpdateTransactionInput } from '../domain/entities/transaction'
import { ValidationError } from '../domain/errors'
import type { TransactionService } from '../services/transaction-service'

export class TransactionHandler {
  constructor(private readonly transactionService: TransactionService) {}

  list = async (c: Context) => {
    const userId = c.req.query('userId')
    if (!userId) return c.json({ error: 'userId query parameter is required' }, 400)
    const transactions = await this.transactionService.listTransactions(userId)
    return c.json({ data: transactions })
  }

  get = async (c: Context) => {
    const { id } = c.req.param() as { id: string }
    try {
      const transaction = await this.transactionService.getTransaction(id)
      return c.json({ data: transaction })
    } catch (e) {
      if (e instanceof ValidationError) return c.json({ error: e.message }, 400)
      return c.json({ error: (e as Error).message }, 404)
    }
  }

  create = async (c: Context) => {
    const body = await c.req.json<CreateTransactionInput>()
    try {
      const transaction = await this.transactionService.createTransaction(body)
      return c.json({ data: transaction }, 201)
    } catch (e) {
      if (e instanceof ValidationError) return c.json({ error: e.message }, 400)
      throw e
    }
  }

  update = async (c: Context) => {
    const { id } = c.req.param() as { id: string }
    const body = await c.req.json<UpdateTransactionInput>()
    try {
      const transaction = await this.transactionService.updateTransaction(id, body)
      return c.json({ data: transaction })
    } catch (e) {
      if (e instanceof ValidationError) return c.json({ error: e.message }, 400)
      return c.json({ error: (e as Error).message }, 404)
    }
  }

  delete = async (c: Context) => {
    const { id } = c.req.param() as { id: string }
    try {
      await this.transactionService.deleteTransaction(id)
      return c.body(null, 204)
    } catch (e) {
      return c.json({ error: (e as Error).message }, 404)
    }
  }
}
