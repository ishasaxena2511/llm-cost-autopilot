export type ComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ModelTier = 'fast' | 'balanced' | 'premium';

export type ProviderSource =
  | 'live-gemini'
  | 'live-openai'
  | 'live-anthropic'
  | 'live-groq'
  | 'simulation';

export type OptimizationStrategy = 'cost' | 'balanced' | 'quality' | 'latency';

export interface ComplexitySignals {
  wordCount: number;
  charCount: number;
  questionCount: number;
  hasCode: boolean;
  hasMath: boolean;
  hasReasoningKeywords: boolean;
  hasMultiStep: boolean;
  hasStructuredOutput: boolean;
  technicalTermsCount: number;
  detectedSignals: string[];
  qualityTier?: 'Basic / Routine' | 'Intermediate / Structured' | 'Advanced / Frontier Reasoning';
  qualityScore?: number;
  qualitySummary?: string;
  clarityFactor?: string;
  reasoningFactor?: string;
  technicalFactor?: string;
}

export interface ModelConfig {
  id: string;
  provider: string;
  name: string;
  tier: ModelTier;
  capabilityScore: number; // 0 - 100
  inputCostPer1M: number; // in USD
  outputCostPer1M: number; // in USD
  typicalLatency: number; // in seconds
  contextWindow: number; // in tokens
  enabled: boolean;
  recommendedComplexity: ComplexityLevel;
  description: string;
  badge?: string;
}

export interface AlternativeModelEvaluation {
  modelId: string;
  modelName: string;
  provider: string;
  tier: string;
  estimatedCost: number;
  estimatedLatency: number;
  capabilityScore: number;
  savingsPercentage: number;
  isWinner: boolean;
  rejectReason?: string;
}

export interface RoutingDecision {
  complexity: ComplexityLevel;
  complexityScore: number; // 0 - 100
  selectedModel: ModelConfig;
  reason: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  actualCost: number;
  baselineCost: number; // cost using baseline premium model
  costSaved: number;
  savingsPercentage: number;
  latency: number;
  signals: ComplexitySignals;
  alternatives: AlternativeModelEvaluation[];
  mode: 'demo' | 'live';
  providerSource?: ProviderSource;
}

export interface RouteResponse {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  decision: RoutingDecision;
  status: 'completed' | 'failed' | 'fallback';
}

export interface RequestRecord {
  id: string;
  timestamp: string;
  prompt: string;
  complexity: ComplexityLevel;
  complexityScore: number;
  selectedModelId: string;
  selectedModelName: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  actualCost: number;
  baselineCost: number;
  costSaved: number;
  savingsPercentage: number;
  latency: number;
  response: string;
  reason: string;
  status: 'completed' | 'failed' | 'fallback';
  mode: 'demo' | 'live';
  providerSource?: ProviderSource;
  signals?: ComplexitySignals;
  alternatives?: AlternativeModelEvaluation[];
}

export interface AnalyticsSummary {
  totalRequests: number;
  totalSpend: number;
  estimatedBaselineCost: number;
  costSaved: number;
  savingsPercentage: number;
  averageLatency: number;
  averageCostPerRequest: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  routingDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  modelDistribution: {
    modelId: string;
    modelName: string;
    requestCount: number;
    spend: number;
    percentage: number;
  }[];
  costOverTime: {
    date: string;
    timestamp: string;
    actualCost: number;
    baselineCost: number;
    costSaved: number;
    requests: number;
  }[];
  latencyByModel: {
    modelName: string;
    averageLatency: number;
  }[];
}

export interface SystemSettings {
  appName: string;
  currency: string;
  mode: 'demo' | 'live';
  executionMode?: 'demo' | 'live';
  optimizationStrategy: OptimizationStrategy;
  maxCostPerRequest: number;
  lowThreshold: number; // default 35
  mediumThreshold: number; // default 70
  baselineModelId: string;
  fallbackModelId?: string;
  easyModelId?: string;
  mediumModelId?: string;
  hardModelId?: string;
  preferredProvider?: string;
  hasGeminiKey: boolean;
  hasOpenAiKey: boolean;
  hasAnthropicKey: boolean;
  hasGroqKey: boolean;
}

export interface ModelComparisonItem {
  modelId: string;
  modelName: string;
  provider: string;
  tier: ModelTier;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latency: number;
  cost: number;
  isOptimal: boolean;
  providerSource?: ProviderSource;
}

export interface PromptComparisonResponse {
  prompt: string;
  optimalModelId: string;
  optimalModelName: string;
  complexity: ComplexityLevel;
  complexityScore: number;
  comparisons: ModelComparisonItem[];
}

