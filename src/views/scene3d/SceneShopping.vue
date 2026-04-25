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
const selectedItems = ref<{ name: string; price: number; categoryId: number }[]>([])
const isCheckingOut = ref(false)
const totalPrice = ref(0)

const shopItems = [
  { name: '面包', price: 15, categoryId: 1, color: 0xd4a574, position: { x: -2, z: -1 } },
  { name: '牛奶', price: 12, categoryId: 1, color: 0xf5f5f5, position: { x: -1, z: -1 } },
  { name: '水果', price: 25, categoryId: 1, color: 0xff6347, position: { x: 0, z: -1 } },
  { name: '零食', price: 20, categoryId: 1, color: 0xffd700, position: { x: 1, z: -1 } },
  { name: '饮料', price: 8, categoryId: 1, color: 0x4169e1, position: { x: 2, z: -1 } }
]

const shelfMeshes: THREE.Mesh[] = []
const itemMeshes: THREE.Mesh[] = []

const buildShoppingScene = () => {
  const floorGeo = new THREE.PlaneGeometry(12, 10)
  const floorMat = new THREE.MeshLambertMaterial({ color: 0xe8e0d4 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  props.scene.add(floor)

  const wallMat = new THREE.MeshLambertMaterial({ color: 0xfff8ee })
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.2), wallMat)
  backWall.position.set(0, 2.5, -2)
  props.scene.add(backWall)

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMat)
  leftWall.position.set(-6, 2.5, 0)
  props.scene.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMat)
  rightWall.position.set(6, 2.5, 0)
  props.scene.add(rightWall)

  const shelfMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 })
  for (let i = -2; i <= 2; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.6), shelfMat)
    shelf.position.set(i, 0.75, -1.3)
    shelf.castShadow = true
    props.scene.add(shelf)
    shelfMeshes.push(shelf)

    const shelfTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.7), new THREE.MeshLambertMaterial({ color: 0xa07828 }))
    shelfTop.position.set(i, 1.5, -1.25)
    props.scene.add(shelfTop)
  }

  const itemMat = (color: number) => new THREE.MeshLambertMaterial({ color })
  for (const item of shopItems) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), itemMat(item.color))
    mesh.position.set(item.position.x, 1.75, -1.2)
    mesh.castShadow = true
    mesh.userData = { itemName: item.name, itemPrice: item.price, itemCategoryId: item.categoryId }
    props.scene.add(mesh)
    itemMeshes.push(mesh)
  }

  const counterMat = new THREE.MeshLambertMaterial({ color: 0xd2b48c })
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 1), counterMat)
  counter.position.set(3.5, 0.5, 1)
  counter.castShadow = true
  props.scene.add(counter)

  const register = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 0.4),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  )
  register.position.set(3.5, 1.15, 1)
  props.scene.add(register)

  const screenMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x00cc66 })
  )
  screenMesh.position.set(3.5, 1.3, 0.79)
  props.scene.add(screenMesh)

  const signMat = new THREE.MeshBasicMaterial({ color: 0xff4444 })
  const sign = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 0.1), signMat)
  sign.position.set(0, 4, -1.9)
  props.scene.add(sign)

  props.scene.background = new THREE.Color(0xfff5e6)
  ;(props.scene.fog as THREE.Fog).color.set(0xfff5e6)
  ;(props.scene.fog as THREE.Fog).near = 15
  ;(props.scene.fog as THREE.Fog).far = 30

  character.createCharacter()
  character.setPosition(0, 0, 3)
  character.setRotation(Math.PI)
}

const handleItemClick = (item: typeof shopItems[0]) => {
  if (isCheckingOut.value) return
  if (character.isMoving.value) return

  selectedItems.value.push({
    name: item.name,
    price: item.price,
    categoryId: item.categoryId
  })

  character.moveTo(item.position.x, -0.3)
  setTimeout(() => {
    character.setState('shopping')
    setTimeout(() => {
      character.setState('idle')
    }, 1000)
  }, 800)
}

const handleCheckout = () => {
  if (selectedItems.value.length === 0) return
  if (character.isMoving.value) return

  isCheckingOut.value = true
  totalPrice.value = selectedItems.value.reduce((sum, item) => sum + item.price, 0)

  character.moveTo(3.5, 0.5)
  setTimeout(() => {
    character.setState('checkout')
    setTimeout(async () => {
      const desc = selectedItems.value.map(i => i.name).join('、')
      await store.createExpenseRecord(totalPrice.value, `购物: ${desc}`, 1)
      character.setState(totalPrice.value > 50 ? 'sad' : 'happy')
      emit('action', 'checkout', { total: totalPrice.value, items: selectedItems.value })

      setTimeout(() => {
        character.setState('idle')
        selectedItems.value = []
        isCheckingOut.value = false
        totalPrice.value = 0
        character.moveTo(0, 3)
      }, 2000)
    }, 1500)
  }, 1000)
}

const update = (delta: number, elapsed: number) => {
  character.update(delta, elapsed)
  for (const mesh of itemMeshes) {
    mesh.position.y = 1.75 + Math.sin(elapsed * 2 + mesh.position.x) * 0.03
  }
}

const cleanup = () => {
  character.removeFromScene()
}

defineExpose({ 
  buildShoppingScene, 
  buildHomeScene: () => {}, 
  handleItemClick, 
  handleCheckout, 
  update, 
  cleanup 
})

onMounted(() => {
  buildShoppingScene()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="shopping-ui">
    <div class="item-grid">
      <div
        v-for="item in shopItems"
        :key="item.name"
        class="item-card"
        @click="handleItemClick(item)"
      >
        <div class="item-icon" :style="{ background: '#' + item.color.toString(16).padStart(6, '0') }"></div>
        <span class="item-name">{{ item.name }}</span>
        <span class="item-price">¥{{ item.price }}</span>
      </div>
    </div>

    <div v-if="selectedItems.length > 0" class="cart-panel">
      <div class="cart-header">
        <span>🛒 已选商品</span>
        <span class="cart-count">{{ selectedItems.length }}件</span>
      </div>
      <div class="cart-items">
        <div v-for="(item, i) in selectedItems" :key="i" class="cart-item">
          <span>{{ item.name }}</span>
          <span>¥{{ item.price }}</span>
        </div>
      </div>
      <div class="cart-total">
        <span>合计</span>
        <span class="total-price">¥{{ selectedItems.reduce((s, i) => s + i.price, 0) }}</span>
      </div>
      <button class="checkout-btn" @click="handleCheckout" :disabled="isCheckingOut">
        {{ isCheckingOut ? '结算中...' : '去结账' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.shopping-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
}

.item-grid {
  display: flex;
  gap: 8px;
  justify-content: center;
  pointer-events: auto;
}

.item-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 64px;
}

.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.item-name {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
}

.item-price {
  font-size: 11px;
  color: #f56c6c;
  font-weight: 600;
}

.cart-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  pointer-events: auto;
  max-width: 280px;
  margin: 0 auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.cart-count {
  background: #409eff;
  color: white;
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 12px;
}

.cart-items {
  max-height: 100px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
  padding: 2px 0;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
  font-size: 14px;
  font-weight: 600;
}

.total-price {
  color: #f56c6c;
  font-size: 18px;
}

.checkout-btn {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
