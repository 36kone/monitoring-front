import type { IncidentStatus } from '@/types/incident/incident.types'
import type { MonitorStatus } from '@/types/monitor/monitor.types'

export interface DashboardUptimePoint { date: string; uptime: number }
export interface DashboardMonitor { id: string; name: string; url: string; method: string; status: MonitorStatus; enabled: boolean; intervalSeconds: number; lastCheckedAt: string | null; lastLatencyMs: number | null }
export interface DashboardIncident { id: string; monitorId: string; monitorName: string; status: IncidentStatus; startedAt: string; resolvedAt: string | null; durationSeconds: number | null }
export interface DashboardHome { overallUptime: number; averageLatencyMs: number; activeMonitors: number; operationalMonitors: number; openIncidents: number; uptimeSeries: DashboardUptimePoint[]; recentIncidents: DashboardIncident[]; monitors: DashboardMonitor[] }
