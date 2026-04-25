export type SceneType = 'shopping' | 'home'

export type CharacterState =
  | 'idle'
  | 'walk'
  | 'shopping'
  | 'checkout'
  | 'work'
  | 'eat'
  | 'look'
  | 'happy'
  | 'sad'

export interface SceneConfig {
  type: SceneType
  name: string
  icon: string
  characterSpawn: { x: number; y: number; z: number }
  cameraPosition: { x: number; y: number; z: number }
  cameraLookAt: { x: number; y: number; z: number }
}

export interface TransactionRecord {
  type: 'income' | 'expense'
  amount: number
  description: string
  categoryId: number
  timestamp: Date
}

export interface SceneState {
  currentScene: SceneType
  characterState: CharacterState
  isTransitioning: boolean
  transactions: TransactionRecord[]
  financialData: {
    totalIncome: number
    totalExpense: number
    netBalance: number
  } | null
}

export const SCENE_CONFIGS: Record<SceneType, SceneConfig> = {
  shopping: {
    type: 'shopping',
    name: '购物商场',
    icon: 'ShoppingCart',
    characterSpawn: { x: 0, y: 0, z: 3 },
    cameraPosition: { x: 0, y: 5, z: 8 },
    cameraLookAt: { x: 0, y: 1, z: 0 }
  },
  home: {
    type: 'home',
    name: '家庭报表',
    icon: 'DataAnalysis',
    characterSpawn: { x: 0, y: 0, z: 3 },
    cameraPosition: { x: 0, y: 4, z: 7 },
    cameraLookAt: { x: 0, y: 1.5, z: 0 }
  }
}
