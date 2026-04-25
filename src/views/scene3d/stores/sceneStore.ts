import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SceneType, CharacterState, TransactionRecord } from '../types'
import { recordApi } from '@/api'

export const useSceneStore = defineStore('scene3d', () => {
  const currentScene = ref<SceneType>('shopping')
  const characterState = ref<CharacterState>('idle')
  const isTransitioning = ref(false)
  const transactions = ref<TransactionRecord[]>([])
  const totalIncome = ref(0)
  const totalExpense = ref(0)

  const netBalance = computed(() => totalIncome.value - totalExpense.value)

  const recentTransactions = computed(() =>
    transactions.value.slice(-5).reverse()
  )

  const setScene = (scene: SceneType) => {
    if (isTransitioning.value) return
    currentScene.value = scene
    characterState.value = 'idle'
  }

  const setCharacterState = (state: CharacterState) => {
    characterState.value = state
  }

  const setTransitioning = (value: boolean) => {
    isTransitioning.value = value
  }

  const addTransaction = (tx: TransactionRecord) => {
    transactions.value.push(tx)
    if (tx.type === 'income') {
      totalIncome.value += tx.amount
    } else {
      totalExpense.value += tx.amount
    }
  }

  const createExpenseRecord = async (amount: number, description: string, categoryId: number) => {
    try {
      const result = await recordApi.create({
        name: description,
        price: amount,
        categoryId
      })
      if (result.success) {
        addTransaction({
          type: 'expense',
          amount,
          description,
          categoryId,
          timestamp: new Date()
        })
      }
      return result
    } catch {
      addTransaction({
        type: 'expense',
        amount,
        description,
        categoryId,
        timestamp: new Date()
      })
      return { success: true, message: '本地记录已保存' }
    }
  }

  const createIncomeRecord = async (amount: number, description: string, categoryId: number) => {
    try {
      const result = await recordApi.create({
        name: description,
        price: amount,
        categoryId
      })
      if (result.success) {
        addTransaction({
          type: 'income',
          amount,
          description,
          categoryId,
          timestamp: new Date()
        })
      }
      return result
    } catch {
      addTransaction({
        type: 'income',
        amount,
        description,
        categoryId,
        timestamp: new Date()
      })
      return { success: true, message: '本地记录已保存' }
    }
  }

  const fetchFinancialData = async () => {
    try {
      const result = await recordApi.getAll()
      if (result.success && result.data) {
        totalIncome.value = 0
        totalExpense.value = 0
        result.data.forEach(r => {
          if (r.price >= 0) {
            totalIncome.value += r.price
          } else {
            totalExpense.value += Math.abs(r.price)
          }
        })
      }
    } catch {
      // use local data
    }
  }

  return {
    currentScene,
    characterState,
    isTransitioning,
    transactions,
    totalIncome,
    totalExpense,
    netBalance,
    recentTransactions,
    setScene,
    setCharacterState,
    setTransitioning,
    addTransaction,
    createExpenseRecord,
    createIncomeRecord,
    fetchFinancialData
  }
})
