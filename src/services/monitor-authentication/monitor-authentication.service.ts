import apiService from "@/services/api.service"
import type { MonitorAuthenticationPayload, MonitorAuthenticationResponse } from "@/types/monitor-authentication/monitor-authentication.types"
export const monitorAuthenticationService = {
  get: (monitorId: string) => apiService.get<MonitorAuthenticationResponse>(`/monitors/${monitorId}/authentication`),
  save: (monitorId: string, payload: MonitorAuthenticationPayload) => apiService.put<MonitorAuthenticationResponse>(`/monitors/${monitorId}/authentication`, payload),
  remove: (monitorId: string) => apiService.delete<void>(`/monitors/${monitorId}/authentication`),
}
