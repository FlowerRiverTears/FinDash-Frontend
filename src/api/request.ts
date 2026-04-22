import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/login'
      } else if (status === 403) {
        ElMessage.error('没有权限执行此操作')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试')
      } else {
        const msg = data?.message || '请求失败'
        ElMessage.error(msg)
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export async function apiCall<T>(
  fn: () => Promise<{ data: ApiResponse<T> }>,
  errorMsg = '操作失败'
): Promise<{ success: boolean; data?: T; message: string }> {
  try {
    const response = await fn()
    const result = response.data
    if (result.success) {
      return { success: true, data: result.data, message: result.message }
    }
    return { success: false, message: result.message || errorMsg }
  } catch (e: any) {
    const msg = e.response?.data?.message || e.message || errorMsg
    return { success: false, message: msg }
  }
}

export default request
