import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            await signOut({ callbackUrl: '/login' });
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>) {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown) {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown) {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown) {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string) {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData) {
    const response = await this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const api = new ApiClient();

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  scans: {
    all: ['scans'] as const,
    list: (params: Record<string, unknown>) => ['scans', 'list', params] as const,
    detail: (id: string) => ['scans', 'detail', id] as const,
    status: (id: string) => ['scans', 'status', id] as const,
  },
  institutions: {
    all: ['institutions'] as const,
    me: ['institutions', 'me'] as const,
    notices: (institutionId: string) => ['institutions', institutionId, 'notices'] as const,
    qrCodes: (institutionId: string) => ['institutions', institutionId, 'qr-codes'] as const,
    registry: ['institutions', 'registry'] as const,
  },
  threats: {
    all: ['threats'] as const,
    list: (params: Record<string, unknown>) => ['threats', 'list', params] as const,
    detail: (id: string) => ['threats', 'detail', id] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    analytics: ['admin', 'analytics'] as const,
    flagged: ['admin', 'flagged'] as const,
    institutions: ['admin', 'institutions'] as const,
    users: ['admin', 'users'] as const,
  },
  public: {
    verify: (qrId: string) => ['public', 'verify', qrId] as const,
    registry: ['public', 'registry'] as const,
    threats: ['public', 'threats'] as const,
  },
};