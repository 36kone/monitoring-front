import type { User } from '@/types/user/user.types'

export interface LoginCredentials { email: string; password: string }
export interface AuthResponse {
  accessToken: string
  refreshToken?: string | null
  tokenType: string
  user: User
  tokenRole: string
  otpSecret?: string
  otpauthUrl?: string
}
export interface RefreshTokenRequest { refreshToken: string }
