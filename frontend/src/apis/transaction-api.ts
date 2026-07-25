import { request } from './request'
import type {
  CreateTransactionInput,
  Transaction,
  TransactionApiResponse,
  UpdateTransactionInput,
} from '@/models/transaction'

function isTxArray(res: TransactionApiResponse): res is { data: Transaction[] } {
  return Array.isArray(res.data)
}

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/transactions`

export const transactionApi = {
  list: (userId: string) =>
    request<TransactionApiResponse>(`${BASE}?userId=${userId}`).then(
      (res) => (isTxArray(res) ? res.data : []),
    ),

  get: (id: string) =>
    request<TransactionApiResponse>(`${BASE}/${id}`).then(
      (res) => (isTxArray(res) ? res.data[0] : res.data) as Transaction,
    ),

  create: (body: CreateTransactionInput) =>
    request<TransactionApiResponse>(BASE, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((res) => (isTxArray(res) ? res.data[0] : res.data) as Transaction),

  update: (id: string, body: UpdateTransactionInput) =>
    request<TransactionApiResponse>(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }).then((res) => (isTxArray(res) ? res.data[0] : res.data) as Transaction),

  remove: (id: string) =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
