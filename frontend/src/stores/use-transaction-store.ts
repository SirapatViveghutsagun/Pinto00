import { acceptHMRUpdate, defineStore } from 'pinia'
import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '@/models/transaction'
import * as transactionApi from '@/apis/transaction-api'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalIncome = computed(() =>
    transactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpense.value)

  async function loadTransactions(userId: string) {
    loading.value = true
    error.value = null
    try {
      transactions.value = await transactionApi.list(userId)
    } catch (e) {
      error.value = 'Failed to load transactions'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(input: CreateTransactionInput) {
    loading.value = true
    error.value = null
    try {
      const created = await transactionApi.create(input)
      transactions.value.unshift(created)
      return created
    } catch (e) {
      error.value = 'Failed to create transaction'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function editTransaction(id: string, input: UpdateTransactionInput) {
    loading.value = true
    error.value = null
    try {
      const updated = await transactionApi.update(id, input)
      const idx = transactions.value.findIndex((t) => t.id === id)
      if (idx !== -1) transactions.value[idx] = updated
      return updated
    } catch (e) {
      error.value = 'Failed to update transaction'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeTransaction(id: string) {
    loading.value = true
    error.value = null
    try {
      await transactionApi.remove(id)
      transactions.value = transactions.value.filter((t) => t.id !== id)
    } catch (e) {
      error.value = 'Failed to delete transaction'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    loading,
    error,
    totalIncome,
    totalExpense,
    balance,
    loadTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot))
