import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CategoryDto, CategoryCreateDto, CategoryUpdateDto } from '@/types'
import { categoryApi } from '@/api'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryDto[]>([])
  const loading = ref(false)

  const incomeCategories = () => categories.value.filter(c => c.type === 0)
  const expenseCategories = () => categories.value.filter(c => c.type === 1)

  const fetchCategories = async () => {
    loading.value = true
    try {
      const result = await categoryApi.getAll()
      if (result.success && result.data) {
        categories.value = result.data
      }
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (data: CategoryCreateDto) => {
    const result = await categoryApi.create(data)
    if (result.success) {
      await fetchCategories()
    }
    return result
  }

  const updateCategory = async (id: number, data: CategoryUpdateDto) => {
    const result = await categoryApi.update(id, data)
    if (result.success) {
      await fetchCategories()
    }
    return result
  }

  const deleteCategory = async (id: number) => {
    const result = await categoryApi.delete(id)
    if (result.success) {
      await fetchCategories()
    }
    return result
  }

  const getCategoryName = (id: number) => {
    return categories.value.find(c => c.id === id)?.name || '未知'
  }

  const getCategoryType = (id: number) => {
    return categories.value.find(c => c.id === id)?.type
  }

  return {
    categories,
    loading,
    incomeCategories,
    expenseCategories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryName,
    getCategoryType
  }
})
