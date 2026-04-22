import request from './request'
import type { CategoryDto, CategoryCreateDto, CategoryUpdateDto } from '@/types'
import { apiCall } from './request'

export const categoryApi = {
  getAll() {
    return apiCall<CategoryDto[]>(() => request.get('/Category'), '获取分类列表失败')
  },
  getById(id: number) {
    return apiCall<CategoryDto>(() => request.get(`/Category/${id}`), '获取分类详情失败')
  },
  create(data: CategoryCreateDto) {
    return apiCall<CategoryDto>(() => request.post('/Category', data), '创建分类失败')
  },
  update(id: number, data: CategoryUpdateDto) {
    return apiCall<CategoryDto>(() => request.put(`/Category/${id}`, data), '更新分类失败')
  },
  delete(id: number) {
    return apiCall<void>(() => request.delete(`/Category/${id}`), '删除分类失败')
  }
}
