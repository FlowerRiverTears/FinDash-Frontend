export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errorCode?: string
  timeStap?: string
}

export interface UserLoginDto {
  userName: string
  password: string
}

export interface UserRegisterDto {
  userName: string
  password: string
  nickName: string
  email?: string
}

export interface UserInfo {
  id: number
  userName: string
  nickName: string
  email?: string
}

export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

export interface CategoryDto {
  id: number
  name: string
  type: number
}

export interface CategoryCreateDto {
  name: string
  type: number
}

export interface CategoryUpdateDto {
  name: string
  type: number
}

export interface RecordDto {
  id: number
  name: string
  description?: string
  price: number
  categoryId: number
  categoryName: string
  createdAt: string
}

export interface CreateRecordDto {
  name: string
  description?: string
  price: number
  categoryId: number
}

export interface RecordUpdateDto {
  name: string
  description?: string
  price: number
  categoryId: number
}

export interface ActionResult {
  success: boolean
  message: string
}

export interface ChatMessageDto {
  role: string
  content: string
}

export interface ChatRequestDto {
  message: string
  conversationId?: string
  history?: ChatMessageDto[]
}

export interface ChatResponseDto {
  reply: string
  conversationId?: string
  timestamp: string
}
