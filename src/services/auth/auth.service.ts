import apiService from "@/services/api.service";
import type { AuthResponse, LoginCredentials } from "@/types/auth/auth.types";
import type {
  UpdateCurrentUserPayload,
  User,
} from "@/types/user/user.types";

class AuthService {
  async login(credentials: LoginCredentials) {
    const form = new URLSearchParams({
      grant_type: "password",
      username: credentials.email,
      password: credentials.password,
      scope: "",
      client_id: "",
      client_secret: "",
    });
    const data = await apiService.post<AuthResponse>("/auth/login", form, {
      auth: false,
    });
    if (data.accessToken) this.saveSession(data);
    return data;
  }
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;
    const data = await apiService.post<AuthResponse>(
      "/auth/refresh",
      { refreshToken },
      { auth: false },
    );
    this.saveSession(data);
    return data;
  }
  async getCurrentUser() {
    const user = await apiService.get<User>("/auth/me").catch(() => null);
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    return user;
  }
  async updateCurrentUser(payload: UpdateCurrentUserPayload) {
    const user = await apiService.put<User>("/auth/me", payload);
    localStorage.setItem("auth_user", JSON.stringify(user));
    return user;
  }
  getToken() {
    return localStorage.getItem("auth_token");
  }
  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  }
  getAuthUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  }
  saveSession(data: AuthResponse) {
    localStorage.setItem("auth_token", data.accessToken);
    if (data.refreshToken)
      localStorage.setItem("refresh_token", data.refreshToken);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
  }
  clearSession() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
  }
  logout() {
    this.clearSession();
  }
}
export default new AuthService();
