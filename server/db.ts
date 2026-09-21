import fs from 'fs';
import path from 'path';
import {
  ModelConfig,
  RequestRecord,
  SystemSettings,
  AnalyticsSummary,
} from '../src/types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_MODELS: ModelConfig[] = [
  // -------------------------------------------------------------
  // Easy Complexity Tier (Default: Gemini 3.5 Flash-Lite)
  // -------------------------------------------------------------
  {
    id: 'gemini-3.5-flash-lite',
    provider: 'Google Gemini',
    name: 'Gemini 3.5 Flash-Lite',
    tier: 'fast',
    capabilityScore: 82,
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    typicalLatency: 0.28,
    contextWindow: 1000000,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'Very cost-efficient and ultra-fast for routine tasks, classification, and quick extractions with 1M token context.',
    badge: 'Default Easy ⭐',
  },
  {
    id: 'claude-haiku-4.5',
    provider: 'Anthropic Claude',
    name: 'Claude Haiku 4.5',
    tier: 'fast',
    capabilityScore: 86,
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    typicalLatency: 0.45,
    contextWindow: 200000,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'High-speed Anthropic model optimized for fast turnaround, code syntax edits, and responsive chat.',
    badge: 'Fast Intelligence',
  },
  {
    id: 'gpt-5.6-luna',
    provider: 'OpenAI',
    name: 'GPT-5.6 Luna',
    tier: 'fast',
    capabilityScore: 84,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    typicalLatency: 0.38,
    contextWindow: 128000,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'Lightweight OpenAI engine built for low-latency queries and high-volume data transformation.',
    badge: 'OpenAI Speed',
  },
  {
    id: 'groq-gpt-oss-20b',
    provider: 'Groq AI',
    name: 'Groq GPT-OSS 20B',
    tier: 'fast',
    capabilityScore: 81,
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    typicalLatency: 0.15,
    contextWindow: 131072,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'Ultra-fast open architecture accelerated on Groq LPUs delivering 800+ tokens/sec at lowest possible cost.',
    badge: '800+ T/s LPU',
  },

  // -------------------------------------------------------------
  // Medium Complexity Tier (Default: Claude Sonnet 5)
  // -------------------------------------------------------------
  {
    id: 'claude-sonnet-5',
    provider: 'Anthropic Claude',
    name: 'Claude Sonnet 5',
    tier: 'balanced',
    capabilityScore: 98,
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    typicalLatency: 1.20,
    contextWindow: 200000,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Strong balance of nuanced multi-step reasoning, architectural quality, and cost efficiency.',
    badge: 'Default Medium ⭐',
  },
  {
    id: 'gemini-3.8-flash',
    provider: 'Google Gemini',
    name: 'Gemini 3.8 Flash',
    tier: 'balanced',
    capabilityScore: 94,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    typicalLatency: 0.55,
    contextWindow: 1000000,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Next-generation multimodal balance with exceptional code generation and low token expense.',
    badge: 'Multimodal Speed',
  },
  {
    id: 'gpt-5.6-terra',
    provider: 'OpenAI',
    name: 'GPT-5.6 Terra',
    tier: 'balanced',
    capabilityScore: 95,
    inputCostPer1M: 2.00,
    outputCostPer1M: 8.00,
    typicalLatency: 1.05,
    contextWindow: 128000,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Balanced OpenAI engine delivering high instruction adherence, mathematical analysis, and structured outputs.',
    badge: 'Balanced Frontier',
  },
  {
    id: 'groq-gpt-oss-120b',
    provider: 'Groq AI',
    name: 'Groq GPT-OSS 120B',
    tier: 'balanced',
    capabilityScore: 96,
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    typicalLatency: 0.35,
    contextWindow: 131072,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Flagship open architecture accelerated on Groq LPUs. Exceptional reasoning and coding at over 300 tokens/sec.',
    badge: '300+ T/s LPU',
  },

  // -------------------------------------------------------------
  // Hard Complexity Tier (Default: GPT-5.6 Sol)
  // -------------------------------------------------------------
  {
    id: 'gpt-5.6-sol',
    provider: 'OpenAI',
    name: 'GPT-5.6 Sol',
    tier: 'premium',
    capabilityScore: 99,
    inputCostPer1M: 12.00,
    outputCostPer1M: 48.00,
    typicalLatency: 2.80,
    contextWindow: 128000,
    enabled: true,
    recommendedComplexity: 'HIGH',
    description: 'Flagship choice for complex reasoning, autonomous multi-step planning, and advanced distributed coding.',
    badge: 'Default Hard ⭐',
  },
  {
    id: 'gemini-3.1-pro',
    provider: 'Google Gemini',
    name: 'Gemini 3.1 Pro',
    tier: 'premium',
    capabilityScore: 97,
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    typicalLatency: 1.95,
    contextWindow: 2000000,
    enabled: true,
    recommendedComplexity: 'HIGH',
    description: 'Massive 2M token context window for deep repository audits, research synthesis, and multi-file analysis.',
    badge: '2M Context Pro',
  },
  {
    id: 'claude-opus-5',
    provider: 'Anthropic Claude',
    name: 'Claude Opus 5',
    tier: 'premium',
    capabilityScore: 98,
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    typicalLatency: 3.20,
    contextWindow: 200000,
    enabled: true,
    recommendedComplexity: 'HIGH',
    description: 'Deliberative deep-thinking model for open-ended analytical problems and enterprise strategy.',
    badge: 'Deliberative Opus',
  },

  // -------------------------------------------------------------
  // Legacy & Compatibility Models
  // -------------------------------------------------------------
  {
    id: 'gemini-2-0-flash',
    provider: 'Google Gemini',
    name: 'Gemini 2.0 Flash',
    tier: 'balanced',
    capabilityScore: 90,
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40,
    typicalLatency: 0.65,
    contextWindow: 1000000,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Multimodal speed and balanced reasoning across coding and analysis.',
    badge: 'High Speed Flash',
  },
  {
    id: 'claude-3-5-sonnet',
    provider: 'Anthropic Claude',
    name: 'Claude 3.5 Sonnet',
    tier: 'balanced',
    capabilityScore: 97,
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    typicalLatency: 1.30,
    contextWindow: 200000,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Previous-generation industry benchmark for software architecture.',
    badge: 'Code Benchmark',
  },
  {
    id: 'gpt-4o',
    provider: 'OpenAI',
    name: 'GPT-4o',
    tier: 'balanced',
    capabilityScore: 95,
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    typicalLatency: 1.10,
    contextWindow: 128000,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Omni flagship model natively uniting complex text analysis and coding.',
    badge: 'Omni Standard',
  },
  {
    id: 'llama-3-3-70b-versatile',
    provider: 'Groq AI',
    name: 'Llama 3.3 70B Versatile (Groq)',
    tier: 'balanced',
    capabilityScore: 96,
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    typicalLatency: 0.38,
    contextWindow: 131072,
    enabled: true,
    recommendedComplexity: 'MEDIUM',
    description: 'Flagship Meta open model on Groq LPUs at 300+ tokens/sec.',
    badge: 'LPU Versatile',
  },
  {
    id: 'gemini-1-5-flash-8b',
    provider: 'Google Gemini',
    name: 'Gemini 1.5 Flash-8B',
    tier: 'fast',
    capabilityScore: 74,
    inputCostPer1M: 0.0375,
    outputCostPer1M: 0.15,
    typicalLatency: 0.35,
    contextWindow: 1000000,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'Sub-second classification and rapid transactional Q&A.',
    badge: 'Lowest Cost Flash',
  },
  {
    id: 'gemini-1-5-pro',
    provider: 'Google Gemini',
    name: 'Gemini 1.5 Pro',
    tier: 'premium',
    capabilityScore: 96,
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    typicalLatency: 2.10,
    contextWindow: 2000000,
    enabled: true,
    recommendedComplexity: 'HIGH',
    description: '2M token context window for document synthesis.',
    badge: '2M Context',
  },
  {
    id: 'claude-3-5-haiku',
    provider: 'Anthropic Claude',
    name: 'Claude 3.5 Haiku',
    tier: 'fast',
    capabilityScore: 84,
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    typicalLatency: 0.50,
    contextWindow: 200000,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'High-speed intelligence matching previous-gen flagship performance.',
    badge: 'Fast Coding',
  },
  {
    id: 'claude-3-opus',
    provider: 'Anthropic Claude',
    name: 'Claude 3 Opus',
    tier: 'premium',
    capabilityScore: 95,
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    typicalLatency: 3.20,
    contextWindow: 200000,
    enabled: true,
    recommendedComplexity: 'HIGH',
    description: 'Deliberative deep-thinking model for analytical problems.',
    badge: 'Deep Synthesis',
  },
  {
    id: 'llama-3-1-8b-instant',
    provider: 'Groq AI',
    name: 'Llama 3.1 8B Instant (Groq)',
    tier: 'fast',
    capabilityScore: 82,
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    typicalLatency: 0.18,
    contextWindow: 131072,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'Blazing sub-second LPU inference powered by Meta Llama 3.1 8B.',
    badge: 'Ultra-Fast LPU',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    provider: 'Groq AI',
    name: 'DeepSeek R1 Distill 70B (Groq)',
    tier: 'premium',
    capabilityScore: 97,
    inputCostPer1M: 0.75,
    outputCostPer1M: 0.99,
    typicalLatency: 0.55,
    contextWindow: 131072,
    enabled: true,
    recommendedComplexity: 'HIGH',
    description: 'DeepSeek R1 reasoning architecture distilled onto Llama-70B.',
    badge: 'Reasoning LPU',
  },
  {
    id: 'gpt-4o-mini',
    provider: 'OpenAI',
    name: 'GPT-4o mini',
    tier: 'fast',
    capabilityScore: 82,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    typicalLatency: 0.45,
    contextWindow: 128000,
    enabled: true,
    recommendedComplexity: 'LOW',
    description: 'Cost-efficient workhorse for high-volume chat.',
    badge: 'Budget Standard',
  },
  {
    id: 'o1-preview',
    provider: 'OpenAI',
    name: 'OpenAI o1-preview',
    tier: 'premium',
    capabilityScore: 99,
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    typicalLatency: 4.50,
    contextWindow: 128000,
    enabled: true,
    recommendedComplexity: 'HIGH',
    description: 'Reinforcement learning model with chain-of-thought verification.',
    badge: 'Chain-of-Thought',
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  appName: 'LLM Cost Autopilot',
  currency: 'USD',
  mode: process.env.DEMO_MODE === 'false' ? 'live' : 'demo',
  optimizationStrategy: (process.env.OPTIMIZATION_STRATEGY as any) || 'balanced',
  maxCostPerRequest: 0.05,
  lowThreshold: 35,
  mediumThreshold: 70,
  baselineModelId: process.env.HARD_MODEL || 'gpt-5.6-sol',
  fallbackModelId: 'gemini-3.5-flash-lite',
  easyModelId: process.env.EASY_MODEL || 'gemini-3.5-flash-lite',
  mediumModelId: process.env.MEDIUM_MODEL || 'claude-sonnet-5',
  hardModelId: process.env.HARD_MODEL || 'gpt-5.6-sol',
  preferredProvider: 'all',
  hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
  hasOpenAiKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5,
  hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 5,
  hasGroqKey: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5,
};

interface DatabaseSchema {
  models: ModelConfig[];
  requests: RequestRecord[];
  settings: SystemSettings;
}

// Initial seed requests
function generateSeedRequests(): RequestRecord[] {
  const seeds: Array<{
    prompt: string;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    score: number;
    modelId: string;
    modelName: string;
    provider: string;
    inTokens: number;
    outTokens: number;
    latency: number;
    response: string;
    reason: string;
    minsAgo: number;
  }> = [
    {
      prompt: 'What is the capital of France?',
      complexity: 'LOW',
      score: 18,
      modelId: 'fast-mini',
      modelName: 'Gemini 1.5 Flash-8B / Llama 3.1 8B',
      provider: 'Google / Meta',
      inTokens: 12,
      outTokens: 18,
      latency: 0.38,
      response: 'The capital of France is Paris. It is also the country\'s most populous city and its political, cultural, and economic center.',
      reason: 'Low complexity factual query with no reasoning requirements; routed to fast low-cost tier.',
      minsAgo: 140,
    },
    {
      prompt: 'Explain how gradient descent works with a simple real-world analogy and pseudocode.',
      complexity: 'MEDIUM',
      score: 54,
      modelId: 'balanced-flash',
      modelName: 'Gemini 2.0 Flash / Claude 3.5 Haiku',
      provider: 'Google / Anthropic',
      inTokens: 38,
      outTokens: 410,
      latency: 1.25,
      response: 'Think of gradient descent like finding your way down a foggy mountain. You cannot see the bottom, but by feeling the slope beneath your feet, you step in the direction of steepest descent until you reach the lowest valley...',
      reason: 'Prompt requires explanatory analogy, moderate mathematical intuition, and pseudocode formatting; routed to balanced tier.',
      minsAgo: 110,
    },
    {
      prompt: 'Design a scalable distributed architecture for a real-time financial fraud detection system and explain the trade-offs between Kafka, Flink, and micro-batching.',
      complexity: 'HIGH',
      score: 88,
      modelId: 'premium-pro',
      modelName: 'Gemini 1.5 Pro / GPT-4o',
      provider: 'Google / OpenAI',
      inTokens: 75,
      outTokens: 820,
      latency: 2.94,
      response: 'A real-time financial fraud detection pipeline requires sub-50ms p99 latency with strict exactly-once event semantics. Key components include event ingestion with Apache Kafka, stateful stream evaluation with Apache Flink, and feature stores via Redis/Aerospike...',
      reason: 'High technical complexity involving distributed systems, stateful stream processing, and architectural trade-offs; routed to flagship model.',
      minsAgo: 85,
    },
    {
      prompt: 'Convert this date string "2026-09-15T02:00:00Z" to user readable UTC format in TypeScript.',
      complexity: 'LOW',
      score: 28,
      modelId: 'fast-mini',
      modelName: 'Gemini 1.5 Flash-8B / Llama 3.1 8B',
      provider: 'Google / Meta',
      inTokens: 25,
      outTokens: 85,
      latency: 0.42,
      response: '```typescript\nconst date = new Date("2026-09-15T02:00:00Z");\nconsole.log(date.toUTCString()); // "Tue, 15 Sep 2026 02:00:00 GMT"\n```',
      reason: 'Short straightforward syntax transformation easily resolved by fast model.',
      minsAgo: 60,
    },
    {
      prompt: 'Summarize the differences between optimistic concurrency control and pessimistic locking in PostgreSQL transactions.',
      complexity: 'MEDIUM',
      score: 62,
      modelId: 'balanced-flash',
      modelName: 'Gemini 2.0 Flash / Claude 3.5 Haiku',
      provider: 'Google / Anthropic',
      inTokens: 42,
      outTokens: 340,
      latency: 1.18,
      response: 'Optimistic Concurrency Control (OCC) assumes conflicts are rare, checking for version mismatches at commit time. In contrast, Pessimistic Locking assumes collisions will happen and acquires explicit row locks (SELECT FOR UPDATE)...',
      reason: 'Conceptual database query with technical comparison requiring balanced multi-perspective reasoning.',
      minsAgo: 45,
    },
    {
      prompt: 'Write a Python implementation of Raft consensus leader election with election timeouts and RPC heartbeat handlers.',
      complexity: 'HIGH',
      score: 92,
      modelId: 'premium-pro',
      modelName: 'Gemini 1.5 Pro / GPT-4o',
      provider: 'Google / OpenAI',
      inTokens: 65,
      outTokens: 910,
      latency: 3.12,
      response: 'Below is an asynchronous implementation of Raft Leader Election using Python asyncio and socket primitives...',
      reason: 'High-order distributed algorithms and multi-agent state machines require premium reasoning capability.',
      minsAgo: 25,
    },
    {
      prompt: 'Fix grammatical errors in: "We was going to the store but the rain start to fell."',
      complexity: 'LOW',
      score: 15,
      modelId: 'fast-mini',
      modelName: 'Gemini 1.5 Flash-8B / Llama 3.1 8B',
      provider: 'Google / Meta',
      inTokens: 24,
      outTokens: 35,
      latency: 0.35,
      response: 'Corrected version: "We were going to the store, but the rain started to fall."',
      reason: 'Simple grammar correction and sentence rewrite handled optimally by lightweight model.',
      minsAgo: 10,
    },
  ];

  const now = Date.now();
  const baselineModel = DEFAULT_MODELS[2]; // premium

  return seeds.map((s, idx) => {
    const timestamp = new Date(now - s.minsAgo * 60 * 1000).toISOString();
    const currentModel = DEFAULT_MODELS.find((m) => m.id === s.modelId) || DEFAULT_MODELS[0];

    const actualCost =
      (s.inTokens / 1_000_000) * currentModel.inputCostPer1M +
      (s.outTokens / 1_000_000) * currentModel.outputCostPer1M;

    const baselineCost =
      (s.inTokens / 1_000_000) * baselineModel.inputCostPer1M +
      (s.outTokens / 1_000_000) * baselineModel.outputCostPer1M;

    const costSaved = Math.max(0, baselineCost - actualCost);
    const savingsPercentage = baselineCost > 0 ? (costSaved / baselineCost) * 100 : 0;

    return {
      id: `req-seed-${idx + 1}`,
      timestamp,
      prompt: s.prompt,
      complexity: s.complexity,
      complexityScore: s.score,
      selectedModelId: s.modelId,
      selectedModelName: s.modelName,
      provider: s.provider,
      inputTokens: s.inTokens,
      outputTokens: s.outTokens,
      totalTokens: s.inTokens + s.outTokens,
      actualCost: Number(actualCost.toFixed(6)),
      baselineCost: Number(baselineCost.toFixed(6)),
      costSaved: Number(costSaved.toFixed(6)),
      savingsPercentage: Number(savingsPercentage.toFixed(1)),
      latency: s.latency,
      response: s.response,
      reason: s.reason,
      status: 'completed',
      mode: 'demo',
    };
  });
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (!raw.trim()) {
          // File is empty, initialize fresh
          const initialData: DatabaseSchema = {
            models: DEFAULT_MODELS,
            requests: generateSeedRequests(),
            settings: DEFAULT_SETTINGS,
          };
          this.persist(initialData);
          return initialData;
        }
        const parsed = JSON.parse(raw);
        let models: ModelConfig[] = parsed.models || [];

        // Ensure all 4 providers and the difficulty tier models are present
        const hasNewModels =
          models.some((m) => m.id === 'gemini-3.5-flash-lite') &&
          models.some((m) => m.id === 'claude-sonnet-5') &&
          models.some((m) => m.id === 'gpt-5.6-sol');

        if (!hasNewModels || models.length < 15) {
          models = DEFAULT_MODELS;
        }

        const settings: SystemSettings = {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {}),
          easyModelId: parsed.settings?.easyModelId || process.env.EASY_MODEL || 'gemini-3.5-flash-lite',
          mediumModelId: parsed.settings?.mediumModelId || process.env.MEDIUM_MODEL || 'claude-sonnet-5',
          hardModelId: parsed.settings?.hardModelId || process.env.HARD_MODEL || 'gpt-5.6-sol',
          hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
          hasOpenAiKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5,
          hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 5,
          hasGroqKey: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5,
        };

        const schema: DatabaseSchema = {
          models,
          requests: parsed.requests || generateSeedRequests(),
          settings,
        };
        this.persist(schema);
        return schema;
      }
    } catch (err) {
      console.warn('Could not read persistent DB, falling back to in-memory defaults:', err);
    }

    const initialData: DatabaseSchema = {
      models: DEFAULT_MODELS,
      requests: generateSeedRequests(),
      settings: DEFAULT_SETTINGS,
    };
    this.persist(initialData);
    return initialData;
  }

  private persist(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write store.json:', err);
    }
  }

  public getModels(): ModelConfig[] {
    return this.data.models;
  }

  public getModelById(id: string): ModelConfig | undefined {
    return this.data.models.find((m) => m.id === id);
  }

  public updateModel(id: string, updates: Partial<ModelConfig>): ModelConfig | null {
    const idx = this.data.models.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.models[idx] = { ...this.data.models[idx], ...updates };
    this.persist(this.data);
    return this.data.models[idx];
  }

  public addModel(model: ModelConfig): ModelConfig {
    this.data.models.push(model);
    this.persist(this.data);
    return model;
  }

  public getSettings(): SystemSettings {
    // dynamically check keys and defaults
    return {
      ...this.data.settings,
      easyModelId: this.data.settings.easyModelId || process.env.EASY_MODEL || 'gemini-3.5-flash-lite',
      mediumModelId: this.data.settings.mediumModelId || process.env.MEDIUM_MODEL || 'claude-sonnet-5',
      hardModelId: this.data.settings.hardModelId || process.env.HARD_MODEL || 'gpt-5.6-sol',
      hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
      hasOpenAiKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 5,
      hasGroqKey: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5,
    };
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist(this.data);
    return this.getSettings();
  }

  public getRequests(limit: number = 100): RequestRecord[] {
    return [...this.data.requests].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, limit);
  }

  public getRequestById(id: string): RequestRecord | undefined {
    return this.data.requests.find((r) => r.id === id);
  }

  public addRequest(record: RequestRecord): RequestRecord {
    this.data.requests.unshift(record);
    // Keep last 500 requests
    if (this.data.requests.length > 500) {
      this.data.requests = this.data.requests.slice(0, 500);
    }
    this.persist(this.data);
    return record;
  }

  public resetSeed(): void {
    this.data.requests = generateSeedRequests();
    this.data.models = DEFAULT_MODELS;
    this.data.settings = DEFAULT_SETTINGS;
    this.persist(this.data);
  }

  public getAnalytics(filterHours?: number): AnalyticsSummary {
    const now = Date.now();
    let requests = this.data.requests;

    if (filterHours && filterHours > 0) {
      const cutoff = now - filterHours * 60 * 60 * 1000;
      requests = requests.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
    }

    const totalRequests = requests.length;
    let totalSpend = 0;
    let estimatedBaselineCost = 0;
    let totalLatency = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const routingDist: { LOW: number; MEDIUM: number; HIGH: number } = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    const modelMap = new Map<string, { modelName: string; count: number; spend: number }>();

    for (const req of requests) {
      totalSpend += req.actualCost;
      estimatedBaselineCost += req.baselineCost;
      totalLatency += req.latency;
      totalInputTokens += req.inputTokens;
      totalOutputTokens += req.outputTokens;

      if (req.complexity in routingDist) {
        routingDist[req.complexity]++;
      }

      const existing = modelMap.get(req.selectedModelId) || {
        modelName: req.selectedModelName,
        count: 0,
        spend: 0,
      };
      existing.count++;
      existing.spend += req.actualCost;
      modelMap.set(req.selectedModelId, existing);
    }

    const costSaved = Math.max(0, estimatedBaselineCost - totalSpend);
    const savingsPercentage =
      estimatedBaselineCost > 0 ? (costSaved / estimatedBaselineCost) * 100 : 0;
    const averageLatency = totalRequests > 0 ? totalLatency / totalRequests : 0;
    const averageCostPerRequest = totalRequests > 0 ? totalSpend / totalRequests : 0;

    const modelDistribution = Array.from(modelMap.entries()).map(([modelId, stat]) => ({
      modelId,
      modelName: stat.modelName,
      requestCount: stat.count,
      spend: Number(stat.spend.toFixed(6)),
      percentage: totalRequests > 0 ? Number(((stat.count / totalRequests) * 100).toFixed(1)) : 0,
    }));

    // Group costs by time (daily or hourly)
    const costOverTimeMap = new Map<string, { actual: number; baseline: number; saved: number; count: number }>();
    for (const req of requests) {
      const dateKey = req.timestamp.slice(0, 10);
      const cur = costOverTimeMap.get(dateKey) || { actual: 0, baseline: 0, saved: 0, count: 0 };
      cur.actual += req.actualCost;
      cur.baseline += req.baselineCost;
      cur.saved += req.costSaved;
      cur.count += 1;
      costOverTimeMap.set(dateKey, cur);
    }

    const costOverTime = Array.from(costOverTimeMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        timestamp: date,
        actualCost: Number(data.actual.toFixed(5)),
        baselineCost: Number(data.baseline.toFixed(5)),
        costSaved: Number(data.saved.toFixed(5)),
        requests: data.count,
      }));

    // Latency by model
    const latencyMap = new Map<string, { sum: number; count: number }>();
    for (const req of requests) {
      const cur = latencyMap.get(req.selectedModelName) || { sum: 0, count: 0 };
      cur.sum += req.latency;
      cur.count += 1;
      latencyMap.set(req.selectedModelName, cur);
    }

    const latencyByModel = Array.from(latencyMap.entries()).map(([name, stat]) => ({
      modelName: name,
      averageLatency: Number((stat.sum / stat.count).toFixed(2)),
    }));

    return {
      totalRequests,
      totalSpend: Number(totalSpend.toFixed(4)),
      estimatedBaselineCost: Number(estimatedBaselineCost.toFixed(4)),
      costSaved: Number(costSaved.toFixed(4)),
      savingsPercentage: Number(savingsPercentage.toFixed(1)),
      averageLatency: Number(averageLatency.toFixed(2)),
      averageCostPerRequest: Number(averageCostPerRequest.toFixed(5)),
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      routingDistribution: routingDist,
      modelDistribution,
      costOverTime,
      latencyByModel,
    };
  }
}

export const db = new Store();
