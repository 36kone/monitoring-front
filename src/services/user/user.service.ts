import apiService from '@/services/api.service'
import type { PaginatedResponse } from '@/types/common.types'
import type { CreateUserPayload, UpdateUserPayload, User } from '@/types/user/user.types'

class UserService {
  list(params: { keyword?: string; size?: number; page?: number } = {}) { return apiService.get<PaginatedResponse<User>>('/users/', { params }) }
  create(payload: CreateUserPayload) { return apiService.post<User>('/users/', payload) }
  update(id: string, payload: UpdateUserPayload) { return apiService.put<User>(`/users/${id}`, payload) }
  remove(id: string) { return apiService.delete<void>(`/users/${id}`) }
}
export default new UserService()
