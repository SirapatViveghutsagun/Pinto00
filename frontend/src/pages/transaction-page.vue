<template>
  <div>
    <VRow>
      <VCol cols="12">
        <h1 class="text-h4 mb-4">💰 รายรับรายจ่าย</h1>
      </VCol>

      <!-- Summary Cards -->
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="text-center">
            <div class="text-subtitle-1 text-medium-emphasis">รายรับทั้งหมด</div>
            <div class="text-h4 text-success">+{{ formatBaht(totalIncome) }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="text-center">
            <div class="text-subtitle-1 text-medium-emphasis">รายจ่ายทั้งหมด</div>
            <div class="text-h4 text-error">-{{ formatBaht(totalExpense) }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="text-center">
            <div class="text-subtitle-1 text-medium-emphasis">คงเหลือ</div>
            <div class="text-h4" :class="balance >= 0 ? 'text-primary' : 'text-error'">{{ formatBaht(balance) }}</div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Add Transaction Button -->
      <VCol cols="12">
        <VBtn prepend-icon="ri-add-line" color="primary" @click="showAddDialog = true">
          เพิ่มรายการ
        </VBtn>
      </VCol>

      <!-- Transaction List -->
      <VCol cols="12">
        <VCard>
          <VCardText>
            <VTable class="text-no-wrap">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th>หมวดหมู่</th>
                  <th>รายละเอียด</th>
                  <th class="text-end">จำนวนเงิน</th>
                  <th class="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in transactions" :key="t.id">
                  <td>{{ formatDate(t.date) }}</td>
                  <td>
                    <VChip :color="t.type === 'income' ? 'success' : 'error'" size="small">
                      {{ t.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
                    </VChip>
                  </td>
                  <td>{{ categoryLabel(t.category) }}</td>
                  <td>{{ t.description }}</td>
                  <td class="text-end" :class="t.type === 'income' ? 'text-success' : 'text-error'">
                    {{ t.type === 'income' ? '+' : '-' }}{{ formatBaht(t.amount) }}
                  </td>
                  <td class="text-center">
                    <VIconBtn icon="ri-pencil-line" size="small" color="primary" @click="editItem(t)" />
                    <VIconBtn icon="ri-delete-bin-line" size="small" color="error" @click="deleteItem(t)" />
                  </td>
                </tr>
                <tr v-if="transactions.length === 0">
                  <td colspan="6" class="text-center text-medium-emphasis py-8">
                    ยังไม่มีรายการ — กด "เพิ่มรายการ" เพื่อเริ่มบันทึก
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Add/Edit Transaction Dialog -->
    <VDialog v-model="showAddDialog" max-width="500">
      <VCard>
        <VCardTitle>{{ editingItem ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่' }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" @submit.prevent="save">
            <VRow>
              <VCol cols="12">
                <VRadioGroup v-model="form.type" inline label="ประเภท">
                  <VRadio label="รายรับ" value="income" color="success" />
                  <VRadio label="รายจ่าย" value="expense" color="error" />
                </VRadioGroup>
              </VCol>
              <VCol cols="6">
                <VTextField v-model="form.amount" label="จำนวนเงิน (บาท)" type="number" min="0" step="0.01" />
              </VCol>
              <VCol cols="6">
                <VTextField v-model="form.date" label="วันที่" type="date" />
              </VCol>
              <VCol cols="12">
                <VSelect v-model="form.category" :items="categories" item-title="label" item-value="value" label="หมวดหมู่" />
              </VCol>
              <VCol cols="12">
                <VTextField v-model="form.description" label="รายละเอียด" />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="showAddDialog = false">ยกเลิก</VBtn>
          <VBtn color="primary" @click="save">บันทึก</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="showDeleteDialog" max-width="400">
      <VCard>
        <VCardTitle>ยืนยันการลบ</VCardTitle>
        <VCardText>คุณต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="showDeleteDialog = false">ยกเลิก</VBtn>
          <VBtn color="error" @click="confirmDelete">ลบ</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/models/transaction'
import { TRANSACTION_CATEGORIES } from '@/models/transaction'
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useUserStore } from '@/stores/use-user-store'

const transactionStore = useTransactionStore()
const userStore = useUserStore()

const { transactions, totalIncome, totalExpense, balance, loading } = storeToRefs(transactionStore)

const categories = TRANSACTION_CATEGORIES
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingItem = ref<Transaction | null>(null)
const deletingItem = ref<Transaction | null>(null)
const formRef = ref()

const form = reactive({
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  category: 'food',
  description: '',
  date: new Date().toISOString().split('T')[0],
})

onMounted(() => {
  if (userStore.user?.id) {
    transactionStore.loadTransactions(userStore.user.id)
  }
})

function categoryLabel(value: string): string {
  const found = categories.find((c) => c.value === value)
  return found?.label ?? value
}

function formatBaht(n: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(n)
}

function formatDate(d: string): string {
  const date = new Date(d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

function editItem(item: Transaction) {
  editingItem.value = item
  form.type = item.type
  form.amount = item.amount
  form.category = item.category
  form.description = item.description
  form.date = item.date.split('T')[0]
  showAddDialog.value = true
}

function deleteItem(item: Transaction) {
  deletingItem.value = item
  showDeleteDialog.value = true
}

async function save() {
  if (!userStore.user?.id) return
  if (editingItem.value) {
    await transactionStore.editTransaction(editingItem.value.id, {
      type: form.type,
      amount: form.amount,
      category: form.category,
      description: form.description,
      date: form.date,
    })
  } else {
    await transactionStore.addTransaction({
      userId: userStore.user.id,
      type: form.type,
      amount: form.amount,
      category: form.category,
      description: form.description,
      date: form.date,
    })
  }
  showAddDialog.value = false
  editingItem.value = null
  resetForm()
}

async function confirmDelete() {
  if (deletingItem.value) {
    await transactionStore.removeTransaction(deletingItem.value.id)
    deletingItem.value = null
    showDeleteDialog.value = false
  }
}

function resetForm() {
  form.type = 'expense'
  form.amount = 0
  form.category = 'food'
  form.description = ''
  form.date = new Date().toISOString().split('T')[0]
}
</script>
