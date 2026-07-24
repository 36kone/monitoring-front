export interface User {
  id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  isSuperUser: boolean
  isAdmin: boolean
  mfaEnabled?: boolean | null
  singleSession: boolean
  createdAt?: string | null
  updatedAt?: string | null
  createdBy?: string | null
  updatedBy?: string | null
}

export interface CreateUserPayload {
  name: string; email: string; password: string; phone: string
  singleSession?: boolean; mfaEnabled?: boolean; isAdmin?: boolean
}

export interface UpdateUserPayload {
  name?: string; email?: string; phone?: string; isActive?: boolean
  isAdmin?: boolean; mfaEnabled?: boolean; singleSession?: boolean
}
