export type AgentType =
  | 'PATH_GENERATOR'
  | 'CONTENT_GEN'
  | 'TASK_ANALYZER'
  | 'PROJECT_ANALYZER';

export interface TokenUsageInfo {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
}

export interface AgentResponse<T> {
  data: T;
  usage: TokenUsageInfo;
}
