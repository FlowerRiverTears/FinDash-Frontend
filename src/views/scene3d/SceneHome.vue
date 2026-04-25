<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'
import { useSceneStore } from './stores/sceneStore'
import { useCharacter } from './composables/useCharacter'

const props = defineProps<{
  scene: THREE.Scene
}>()

const store = useSceneStore()
const emit = defineEmits<{
  (e: 'action', type: string, data?: any): void
}>()

const character = useCharacter(props.scene)
const isViewingReport = ref(false)

const buildHomeScene = () => {
  const floorGeo = new THREE.PlaneGeometry(12, 10)
  const floorMat = new THREE.MeshLambertMaterial({ color: 0xd4c4a8 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  props.scene.add(floor)

  const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5efe6 })
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.2), wallMat)
  backWall.position.set(0, 2.5, -2)
  props.scene.add(backWall)

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMat)
  leftWall.position.set(-6, 2.5, 0)
  props.scene.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMat)
  rightWall.position.set(6, 2.5, 0)
  props.scene.add(rightWall)

  const frameMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 })
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.2, 0.15), frameMat)
  frame.position.set(0, 2.5, -1.85)
  props.scene.add(frame)

  const screenMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.9), screenMat)
  screen.position.set(0, 2.5, -1.75)
  props.scene.add(screen)

  const incomeBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 1.2, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x67c23a })
  )
  incomeBar.position.set(-0.8, 2.1, -1.7)
  props.scene.add(incomeBar)

  const expenseBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.8, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xf56c6c })
  )
  expenseBar.position.set(0, 1.9, -1.7)
  props.scene.add(expenseBar)

  const balanceBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.5, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x409eff })
  )
  balanceBar.position.set(0.8, 1.75, -1.7)
  props.scene.add(balanceBar)

  const sofaMat = new THREE.MeshLambertMaterial({ color: 0x6b4c3b })
  const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 1), sofaMat)
  sofaSeat.position.set(-3, 0.35, 0)
  sofaSeat.castShadow = true
  props.scene.add(sofaSeat)

  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 0.3), sofaMat)
  sofaBack.position.set(-3, 0.75, -0.35)
  props.scene.add(sofaBack)

  const tableMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 })
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.7), tableMat)
  table.position.set(-3, 0.35, 1)
  table.castShadow = true
  props.scene.add(table)

  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 0.1, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b8b8b })
  )
  lampBase.position.set(3, 0.05, -1)
  props.scene.add(lampBase)

  const lampPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b8b8b })
  )
  lampPole.position.set(3, 0.8, -1)
  props.scene.add(lampPole)

  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.3, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe4b5 })
  )
  lampShade.position.set(3, 1.6, -1)
  props.scene.add(lampShade)

  const pointLight = new THREE.PointLight(0xffe4b5, 0.5, 5)
  pointLight.position.set(3, 1.5, -1)
  props.scene.add(pointLight)

  const plantPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8),
    new THREE.MeshLambertMaterial({ color: 0xcd853f })
  )
  plantPot.position.set(4.5, 0.15, -1)
  props.scene.add(plantPot)

  const plantLeaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0x228b22 })
  )
  plantLeaves.position.set(4.5, 0.55, -1)
  props.scene.add(plantLeaves)

  props.scene.background = new THREE.Color(0xfaf6f0)
  ;(props.scene.fog as THREE.Fog).color.set(0xfaf6f0)
  ;(props.scene.fog as THREE.Fog).near = 15
  ;(props.scene.fog as THREE.Fog).far = 30

  character.createCharacter()
  character.setPosition(0, 0, 3)
  character.setRotation(Math.PI)
}

const handleViewReport = async () => {
  if (isViewingReport.value) return
  if (character.isMoving.value) return

  await store.fetchFinancialData()
  isViewingReport.value = true

  character.moveTo(0, -0.5)
  setTimeout(() => {
    character.setState('look')
    emit('action', 'viewReport')

    setTimeout(() => {
      character.setState('idle')
      isViewingReport.value = false
    }, 5000)
  }, 800)
}

const update = (delta: number, elapsed: number) => {
  character.update(delta, elapsed)
}

const cleanup = () => {
  character.removeFromScene()
}

defineExpose({ 
  buildShoppingScene: () => {},
  buildHomeScene, 
  handleViewReport, 
  update, 
  cleanup 
})

onMounted(() => {
  buildHomeScene()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="home-ui">
    <div class="report-trigger">
      <button class="view-report-btn" @click="handleViewReport" :disabled="isViewingReport">
        {{ isViewingReport ? '查看中...' : '📊 查看报表' }}
      </button>
    </div>

    <div v-if="isViewingReport" class="report-panel">
      <div class="report-card">
        <h3 class="report-title">财务概览</h3>
        <div class="report-row income">
          <span class="label">本月收入</span>
          <span class="value">¥{{ store.totalIncome.toFixed(2) }}</span>
        </div>
        <div class="report-row expense">
          <span class="label">本月支出</span>
          <span class="value">¥{{ store.totalExpense.toFixed(2) }}</span>
        </div>
        <div class="report-row balance">
          <span class="label">净结余</span>
          <span class="value" :class="{ negative: store.netBalance < 0 }">
            ¥{{ store.netBalance.toFixed(2) }}
          </span>
        </div>
        <div class="report-bar-chart">
          <div class="bar-wrapper">
            <div class="bar income-bar" :style="{ height: Math.min(store.totalIncome / 100, 80) + 'px' }"></div>
            <span>收入</span>
          </div>
          <div class="bar-wrapper">
            <div class="bar expense-bar" :style="{ height: Math.min(store.totalExpense / 100, 80) + 'px' }"></div>
            <span>支出</span>
          </div>
          <div class="bar-wrapper">
            <div class="bar balance-bar" :style="{ height: Math.min(Math.abs(store.netBalance) / 100, 80) + 'px' }"></div>
            <span>结余</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.report-trigger {
  pointer-events: auto;
}

.view-report-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #67c23a, #529b2e);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.view-report-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.view-report-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.report-panel {
  pointer-events: auto;
  margin-top: auto;
  margin-bottom: 16px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.report-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  min-width: 260px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.report-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 12px 0;
  text-align: center;
}

.report-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
}

.report-row .label {
  color: #909399;
}

.report-row .value {
  font-weight: 600;
}

.report-row.income .value {
  color: #67c23a;
}

.report-row.expense .value {
  color: #f56c6c;
}

.report-row.balance .value {
  color: #409eff;
}

.report-row.balance .value.negative {
  color: #f56c6c;
}

.report-bar-chart {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  align-items: flex-end;
  height: 100px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #909399;
}

.bar {
  width: 30px;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.5s ease;
}

.income-bar {
  background: linear-gradient(180deg, #67c23a, #529b2e);
}

.expense-bar {
  background: linear-gradient(180deg, #f56c6c, #e6363a);
}

.balance-bar {
  background: linear-gradient(180deg, #409eff, #337ecc);
}
</style>
