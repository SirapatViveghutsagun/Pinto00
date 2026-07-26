<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useUserStore } from '@/stores/use-user-store'
import { TRANSACTION_CATEGORIES } from '@/models/transaction'

const transactionStore = useTransactionStore()
const userStore = useUserStore()

const { transactions, totalIncome, totalExpense, balance, loading } = storeToRefs(transactionStore)

const recentTransactions = computed(() => [...transactions.value].slice(0, 5))

const expenseCategories = computed(() => {
  const cats = transactions.value.filter(t => t.type === 'expense')
  const map = new Map<string, number>()
  cats.forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount))
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})

const incomeCategories = computed(() => {
  const cats = transactions.value.filter(t => t.type === 'income')
  const map = new Map<string, number>()
  cats.forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount))
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})

function categoryLabel(value: string): string {
  const found = TRANSACTION_CATEGORIES.find(c => c.value === value)
  return found?.label ?? value
}

function formatBaht(n: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(n)
}

function formatDate(d: string): string {
  const date = new Date(d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ใช้ user คนแรกเป็น default (หรือสร้าง temp ถ้ายังไม่มี)
const currentUserId = computed(() => {
  if (userStore.users.length > 0) return userStore.users[0].id
  return null
})

onMounted(async () => {
  await userStore.fetchUsers()
  if (currentUserId.value) {
    transactionStore.loadTransactions(currentUserId.value)
  }
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h1 class="text-h4 mb-4">Dashboard การเงิน</h1>
    </VCol>

    <!-- Summary Cards -->
    <VCol cols="12" sm="4">
      <VCard>
        <VCardText class="text-center">
          <VIcon icon="ri-arrow-up-circle-line" color="success" size="40" class="mb-2" />
          <div class="text-subtitle-1 text-medium-emphasis">รายรับทั้งหมด</div>
          <div class="text-h4 text-success">+{{ formatBaht(totalIncome) }}</div>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" sm="4">
      <VCard>
        <VCardText class="text-center">
          <VIcon icon="ri-arrow-down-circle-line" color="error" size="40" class="mb-2" />
          <div class="text-subtitle-1 text-medium-emphasis">รายจ่ายทั้งหมด</div>
          <div class="text-h4 text-error">-{{ formatBaht(totalExpense) }}</div>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" sm="4">
      <VCard>
        <VCardText class="text-center">
          <VIcon icon="ri-wallet-3-line" color="primary" size="40" class="mb-2" />
          <div class="text-subtitle-1 text-medium-emphasis">คงเหลือ</div>
          <div class="text-h4" :class="balance >= 0 ? 'text-primary' : 'text-error'">{{ formatBaht(balance) }}</div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Recent Transactions -->
    <VCol cols="12" md="7">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6">รายการล่าสุด</span>
          <RouterLink to="/transaction-page">
            <VBtn variant="text" size="small">ดูทั้งหมด</VBtn>
          </RouterLink>
        </VCardTitle>
        <VDivider />
        <div v-if="loading" class="text-center pa-8">
          <VProgressCircular indeterminate />
        </div>
        <VList v-else-if="recentTransactions.length > 0">
          <VListItem v-for="t in recentTransactions" :key="t.id">
            <template #prepend>
              <VAvatar :color="t.type === 'income' ? 'success' : 'error'" variant="tonal" class="me-3">
                <VIcon :icon="t.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'" />
              </VAvatar>
            </template>
            <VListItemTitle>
              <span class="font-weight-medium">{{ categoryLabel(t.category) }}</span>
              <VChip size="x-small" :color="t.type === 'income' ? 'success' : 'error'" class="ms-2">
                {{ t.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
              </VChip>
            </VListItemTitle>
            <VListItemSubtitle>{{ t.description }} · {{ formatDate(t.date) }}</VListItemSubtitle>
            <template #append>
              <span :class="t.type === 'income' ? 'text-success' : 'text-error'" class="font-weight-bold">
                {{ t.type === 'income' ? '+' : '-' }}{{ formatBaht(t.amount) }}
              </span>
            </template>
          </VListItem>
        </VList>
        <div v-else class="text-center pa-8 text-medium-emphasis">
          <VIcon icon="ri-inbox-line" size="48" class="mb-2" />
          <p>ยังไม่มีรายการ</p>
          <RouterLink to="/transaction-page">
            <VBtn variant="outlined" size="small" class="mt-2">เพิ่มรายการแรก</VBtn>
          </RouterLink>
        </div>
      </VCard>
    </VCol>

    <!-- Category Summary -->
    <VCol cols="12" md="5">
      <VCard>
        <VCardTitle class="pa-4">
          <span class="text-h6">สรุปตามหมวด</span>
        </VCardTitle>
        <VDivider />
        <VCardText>
          <div v-if="expenseCategories.length === 0 && incomeCategories.length === 0" class="text-center pa-4 text-medium-emphasis">
            ยังไม่มีข้อมูล
          </div>
          <template v-if="expenseCategories.length > 0">
            <div class="text-subtitle-2 text-error mb-2">รายจ่าย</div>
            <div v-for="[cat, amount] in expenseCategories" :key="cat" class="d-flex align-center mb-3">
              <span class="flex-1">{{ categoryLabel(cat) }}</span>
              <span class="text-error ms-2">-{{ formatBaht(amount) }}</span>
            </div>
            <VDivider class="my-2" />
          </template>
          <template v-if="incomeCategories.length > 0">
            <div class="text-subtitle-2 text-success mb-2">รายรับ</div>
            <div v-for="[cat, amount] in incomeCategories" :key="cat" class="d-flex align-center mb-3">
              <span class="flex-1">{{ categoryLabel(cat) }}</span>
              <span class="text-success ms-2">+{{ formatBaht(amount) }}</span>
            </div>
          </template>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Quick Actions -->
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex justify-center ga-4 pa-4">
          <RouterLink to="/transaction-page">
            <VBtn color="success" prepend-icon="ri-add-line">เพิ่มรายรับ</VBtn>
          </RouterLink>
          <RouterLink to="/transaction-page">
            <VBtn color="error" prepend-icon="ri-subtract-line">เพิ่มรายจ่าย</VBtn>
          </RouterLink>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
