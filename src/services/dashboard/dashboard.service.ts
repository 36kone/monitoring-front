import apiService from "@/services/api.service";
import type { DashboardHome } from "@/types/dashboard/dashboard.types";

export const dashboardService = {
  getHome: () => apiService.get<DashboardHome>("/dashboards/home"),
};
