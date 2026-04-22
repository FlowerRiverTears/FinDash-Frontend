import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserLoginDto, UserRegisterDto, UserInfo } from '@/types'
import { userApi } from '@/api'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(
    (() => {
      try {
        return JSON.parse(localStorage.getItem('userInfo') || 'null')
      } catch {
        return null
      }
    })()
  )
  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: UserLoginDto) => {
    const result = await userApi.login(credentials)
    if (result.success && result.data) {
      token.value = result.data.token
      userInfo.value = result.data.userInfo
      localStorage.setItem('token', result.data.token)
      localStorage.setItem('userInfo', JSON.stringify(result.data.userInfo))
    }
    return result
  }

  const register = async (data: UserRegisterDto) => {
    return await userApi.register(data)
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    register,
    logout
  }
})
