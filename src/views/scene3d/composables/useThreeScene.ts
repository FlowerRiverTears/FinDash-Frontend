import * as THREE from 'three'
import { ref, onUnmounted, type Ref } from 'vue'

export function useThreeScene(container: Ref<HTMLElement | null>) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  const isReady = ref(false)
  let animationId = 0
  const clock = new THREE.Clock()
  const updateCallbacks: Array<(delta: number, elapsed: number) => void> = []

  let ambientLight: THREE.AmbientLight | null = null
  let dirLight: THREE.DirectionalLight | null = null

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  const setupLights = () => {
    if (!ambientLight) {
      ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)
    }

    if (!dirLight) {
      dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
      dirLight.position.set(5, 10, 5)
      dirLight.castShadow = true
      dirLight.shadow.mapSize.set(1024, 1024)
      dirLight.shadow.camera.near = 0.5
      dirLight.shadow.camera.far = 30
      dirLight.shadow.camera.left = -10
      dirLight.shadow.camera.right = 10
      dirLight.shadow.camera.top = 10
      dirLight.shadow.camera.bottom = -10
      scene.add(dirLight)
    }
  }

  const init = () => {
    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)

    container.value.appendChild(renderer.domElement)

    scene.background = new THREE.Color(0x87ceeb)
    scene.fog = new THREE.Fog(0x87ceeb, 15, 30)

    setupLights()

    isReady.value = true
    animate()
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    const delta = clock.getDelta()
    const elapsed = clock.getElapsedTime()

    for (const cb of updateCallbacks) {
      cb(delta, elapsed)
    }

    renderer.render(scene, camera)
  }

  const onUpdate = (callback: (delta: number, elapsed: number) => void) => {
    updateCallbacks.push(callback)
  }

  const setCameraPosition = (x: number, y: number, z: number) => {
    camera.position.set(x, y, z)
  }

  const setCameraLookAt = (x: number, y: number, z: number) => {
    camera.lookAt(x, y, z)
  }

  const handleResize = () => {
    if (!container.value) return
    const width = container.value.clientWidth
    const height = container.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  const clearScene = () => {
    const objectsToRemove: THREE.Object3D[] = []
    
    scene.traverse((obj) => {
      if (obj instanceof THREE.Light) return
      if (obj === ambientLight || obj === dirLight) return
      objectsToRemove.push(obj)
    })

    objectsToRemove.forEach((obj) => {
      scene.remove(obj)
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose())
        } else {
          obj.material?.dispose()
        }
      }
    })
  }

  const dispose = () => {
    cancelAnimationFrame(animationId)
    clearScene()
    renderer.dispose()
    if (container.value && renderer.domElement.parentNode === container.value) {
      container.value.removeChild(renderer.domElement)
    }
    window.removeEventListener('resize', handleResize)
  }

  window.addEventListener('resize', handleResize)
  onUnmounted(dispose)

  return {
    scene,
    camera,
    renderer,
    isReady,
    init,
    onUpdate,
    setCameraPosition,
    setCameraLookAt,
    clearScene,
    dispose
  }
}
