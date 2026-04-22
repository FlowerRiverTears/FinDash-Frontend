import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RecordDto, CreateRecordDto, RecordUpdateDto } from '@/types'
import { recordApi } from '@/api'
import { useCategoryStore } from './category'

export const useRecordStore = defineStore('record', () => {
  const records = ref<RecordDto[]>([])
  const loading = ref(false)

  const totalIncome = computed(() => {
    const categoryStore = useCategoryStore()
    return records.value
      .filter(r => categoryStore.getCategoryType(r.categoryId) === 0)
      .reduce((sum, r) => sum + Number(r.price), 0)
  })

  const totalExpense = computed(() => {
    const categoryStore = useCategoryStore()
    return records.value
      .filter(r => categoryStore.getCategoryType(r.categoryId) === 1)
      .reduce((sum, r) => sum + Number(r.price), 0)
  })

  const netBalance = computed(() => totalIncome.value - totalExpense.value)

  const fetchRecords = async () => {
    loading.value = true
    try {
      const result = await recordApi.getAll()
      if (result.success && result.data) {
        records.value = result.data
      }
    } finally {
      loading.value = false
    }
  }

  const createRecord = async (data: CreateRecordDto) => {
    const result = await recordApi.create(data)
    if (result.success) {
      await fetchRecords()
    }
    return result
  }

  const updateRecord = async (id: number, data: RecordUpdateDto) => {
    const result = await recordApi.update(id, data)
    if (result.success) {
      await fetchRecords()
    }
    return result
  }

  const deleteRecord = async (id: number) => {
    const result = await recordApi.delete(id)
    if (result.success) {
      await fetchRecords()
    }
    return result
  }

  const getMonthlyStats = () => {
    const categoryStore = useCategoryStore()
    const stats: Record<string, { income: number; expense: number }> = {}

    records.value.forEach(r => {
      const categoryType = categoryStore.getCategoryType(r.categoryId)
      const month = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')
      if (!stats[month]) {
        stats[month] = { income: 0, expense: 0 }
      }
      if (categoryType === 0) {
        stats[month].income += Number(r.price)
      } else {
        stats[month].expense += Number(r.price)
      }
    })

    return stats
  }

  const getCategoryStats = () => {
    const categoryStore = useCategoryStore()
    const stats: Record<string, number> = {}

    records.value.forEach(r => {
      const categoryType = categoryStore.getCategoryType(r.categoryId)
      if (categoryType === 1) {
        const name = r.categoryName || categoryStore.getCategoryName(r.categoryId)
        stats[name] = (stats[name] || 0) + Number(r.price)
      }
    })

    return stats
  }

  return {
    records,
    loading,
    totalIncome,
    totalExpense,
    netBalance,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    getMonthlyStats,
    getCategoryStats
  }
})
