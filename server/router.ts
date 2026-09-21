import { analyzeComplexity } from './complexity.js';
import { db } from './db.js';
import { getProviderForModel } from './providers.js';
import {
  AlternativeModelEvaluation,
  ComplexityLevel,
  ModelConfig,
  RouteResponse,
  RoutingDecision,
} from '../src/types/index.js';

export interface RouteRequestPayload {
  prompt: string;
  manualModelId?: string;
  forceMode?: 'demo' | 'live';
  preferredProvider?: string; // 'all' | 'Google Gemini' | 'Anthropic Claude' | 'Groq AI' | 'OpenAI'
}

export async function processRoute(payload: RouteRequestPayload): Promise<RouteResponse> {
  const { prompt, manualModelId, forceMode } = payload;
  const settings = db.getSettings();
  const models = db.getModels().filter((m) => m.enabled);
  const baselineModel =
    models.find((m) => m.id === settings.baselineModelId) ||
    models.find((m) => m.id === 'gpt-4o') ||
    models.find((m) => m.tier === 'premium') ||
    models[0];

  // 1. Complexity Analysis
  const analysis = analyzeComplexity(
    prompt,
    settings.lowThreshold,
    settings.mediumThreshold
  );

  // 2. Model Selection Logic
  let selectedModel: ModelConfig;
  let reason = '';

  if (manualModelId) {
    const found = models.find((m) => m.id === manualModelId);
    if (found) {
      selectedModel = found;
      reason = `Manually selected model "${selectedModel.name}" (${selectedModel.provider}) by user override.`;
    } else {
      selectedModel = models[0];
      reason = `Manual model ${manualModelId} not found, defaulted to ${selectedModel.name}.`;
    }
  } else {
    // Detect active configured provider API keys
    const activeKeyProviders: string[] = [];
    if (settings.hasGeminiKey) activeKeyProviders.push('Google Gemini');
    if (settings.hasOpenAiKey) activeKeyProviders.push('OpenAI');
    if (settings.hasAnthropicKey) activeKeyProviders.push('Anthropic Claude');
    if (settings.hasGroqKey) activeKeyProviders.push('Groq AI');

    // Default model based on difficulty tier and available keys
    let defaultModelId = settings.easyModelId || process.env.EASY_MODEL || 'gemini-3.5-flash-lite';
    if (analysis.level === 'MEDIUM') {
      defaultModelId = settings.mediumModelId || process.env.MEDIUM_MODEL || 'claude-sonnet-5';
    } else if (analysis.level === 'HIGH') {
      defaultModelId = settings.hardModelId || process.env.HARD_MODEL || 'gpt-5.6-sol';
    }

    // Candidate models for this difficulty tier
    let candidates = models.filter((m) => {
      if (analysis.level === 'LOW') {
        return m.recommendedComplexity === 'LOW' || m.id === 'groq-gpt-oss-20b';
      } else if (analysis.level === 'MEDIUM') {
        return m.recommendedComplexity === 'MEDIUM' || m.id === 'groq-gpt-oss-120b';
      } else {
        return m.recommendedComplexity === 'HIGH' || m.id === 'groq-gpt-oss-120b';
      }
    });

    if (candidates.length === 0) {
      candidates = models.filter((m) => m.recommendedComplexity === analysis.level);
      if (candidates.length === 0) candidates = models;
    }

    // If user provided specific LLM API key(s), prefer routing to configured providers
    const effectivePreferredProvider = payload.preferredProvider || settings.preferredProvider;
    if (effectivePreferredProvider && effectivePreferredProvider !== 'all') {
      const providerFiltered = candidates.filter((m) =>
        m.provider.toLowerCase().includes(effectivePreferredProvider.toLowerCase())
      );
      if (providerFiltered.length > 0) {
        candidates = providerFiltered;
      }
    } else if (activeKeyProviders.length > 0) {
      // Prioritize providers where the user actually has active API keys configured
      const liveKeyFiltered = candidates.filter((m) =>
        activeKeyProviders.some((akp) => m.provider.toLowerCase().includes(akp.toLowerCase()))
      );
      if (liveKeyFiltered.length > 0) {
        candidates = liveKeyFiltered;
      }
    }

    const defaultModel =
      candidates.find((m) => m.id === defaultModelId) ||
      candidates[0] ||
      models.find((m) => m.id === defaultModelId) ||
      models[0];

    // Select candidate based on optimization strategy
    const strategy = settings.optimizationStrategy || 'balanced';

    if (strategy === 'latency') {
      candidates.sort((a, b) => a.typicalLatency - b.typicalLatency);
    } else if (strategy === 'quality') {
      candidates.sort((a, b) => b.capabilityScore - a.capabilityScore);
    } else if (strategy === 'cost') {
      candidates.sort((a, b) => (a.inputCostPer1M + a.outputCostPer1M) - (b.inputCostPer1M + b.outputCostPer1M));
    } else {
      // Balanced: score candidates based on capability / (cost + latency)
      candidates.sort((a, b) => {
        const scoreA = (a.capabilityScore / 100) / Math.max(0.04, a.inputCostPer1M * 0.4 + a.typicalLatency * 0.6);
        const scoreB = (b.capabilityScore / 100) / Math.max(0.04, b.inputCostPer1M * 0.4 + b.typicalLatency * 0.6);
        return scoreB - scoreA;
      });
    }

    selectedModel = candidates[0] || defaultModel;

    // Build the Autopilot routing explanation based on prompt quality
    const qTier = analysis.signals.qualityTier || (analysis.level === 'LOW' ? 'Basic / Routine' : analysis.level === 'MEDIUM' ? 'Intermediate / Structured' : 'Advanced / Frontier Reasoning');
    const keyInfo = activeKeyProviders.length > 0
      ? ` (Live API key active: ${activeKeyProviders.join(', ')})`
      : ' (Demo simulation mode)';

    if (selectedModel.id === defaultModel.id) {
      reason = `Prompt Quality: ${qTier} (Score: ${analysis.score}/100). ${analysis.signals.qualitySummary || ''} Routed to ${selectedModel.name} (${selectedModel.provider})${keyInfo} balancing cost ($${selectedModel.inputCostPer1M}/1M), latency (${selectedModel.typicalLatency}s), and capability rating (${selectedModel.capabilityScore}/100).`;
    } else {
      reason = `Prompt Quality: ${qTier} (Score: ${analysis.score}/100). ${analysis.signals.qualitySummary || ''} Evaluated candidates against ${defaultModel.name}; selected ${selectedModel.name} (${selectedModel.provider})${keyInfo} for optimal cost ($${selectedModel.inputCostPer1M}/1M vs $${defaultModel.inputCostPer1M}/1M) and latency (${selectedModel.typicalLatency}s vs ${defaultModel.typicalLatency}s).`;
    }
  }

  // 3. Execution via Multi-Provider Dispatcher with Safe Fallback
  // Auto-switch to live mode if user has an active key for the selected provider or Gemini key is configured
  const hasLiveKeyForSelected =
    (selectedModel.provider.includes('Gemini') && settings.hasGeminiKey) ||
    (selectedModel.provider.includes('OpenAI') && settings.hasOpenAiKey) ||
    (selectedModel.provider.includes('Claude') && settings.hasAnthropicKey) ||
    (selectedModel.provider.includes('Groq') && settings.hasGroqKey);

  const hasAnyKey = settings.hasGeminiKey || settings.hasOpenAiKey || settings.hasAnthropicKey || settings.hasGroqKey;
  const activeMode = forceMode || (hasLiveKeyForSelected || hasAnyKey ? 'live' : settings.mode);
  const provider = getProviderForModel(selectedModel, activeMode);
  let result;
  try {
    result = await provider.generate(prompt, selectedModel);
  } catch (err: any) {
    console.warn(`[processRoute] Provider call failed for ${selectedModel.name}, falling back to simulation:`, err?.message);
    const fallbackProvider = getProviderForModel(selectedModel, 'demo');
    result = await fallbackProvider.generate(prompt, selectedModel);
    result.providerSource = 'simulation';
  }

  // 4. Cost Calculations
  const inputCost = (result.inputTokens / 1_000_000) * selectedModel.inputCostPer1M;
  const outputCost = (result.outputTokens / 1_000_000) * selectedModel.outputCostPer1M;
  const actualCost = Number((inputCost + outputCost).toFixed(6));

  const baselineInputCost = (result.inputTokens / 1_000_000) * baselineModel.inputCostPer1M;
  const baselineOutputCost = (result.outputTokens / 1_000_000) * baselineModel.outputCostPer1M;
  const baselineCost = Number((baselineInputCost + baselineOutputCost).toFixed(6));

  const costSaved = Number(Math.max(0, baselineCost - actualCost).toFixed(6));
  const savingsPercentage =
    baselineCost > 0 ? Number(((costSaved / baselineCost) * 100).toFixed(1)) : 0;

  // 5. Evaluate Alternatives
  const alternatives: AlternativeModelEvaluation[] = models.map((m) => {
    const estCost =
      (result.inputTokens / 1_000_000) * m.inputCostPer1M +
      (result.outputTokens / 1_000_000) * m.outputCostPer1M;
    const isWinner = m.id === selectedModel.id;
    const estSaved = Math.max(0, baselineCost - estCost);
    const altSavingsPct = baselineCost > 0 ? (estSaved / baselineCost) * 100 : 0;

    let rejectReason = '';
    if (!isWinner) {
      if (m.inputCostPer1M > selectedModel.inputCostPer1M) {
        rejectReason = `Excessive cost ($${estCost.toFixed(5)}) for this prompt's complexity tier`;
      } else if (m.capabilityScore < selectedModel.capabilityScore) {
        rejectReason = `Capability score (${m.capabilityScore}) is insufficient for prompt requirements`;
      } else {
        rejectReason = `Sub-optimal latency or parameter efficiency profile`;
      }
    }

    return {
      modelId: m.id,
      modelName: m.name,
      provider: m.provider,
      tier: m.tier,
      estimatedCost: Number(estCost.toFixed(6)),
      estimatedLatency: m.typicalLatency,
      capabilityScore: m.capabilityScore,
      savingsPercentage: Number(altSavingsPct.toFixed(1)),
      isWinner,
      rejectReason: isWinner ? undefined : rejectReason,
    };
  });

  const decision: RoutingDecision = {
    complexity: analysis.level,
    complexityScore: analysis.score,
    selectedModel,
    reason,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    totalTokens: result.inputTokens + result.outputTokens,
    actualCost,
    baselineCost,
    costSaved,
    savingsPercentage,
    latency: result.latency,
    signals: analysis.signals,
    alternatives,
    mode: activeMode,
    providerSource: result.providerSource || (activeMode === 'live' ? 'live-gemini' : 'simulation'),
  };

  const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  // 6. Persist Request to DB
  db.addRequest({
    id,
    timestamp,
    prompt,
    complexity: decision.complexity,
    complexityScore: decision.complexityScore,
    selectedModelId: selectedModel.id,
    selectedModelName: selectedModel.name,
    provider: selectedModel.provider,
    inputTokens: decision.inputTokens,
    outputTokens: decision.outputTokens,
    totalTokens: decision.totalTokens,
    actualCost: decision.actualCost,
    baselineCost: decision.baselineCost,
    costSaved: decision.costSaved,
    savingsPercentage: decision.savingsPercentage,
    latency: decision.latency,
    response: result.response,
    reason: decision.reason,
    status: 'completed',
    mode: activeMode,
    providerSource: decision.providerSource,
    signals: decision.signals,
    alternatives: decision.alternatives,
  });

  return {
    id,
    timestamp,
    prompt,
    response: result.response,
    decision,
    status: 'completed',
  };
}
