import client from './client';

export interface ModelPrice {
  id: string;
  name: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentModelConfig {
  id: string;
  agentType: string;
  modelPriceId: string;
  modelPrice?: ModelPrice;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModelPriceListResponse {
  data: ModelPrice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface AgentModelConfigListResponse {
  data: AgentModelConfig[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export const modelPricesApi = {
  admin: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      client.get<ModelPriceListResponse>('/admin/model-prices', { params }),

    get: (id: string) =>
      client.get<ModelPrice>(`/admin/model-prices/${id}`),

    create: (data: { name: string; inputPricePer1M: number; outputPricePer1M: number }) =>
      client.post<ModelPrice>('/admin/model-prices', data),

    update: (id: string, data: { name?: string; inputPricePer1M?: number; outputPricePer1M?: number }) =>
      client.patch<ModelPrice>(`/admin/model-prices/${id}`, data),

    remove: (id: string) =>
      client.delete(`/admin/model-prices/${id}`),
  },
};

export const agentModelConfigApi = {
  admin: {
    list: (params?: { page?: number; limit?: number }) =>
      client.get<AgentModelConfigListResponse>('/admin/agent-model-configs', { params }),

    get: (id: string) =>
      client.get<AgentModelConfig>(`/admin/agent-model-configs/${id}`),

    create: (data: { agentType: string; modelPriceId: string; isActive?: boolean }) =>
      client.post<AgentModelConfig>('/admin/agent-model-configs', data),

    update: (id: string, data: { modelPriceId?: string; isActive?: boolean }) =>
      client.patch<AgentModelConfig>(`/admin/agent-model-configs/${id}`, data),

    remove: (id: string) =>
      client.delete(`/admin/agent-model-configs/${id}`),
  },
};