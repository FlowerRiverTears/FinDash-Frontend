import * as THREE from 'three'
import { SCENE_CONFIGS, type SceneType } from '../types'

export function useSceneTransition(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  setCameraPosition: (x: number, y: number, z: number) => void,
  setCameraLookAt: (x: number, y: number, z: number) => void
) {
  let fadeOverlay: THREE.Mesh | null = null
  let fadeMaterial: THREE.MeshBasicMaterial | null = null
  let fadeProgress = 0
  let isFadingIn = false
  let isFadingOut = false
  let onFadeComplete: (() => void) | null = null

  const createFadeOverlay = () => {
    fadeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      depthTest: false
    })
    const geometry = new THREE.PlaneGeometry(100, 100)
    fadeOverlay = new THREE.Mesh(geometry, fadeMaterial)
    fadeOverlay.position.z = -1
    fadeOverlay.renderOrder = 999

    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 2, 2)
    const texture = new THREE.CanvasTexture(canvas)

    fadeMaterial.map = texture
    fadeMaterial.needsUpdate = true
  }

  const transitionTo = (targetScene: SceneType, callback: () => void) => {
    if (isFadingIn || isFadingOut) return

    onFadeComplete = callback
    isFadingOut = true
    fadeProgress = 0
  }

  const update = (delta: number) => {
    if (!fadeMaterial) return

    const fadeSpeed = 3

    if (isFadingOut) {
      fadeProgress += delta * fadeSpeed
      fadeMaterial.opacity = Math.min(fadeProgress, 1)

      if (fadeProgress >= 1) {
        isFadingOut = false
        if (onFadeComplete) {
          onFadeComplete()
          onFadeComplete = null
        }
        isFadingIn = true
        fadeProgress = 1

        const config = SCENE_CONFIGS[scene.userData.currentScene as SceneType]
        if (config) {
          setCameraPosition(
            config.cameraPosition.x,
            config.cameraPosition.y,
            config.cameraPosition.z
          )
          setCameraLookAt(
            config.cameraLookAt.x,
            config.cameraLookAt.y,
            config.cameraLookAt.z
          )
        }
      }
    }

    if (isFadingIn) {
      fadeProgress -= delta * fadeSpeed
      fadeMaterial.opacity = Math.max(fadeProgress, 0)

      if (fadeProgress <= 0) {
        isFadingIn = false
        fadeMaterial.opacity = 0
      }
    }
  }

  const init = () => {
    createFadeOverlay()
    if (fadeOverlay) {
      scene.add(fadeOverlay)
    }
  }

  return {
    transitionTo,
    update,
    init,
    get isTransitioning() {
      return isFadingIn || isFadingOut
    }
  }
}
