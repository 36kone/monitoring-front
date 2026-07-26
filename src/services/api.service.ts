import { Config } from "@/config";
import authService from "@/services/auth/auth.service";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  baseURL?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
};

class ApiService {
  private refreshRequest: Promise<boolean> | null = null;
  private buildUrl(
    path: string,
    baseURL = Config.API_BASE_URL,
    params?: RequestOptions["params"],
  ) {
    const url = new URL(`${baseURL.replace(/\/$/, "")}${path}`);
    Object.entries(params ?? {}).forEach(
      ([key, value]) =>
        value !== undefined &&
        value !== null &&
        url.searchParams.set(key, String(value)),
    );
    return url.toString();
  }

  private buildInit(options: RequestOptions): RequestInit {
    const headers = new Headers(options.headers);
    const isForm =
      options.body instanceof FormData ||
      options.body instanceof URLSearchParams;
    if (!isForm && options.body && typeof options.body === "object")
      headers.set("Content-Type", "application/json");
    const token = authService.getToken();
    if (options.auth !== false && token)
      headers.set("Authorization", `Bearer ${token}`);
    return {
      ...options,
      headers,
      body: isForm
        ? (options.body as BodyInit)
        : options.body && typeof options.body === "object"
          ? JSON.stringify(options.body)
          : (options.body as BodyInit | null | undefined),
    };
  }

  private async parse<T>(response: Response): Promise<T> {
    const text = await response.text();
    const payload = text ? safeJson(text) : undefined;
    if (response.status === 401) {
      authService.clearSession();
      if (window.location.pathname !== "/login")
        window.location.replace("/login");
      throw new ApiError(401, "Sessão expirada", payload);
    }
    if (!response.ok)
      throw new ApiError(
        response.status,
        getErrorMessage(response, payload),
        payload,
      );
    return (payload ?? undefined) as T;
  }

  async request<T>(path: string, options: RequestOptions = {}) {
    const url = this.buildUrl(path, options.baseURL, options.params);
    const response = await fetch(url, this.buildInit(options));

    if (response.status === 401 && options.auth !== false) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        return this.parse<T>(await fetch(url, this.buildInit(options)));
      }
      authService.clearSession();
      if (window.location.pathname !== "/login")
        window.location.replace("/login");
      throw new ApiError(401, "Sessão expirada");
    }

    return this.parse<T>(response);
  }
  private async refreshSession() {
    if (!authService.getRefreshToken()) return false;
    if (!this.refreshRequest) {
      this.refreshRequest = authService
        .refreshAccessToken()
        .then(() => true)
        .catch(() => false)
        .finally(() => {
          this.refreshRequest = null;
        });
    }
    return this.refreshRequest;
  }
  get<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }
  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">,
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }
  delete<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function getErrorMessage(response: Response, payload: unknown) {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown; message?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
      return detail
        .map((item) =>
          typeof item === "object" && item && "msg" in item
            ? String(item.msg)
            : String(item),
        )
        .join(" | ");
    if (typeof (payload as { message?: unknown }).message === "string")
      return String((payload as { message: string }).message);
  }
  return response.statusText || "Erro na requisição";
}
export default new ApiService();
