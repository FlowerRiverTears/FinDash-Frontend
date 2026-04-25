<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useThreeScene } from './composables/useThreeScene'
import { useSceneTransition } from './composables/useSceneTransition'
import { useSceneStore } from './stores/sceneStore'
import { SCENE_CONFIGS, type SceneType } from './types'
import SceneShopping from './SceneShopping.vue'
import SceneHome from './SceneHome.vue'
import UIPanel from './components/UIPanel.vue'

const containerRef = ref<HTMLElement | null>(null)
const store = useSceneStore()

const {
  scene,
  camera,
  isReady,
  init,
  onUpdate,
  setCameraPosition,
  setCameraLookAt,
  clearScene
} = useThreeScene(containerRef)

const transition = useSceneTransition(scene, camera, setCameraPosition, setCameraLookAt)

let currentSceneRef = ref<InstanceType<typeof SceneShopping> | InstanceType<typeof SceneHome> | null>(null)
let currentSceneKey = ref(store.currentScene)

const setupScene = (sceneType: SceneType) => {
  const config = SCENE_CONFIGS[sceneType]
  setCameraPosition(config.cameraPosition.x, config.cameraPosition.y, config.cameraPosition.z)
  setCameraLookAt(config.cameraLookAt.x, config.cameraLookAt.y, config.cameraLookAt.z)
  transition.init()
}

onMounted(async () => {
  await nextTick()
  init()
  setupScene(store.currentScene)
  
  onUpdate((delta) => {
    transition.update(delta)
  })
})

watch(() => store.currentScene, async (newScene, oldScene) => {
  if (newScene === oldScene) return
  
  store.setTransitioning(true)
  
  transition.transitionTo(newScene, () => {
    if (currentSceneRef.value && typeof currentSceneRef.value.cleanup === 'function') {
      currentSceneRef.value.cleanup()
    }
    
    clearScene()
    
    nextTick(() => {
      currentSceneKey.value = newScene
      setupScene(newScene)
      store.setTransitioning(false)
    })
  })
})

const handleAction = (type: string, data?: any) => {
  console.log('Action:', type, data)
}
</script>

<template>
  <div class="scene3d-container">
    <div ref="containerRef" class="three-canvas"></div>

    <div class="scene-overlay">
      <SceneShopping
        v-if="store.currentScene === 'shopping'"
        ref="currentSceneRef"
        :scene="scene"
        @action="handleAction"
      />
      <SceneHome
        v-if="store.currentScene === 'home'"
        ref="currentSceneRef"
        :scene="scene"
        @action="handleAction"
      />
    </div>

    <UIPanel />
  </div>
</template>

<style scoped>
.scene3d-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
}

.three-canvas {
  width: 100%;
  height: 100%;
}

.three-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.scene-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
</style>
