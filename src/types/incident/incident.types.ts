export type IncidentStatus = "open" | "resolved";

export interface CreateIncidentPayload {
  status: IncidentStatus;
  startedAt?: string;
  resolvedAt?: string;
  durationSeconds?: number;
}

export interface Incident {
  id: string;
  monitorId: string;
  status: IncidentStatus;
  startedAt: string;
  resolvedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}
