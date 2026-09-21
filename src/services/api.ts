import {
  AnalyticsSummary,
  ModelConfig,
  PromptComparisonResponse,
  RequestRecord,
  RouteResponse,
  SystemSettings,
} from '../types/index.js';

const BASE_URL = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
      if (errJson.details) errorMsg += `: ${errJson.details}`;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; mode: string; version: string }> {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  async routePrompt(payload: {
    prompt: string;
    manualModelId?: string;
    forceMode?: 'demo' | 'live';
    preferredProvider?: string;
  }): Promise<RouteResponse> {
    const res = await fetch(`${BASE_URL}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<RouteResponse>(res);
  },

  async comparePrompt(payload: {
    prompt: string;
    forceMode?: 'demo' | 'live';
    compareMode?: 'providers' | 'tiers' | 'all';
    tier?: string;
    modelIds?: string[];
  }): Promise<PromptComparisonResponse> {
    const res = await fetch(`${BASE_URL}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<PromptComparisonResponse>(res);
  },

  async getModels(): Promise<ModelConfig[]> {
    const res = await fetch(`${BASE_URL}/models`);
    return handleResponse<ModelConfig[]>(res);
  },

  async updateModel(id: string, updates: Partial<ModelConfig>): Promise<ModelConfig> {
    const res = await fetch(`${BASE_URL}/models/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<ModelConfig>(res);
  },

  async getAnalytics(hours?: number): Promise<AnalyticsSummary> {
    const url = hours ? `${BASE_URL}/analytics?hours=${hours}` : `${BASE_URL}/analytics`;
    const res = await fetch(url);
    return handleResponse<AnalyticsSummary>(res);
  },

  async getHistory(params?: {
    q?: string;
    complexity?: string;
    model?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: RequestRecord[];
  }> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.complexity) query.set('complexity', params.complexity);
    if (params?.model) query.set('model', params.model);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${BASE_URL}/history?${query.toString()}`);
    return handleResponse(res);
  },

  async getHistoryDetail(id: string): Promise<RequestRecord> {
    const res = await fetch(`${BASE_URL}/history/${id}`);
    return handleResponse<RequestRecord>(res);
  },

  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    return handleResponse<SystemSettings>(res);
  },

  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<SystemSettings>(res);
  },

  async resetSeedData(): Promise<{ message: string; analytics: AnalyticsSummary }> {
    const res = await fetch(`${BASE_URL}/seed/reset`, { method: 'POST' });
    return handleResponse(res);
  },
};
