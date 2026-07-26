export type MonitorStatus = "unknown" | "up" | "down" | "degraded";

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: string;
  intervalSeconds: number;
  timeoutMs: number;
  enabled: boolean;
  status: MonitorStatus;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonitorPayload {
  name: string;
  url: string;
  method: string;
  intervalSeconds: number;
  timeoutMs: number;
  enabled: boolean;
}

export interface MonitorCheck {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  statusCode: number | null;
  success: boolean;
  latencyMs: number | null;
  error: string | null;
  timedOut: boolean;
  checkedAt: string;
  createdAt: string;
  updatedAt: string;
}
