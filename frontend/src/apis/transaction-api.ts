import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '@/models/transaction'
import { api } from '@/utils/api'

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const res = await api.get(`/api/v1/transactions?userId=${userId}`)
  const json = await res.json<{ data: Transaction[] }>()
  return json.data
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const res = await api.get(`/api/v1/transactions/${id}`)
  const json = await res.json<{ data: Transaction }>()
  return json.data
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const res = await api.post('/api/v1/transactions', { body: input })
  const json = await res.json<{ data: Transaction }>()
  return json.data
}

export async function updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
  const res = await api.patch(`/api/v1/transactions/${id}`, { body: input })
  const json = await res.json<{ data: Transaction }>()
  return json.data
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/api/v1/transactions/${id}`)
}
