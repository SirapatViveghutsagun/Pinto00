export interface Transaction {
  id: string
  userId: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionInput {
  userId: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense'
  category?: string
  amount?: number
  description?: string
  date?: string
}

export interface TransactionApiResponse {
  data: Transaction | Transaction[]
}

export const TRANSACTION_CATEGORIES = [
  { value: 'food', label: 'อาหาร' },
  { value: 'transport', label: 'เดินทาง' },
  { value: 'shopping', label: 'ช้อปปิ้ง' },
  { value: 'utility', label: 'ค่าสาธารณูปโภค' },
  { value: 'entertainment', label: 'บันเทิง' },
  { value: 'health', label: 'สุขภาพ' },
  { value: 'education', label: 'การศึกษา' },
  { value: 'salary', label: 'เงินเดือน' },
  { value: 'investment', label: 'ลงทุน' },
  { value: 'other', label: 'อื่นๆ' },
] as const
