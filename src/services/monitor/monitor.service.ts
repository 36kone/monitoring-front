import apiService from "@/services/api.service";
import type { PaginatedResponse } from "@/types/common.types";
import type {
  CreateMonitorPayload,
  Monitor,
} from "@/types/monitor/monitor.types";
import type {
  CreateIncidentPayload,
  Incident,
} from "@/types/incident/incident.types";
import type { MonitorCheck } from "@/types/monitor/monitor.types";

export const monitorService = {
  list: (params: Record<string, string | number | boolean | undefined> = {}) =>
    apiService.get<PaginatedResponse<Monitor>>("/monitors/", { params }),
  create: (payload: CreateMonitorPayload) =>
    apiService.post<Monitor>("/monitors/", payload),
  update: (id: string, payload: Partial<CreateMonitorPayload>) =>
    apiService.put<Monitor>(`/monitors/${id}`, payload),
  remove: (id: string) => apiService.delete<void>(`/monitors/${id}`),
  checks: (
    monitorId: string,
    params: Record<string, string | number | boolean | undefined> = {},
  ) =>
    apiService.get<PaginatedResponse<MonitorCheck>>(
      `/monitor-checks/${monitorId}/checks/`,
      { params },
    ),
  incidents: (
    monitorId: string,
    params: Record<string, string | number | boolean | undefined> = {},
  ) =>
    apiService.get<PaginatedResponse<Incident>>(`/incidents/${monitorId}/`, {
      params,
    }),
  createIncident: (monitorId: string, payload: CreateIncidentPayload) =>
    apiService.post<Incident>(`/incidents/${monitorId}/`, payload),
};
