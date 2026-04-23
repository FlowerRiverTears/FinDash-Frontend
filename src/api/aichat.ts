import request from './request'
import { apiCall } from './request'
import type { ChatRequestDto, ChatResponseDto, AiConfigDto, AiConfigSaveDto, AiConfigStatusDto } from '@/types'

export const aiChatApi = {
  sendMessage(data: ChatRequestDto) {
    return apiCall<ChatResponseDto>(() => request.post('/AiChat', data), 'AI回复失败')
  }
}

export const aiConfigApi = {
  getConfig() {
    return apiCall<AiConfigDto>(() => request.get('/AiConfig'), '获取配置失败')
  },

  saveConfig(data: AiConfigSaveDto) {
    return apiCall<AiConfigDto>(() => request.post('/AiConfig', data), '保存配置失败')
  },

  deleteConfig() {
    return apiCall<void>(() => request.delete('/AiConfig'), '删除配置失败')
  },

  testConfig(data: AiConfigSaveDto) {
    return apiCall<void>(() => request.post('/AiConfig/test', data), '配置验证失败')
  },

  getStatus() {
    return apiCall<AiConfigStatusDto>(() => request.get('/AiConfig/status'), '获取状态失败')
  }
}
