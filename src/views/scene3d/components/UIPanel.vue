<script setup lang="ts">
import { computed } from 'vue'
import { useSceneStore } from '../stores/sceneStore'
import type { SceneType } from '../types'
import { SCENE_CONFIGS } from '../types'
import { ShoppingCart, DataAnalysis } from '@element-plus/icons-vue'

const store = useSceneStore()

const scenes: { type: SceneType; label: string; icon: any }[] = [
  { type: 'shopping', label: '购物', icon: ShoppingCart },
  { type: 'home', label: '报表', icon: DataAnalysis }
]

const currentSceneName = computed(() => SCENE_CONFIGS[store.currentScene]?.name || '')

const handleSceneSwitch = (type: SceneType) => {
  if (type === store.currentScene || store.isTransitioning) return
  store.setScene(type)
}
</script>

<template>
  <div class="ui-panel">
    <div class="scene-nav">
      <button
        v-for="s in scenes"
        :key="s.type"
        :class="['scene-btn', { active: store.currentScene === s.type }]"
        @click="handleSceneSwitch(s.type)"
      >
        <el-icon :size="18"><component :is="s.icon" /></el-icon>
        <span>{{ s.label }}</span>
      </button>
    </div>

    <div class="scene-info">
      <span class="scene-name">{{ currentSceneName }}</span>
      <span class="char-state">{{ store.characterState }}</span>
    </div>

    <div v-if="store.recentTransactions.length > 0" class="history">
      <div class="history-title">最近交易</div>
      <div
        v-for="(tx, i) in store.recentTransactions"
        :key="i"
        :class="['history-item', tx.type]"
      >
        <span class="tx-desc">{{ tx.description }}</span>
        <span :class="['tx-amount', tx.type]">
          {{ tx.type === 'income' ? '+' : '-' }}¥{{ tx.amount.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ui-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 12px 16px;
  pointer-events: none;
}

.scene-nav {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.scene-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #606266;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.scene-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

.scene-btn.active {
  border-color: #409eff;
  color: #409eff;
  background: rgba(64, 158, 255, 0.08);
}

.scene-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}

.scene-name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.char-state {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.history {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 10px;
  padding: 8px 12px;
  max-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-title {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 600;
}

.history-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding: 2px 0;
}

.tx-desc {
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 110px;
}

.tx-amount {
  font-weight: 600;
}

.tx-amount.income {
  color: #67c23a;
}

.tx-amount.expense {
  color: #f56c6c;
}
</style>
