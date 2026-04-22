import request from './request'
import type { UserLoginDto, UserRegisterDto, LoginResponse, UserInfo } from '@/types'
import { apiCall } from './request'

export const userApi = {
  login(data: UserLoginDto) {
    return apiCall<LoginResponse>(() => request.post('/User/login', data), '登录失败')
  },
  register(data: UserRegisterDto) {
    return apiCall<UserInfo>(() => request.post('/User/register', data), '注册失败')
  }
}
