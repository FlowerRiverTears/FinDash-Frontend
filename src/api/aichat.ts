import request from './request'
import { apiCall } from './request'
import type { ChatRequestDto, ChatResponseDto } from '@/types'

export const aiChatApi = {
  sendMessage(data: ChatRequestDto) {
    return apiCall<ChatResponseDto>(() => request.post('/AiChat', data), 'AI回复失败')
  }
}
