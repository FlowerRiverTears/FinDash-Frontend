import * as THREE from 'three'
import { ref, type Ref } from 'vue'
import type { CharacterState } from '../types'

export function useCharacter(scene: THREE.Scene) {
  const characterGroup = new THREE.Group()
  const state = ref<CharacterState>('idle')
  const isMoving = ref(false)

  let targetPosition: THREE.Vector3 | null = null
  const moveSpeed = 2.5
  let bodyMesh: THREE.Group | null = null
  let leftArm: THREE.Mesh | null = null
  let rightArm: THREE.Mesh | null = null
  let leftLeg: THREE.Mesh | null = null
  let rightLeg: THREE.Mesh | null = null
  let headMesh: THREE.Mesh | null = null

  const createCharacter = () => {
    characterGroup.position.set(0, 0, 3)

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x4a90d9 })
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 })
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1f })

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.35), bodyMat)
    body.position.y = 1.15
    body.castShadow = true
    characterGroup.add(body)

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), skinMat)
    head.position.y = 1.75
    head.castShadow = true
    headMesh = head
    characterGroup.add(head)

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.48), hairMat)
    hair.position.y = 2.0
    characterGroup.add(hair)

    const leftEye = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    leftEye.position.set(-0.1, 1.78, 0.23)
    characterGroup.add(leftEye)

    const rightEye = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    rightEye.position.set(0.1, 1.78, 0.23)
    characterGroup.add(rightEye)

    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xcc6666 })
    )
    mouth.position.set(0, 1.65, 0.23)
    characterGroup.add(mouth)

    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), bodyMat)
    lArm.position.set(-0.4, 1.1, 0)
    lArm.castShadow = true
    leftArm = lArm
    characterGroup.add(lArm)

    const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), bodyMat)
    rArm.position.set(0.4, 1.1, 0)
    rArm.castShadow = true
    rightArm = rArm
    characterGroup.add(rArm)

    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.22), pantsMat)
    lLeg.position.set(-0.15, 0.5, 0)
    lLeg.castShadow = true
    leftLeg = lLeg
    characterGroup.add(lLeg)

    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.22), pantsMat)
    rLeg.position.set(0.15, 0.5, 0)
    rLeg.castShadow = true
    rightLeg = rLeg
    characterGroup.add(rLeg)

    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.32), shoeMat)
    lShoe.position.set(-0.15, 0.2, 0.04)
    characterGroup.add(lShoe)

    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.32), shoeMat)
    rShoe.position.set(0.15, 0.2, 0.04)
    characterGroup.add(rShoe)

    bodyMesh = characterGroup
    characterGroup.castShadow = true
    scene.add(characterGroup)
  }

  const setState = (newState: CharacterState) => {
    state.value = newState
    resetPose()
  }

  const resetPose = () => {
    if (leftArm) leftArm.rotation.set(0, 0, 0)
    if (rightArm) rightArm.rotation.set(0, 0, 0)
    if (leftLeg) leftLeg.rotation.set(0, 0, 0)
    if (rightLeg) rightLeg.rotation.set(0, 0, 0)
    if (headMesh) headMesh.rotation.set(0, 0, 0)
  }

  const moveTo = (x: number, z: number) => {
    targetPosition = new THREE.Vector3(x, 0, z)
    isMoving.value = true
    state.value = 'walk'
  }

  const update = (delta: number, elapsed: number) => {
    if (isMoving.value && targetPosition) {
      const direction = new THREE.Vector3()
        .subVectors(targetPosition, characterGroup.position)
        .normalize()

      if (direction.x !== 0 || direction.z !== 0) {
        const angle = Math.atan2(direction.x, direction.z)
        characterGroup.rotation.y = angle
      }

      const distance = characterGroup.position.distanceTo(targetPosition)
      if (distance < 0.1) {
        characterGroup.position.copy(targetPosition)
        isMoving.value = false
        targetPosition = null
        state.value = 'idle'
        resetPose()
      } else {
        const step = Math.min(moveSpeed * delta, distance)
        characterGroup.position.add(direction.multiplyScalar(step))
      }
    }

    animateCharacter(delta, elapsed)
  }

  const animateCharacter = (delta: number, elapsed: number) => {
    switch (state.value) {
      case 'idle':
        animateIdle(elapsed)
        break
      case 'walk':
        animateWalk(elapsed)
        break
      case 'shopping':
        animateShopping(elapsed)
        break
      case 'checkout':
        animateCheckout(elapsed)
        break
      case 'look':
        animateLook(elapsed)
        break
      case 'happy':
        animateHappy(elapsed)
        break
      case 'sad':
        animateSad(elapsed)
        break
    }
  }

  const animateIdle = (t: number) => {
    if (bodyMesh) {
      characterGroup.position.y = Math.sin(t * 2) * 0.02
    }
    if (leftArm) leftArm.rotation.x = Math.sin(t * 1.5) * 0.05
    if (rightArm) rightArm.rotation.x = Math.sin(t * 1.5 + 0.5) * 0.05
  }

  const animateWalk = (t: number) => {
    const speed = 8
    if (leftLeg) leftLeg.rotation.x = Math.sin(t * speed) * 0.5
    if (rightLeg) rightLeg.rotation.x = Math.sin(t * speed + Math.PI) * 0.5
    if (leftArm) leftArm.rotation.x = Math.sin(t * speed + Math.PI) * 0.4
    if (rightArm) rightArm.rotation.x = Math.sin(t * speed) * 0.4
    characterGroup.position.y = Math.abs(Math.sin(t * speed)) * 0.05
  }

  const animateShopping = (t: number) => {
    if (rightArm) rightArm.rotation.x = -1.2 + Math.sin(t * 3) * 0.3
    if (leftArm) leftArm.rotation.x = -0.3
    characterGroup.position.y = 0
  }

  const animateCheckout = (t: number) => {
    if (rightArm) rightArm.rotation.x = -1.5 + Math.sin(t * 4) * 0.2
    if (leftArm) leftArm.rotation.x = 0
    characterGroup.position.y = 0
  }

  const animateLook = (t: number) => {
    if (headMesh) headMesh.rotation.y = Math.sin(t * 0.8) * 0.15
    if (leftArm) leftArm.rotation.x = -0.3
    if (rightArm) rightArm.rotation.x = -0.3
    characterGroup.position.y = 0
  }

  const animateHappy = (t: number) => {
    characterGroup.position.y = Math.abs(Math.sin(t * 6)) * 0.15
    if (leftArm) leftArm.rotation.z = Math.sin(t * 6) * 0.5 + 0.5
    if (rightArm) rightArm.rotation.z = -Math.sin(t * 6) * 0.5 - 0.5
  }

  const animateSad = (t: number) => {
    if (headMesh) headMesh.rotation.x = 0.2
    if (leftArm) leftArm.rotation.x = 0.3
    if (rightArm) rightArm.rotation.x = 0.3
    characterGroup.position.y = -0.05
  }

  const setPosition = (x: number, y: number, z: number) => {
    characterGroup.position.set(x, y, z)
  }

  const setRotation = (y: number) => {
    characterGroup.rotation.y = y
  }

  const removeFromScene = () => {
    scene.remove(characterGroup)
  }

  return {
    state,
    isMoving,
    createCharacter,
    setState,
    moveTo,
    update,
    setPosition,
    setRotation,
    removeFromScene,
    characterGroup
  }
}
