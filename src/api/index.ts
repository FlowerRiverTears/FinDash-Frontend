import request from './request'
import { apiCall } from './request'
import type { RecordDto, CreateRecordDto, RecordUpdateDto } from '@/types'

const recordApi = {
  getAll() {
    return apiCall<RecordDto[]>(() => request.get('/Record'), '获取账目列表失败')
  },
  getById(id: number) {
    return apiCall<RecordDto>(() => request.get(`/Record/${id}`), '获取账目详情失败')
  },
  create(data: CreateRecordDto) {
    return apiCall<RecordDto>(() => request.post('/Record', data), '创建账目失败')
  },
  update(id: number, data: RecordUpdateDto) {
    return apiCall<RecordDto>(() => request.put(`/Record/${id}`, data), '更新账目失败')
  },
  delete(id: number) {
    return apiCall<void>(() => request.delete(`/Record/${id}`), '删除账目失败')
  }
}

export { recordApi }
export { userApi } from './user'
export { categoryApi } from './category'
export { aiChatApi, aiConfigApi } from './aichat'
