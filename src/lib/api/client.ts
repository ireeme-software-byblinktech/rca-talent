import { env } from "@/lib/config/env";
import type { BackendAuthResponse } from "./mappers";
import { mapAuthResponse } from "./mappers";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  /** Skip automatic token refresh on 401 */
  skipRefresh?: boolean;
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

let authToken: string | null = null;
let refreshToken: string | null = null;
let onTokensRefreshed:
  | ((tokens: { token: string; refreshToken: string }) => void)
  | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setOnTokensRefreshed(
  callback: ((tokens: { token: string; refreshToken: string }) => void) | null
) {
  onTokensRefreshed = callback;
}

export function getApiBaseUrl(): string {
  return env.apiUrl;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${env.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as BackendAuthResponse;
        const session = mapAuthResponse(data);
        authToken = session.token;
        refreshToken = session.refreshToken ?? null;
        onTokensRefreshed?.({
          token: session.token,
          refreshToken: session.refreshToken ?? "",
        });
        return session.token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, token, skipRefresh } = options;

  const makeRequest = async (activeToken: string | null): Promise<Response> => {
    const requestHeaders: Record<string, string> = { ...headers };
    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: "include",
    };

    if (activeToken) {
      requestHeaders.Authorization = `Bearer ${activeToken}`;
    }

    if (body !== undefined) {
      if (isFormDataBody(body)) {
        config.body = body;
      } else {
        requestHeaders["Content-Type"] = "application/json";
        config.body = JSON.stringify(body);
      }
    } else if (method !== "GET" && method !== "HEAD") {
      requestHeaders["Content-Type"] = "application/json";
    }

    return fetch(`${env.apiUrl}${endpoint}`, config);
  };

  let activeToken = token ?? authToken;
  let response = await makeRequest(activeToken);

  if (response.status === 401 && !skipRefresh && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      activeToken = newToken;
      response = await makeRequest(activeToken);
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      (error as { message?: string | string[] }).message ??
      "An error occurred";
    const errorMessage = Array.isArray(message) ? message.join(", ") : String(message);
    console.error("[ProfileDebug] API error", {
      endpoint,
      method,
      status: response.status,
      message: errorMessage,
      error,
    });
    throw new ApiError(errorMessage, response.status, (error as { code?: string }).code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}
