import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  Play,
  Sparkles,
  Zap,
  TrendingDown,
  Clock,
  DollarSign,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Info,
  ArrowRight,
  MessageSquare,
  Send,
  RefreshCw,
  Globe,
  Radio,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api.js';
import {
  ModelConfig,
  RouteResponse,
  SystemSettings,
} from '../types/index.js';
import { formatCurrency, formatLatency } from '../lib/utils.js';

const SAMPLE_PROMPTS = [
  {
    label: 'Low: Factual Query',
    prompt: 'What is the capital of France?',
    complexity: 'LOW',
  },
  {
    label: 'Low: Code Format',
    prompt: 'Convert this date string "2026-09-15T02:00:00Z" to user readable UTC format in TypeScript.',
    complexity: 'LOW',
  },
  {
    label: 'Medium: Explanation',
    prompt: 'Explain how gradient descent works with a simple real-world analogy and pseudocode.',
    complexity: 'MEDIUM',
  },
  {
    label: 'Medium: Concurrency',
    prompt: 'Summarize the differences between optimistic concurrency control and pessimistic locking in PostgreSQL transactions.',
    complexity: 'MEDIUM',
  },
  {
    label: 'Medium: Clustering',
    prompt: 'Explain how the DBSCAN clustering algorithm handles spatial noise with key hyperparameters.',
    complexity: 'MEDIUM',
  },
  {
    label: 'High: Architecture',
    prompt: 'Design a scalable distributed architecture for a real-time financial fraud detection system and explain the trade-offs between Kafka, Flink, and micro-batching.',
    complexity: 'HIGH',
  },
  {
    label: 'High: Distributed Algorithm',
    prompt: 'Write a Python implementation of Raft consensus leader election with election timeouts and RPC heartbeat handlers.',
    complexity: 'HIGH',
  },
];

export function PlaygroundPage() {
  const location = useLocation();

  const [prompt, setPrompt] = useState('');
  const [routingMode, setRoutingMode] = useState<'auto' | 'manual'>('auto');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedManualModel, setSelectedManualModel] = useState<string>('');
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [loading, setLoading] = useState(false);
  const [executionStage, setExecutionStage] = useState<string>('');
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [turns, setTurns] = useState<Array<{ prompt: string; response: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const navigationHandledRef = useRef(false);

  // Follow-up State
  const [followUpText, setFollowUpText] = useState('');

  useEffect(() => {
    // Load models & settings
    Promise.all([api.getModels(), api.getSettings()])
      .then(([m, s]) => {
        setModels(m);
        setSettings(s);
        if (m.length > 0) setSelectedManualModel(m[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    // Handle pre-filled prompt from navigation (supports prompt or presetPrompt).
    // Do not navigate() here: replacing location on the same route remounts
    // Playground and wipes in-flight / completed conversation state.
    if (navigationHandledRef.current) return;
    const incomingPrompt = location.state?.prompt || location.state?.presetPrompt;
    if (!incomingPrompt) return;

    navigationHandledRef.current = true;
    setPrompt(incomingPrompt);
    if (location.state?.autoSubmit) {
      void handleExecuteRoute(incomingPrompt);
    }
  }, [location.state]);

  const handleSelectSample = (sampleText: string) => {
    setPrompt(sampleText);
    setError(null);
    setResult(null);
    setTurns([]);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleExecuteRoute();
  };

  const handleExecuteRoute = async (promptOverride?: string, manualOverrideId?: string) => {
    const textToRun = promptOverride !== undefined ? promptOverride : prompt;
    if (!textToRun || textToRun.trim().length === 0) {
      setError('Please enter a prompt to route.');
      return;
    }

    const modelId =
      manualOverrideId !== undefined
        ? manualOverrideId
        : routingMode === 'manual'
        ? selectedManualModel
        : undefined;

    setLoading(true);
    setError(null);
    setExecutionStage('Analyzing tokens & complexity signals (Code, Math, Logic)...');

    const stageTimer1 = setTimeout(() => {
      setExecutionStage('Evaluating optimal model across Gemini, Claude, Groq & OpenAI tiers...');
    }, 280);

    const stageTimer2 = setTimeout(() => {
      setExecutionStage('Executing inference and computing exact cost savings...');
    }, 600);

    try {
      const response = await api.routePrompt({
        prompt: textToRun,
        manualModelId: modelId,
        preferredProvider: routingMode === 'auto' && selectedProvider !== 'all' ? selectedProvider : undefined,
      });
      setResult(response);
      setTurns((prev) => [...prev, { prompt: textToRun, response: response.response }]);

      // Scroll smoothly to results so the user immediately sees the generated response and decision
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Execution failed');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setLoading(false);
      setExecutionStage('');
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const followUp = followUpText.trim();
    if (!followUp) return;
    const currentPrompt = prompt.trim() || result?.prompt || '';
    const newCombinedPrompt = `${currentPrompt}\n\nFollow-up: ${followUp}`;
    setPrompt(newCombinedPrompt);
    setFollowUpText('');
    setLoading(true);
    setError(null);
    setExecutionStage('Processing follow-up query with conversation context...');

    try {
      const response = await api.routePrompt({
        prompt: newCombinedPrompt,
        manualModelId: routingMode === 'manual' ? selectedManualModel : undefined,
        preferredProvider: routingMode === 'auto' && selectedProvider !== 'all' ? selectedProvider : undefined,
      });
      setResult(response);
      setTurns((prev) => [...prev, { prompt: followUp, response: response.response }]);
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Routing failed');
    } finally {
      setLoading(false);
      setExecutionStage('');
    }
  };

  const handleCopy = () => {
    if (!result?.response) return;
    navigator.clipboard.writeText(result.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProviderBadge = (provider: string) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('gemini') || p.includes('google')) {
      return {
        name: 'Google Gemini',
        badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400',
      };
    }
    if (p.includes('claude') || p.includes('anthropic')) {
      return {
        name: 'Anthropic Claude',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    }
    if (p.includes('groq') || p.includes('llama') || p.includes('deepseek')) {
      return {
        name: 'Groq AI',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    }
    if (p.includes('openai') || p.includes('gpt') || p.includes('o1')) {
      return {
        name: 'OpenAI',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    }
    return {
      name: provider,
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      dot: 'bg-slate-400',
    };
  };

  const getSourceBadge = (source?: string) => {
    if (source === 'live-gemini') {
      return { label: 'Live Gemini API', style: 'bg-blue-500/15 text-blue-400 border-blue-500/30', live: true };
    }
    if (source === 'live-anthropic') {
      return { label: 'Live Claude API', style: 'bg-amber-500/15 text-amber-400 border-amber-500/30', live: true };
    }
    if (source === 'live-groq') {
      return { label: 'Live Groq LPU API', style: 'bg-amber-500/15 text-amber-400 border-amber-500/30', live: true };
    }
    if (source === 'live-openai') {
      return { label: 'Live OpenAI API', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', live: true };
    }
    return { label: 'Multi-Model Simulation', style: 'bg-slate-800 text-slate-400 border-slate-700', live: false };
  };

  // Group models by provider for manual selection
  const groupedModels: { [provider: string]: ModelConfig[] } = {};
  models.forEach((m) => {
    if (!groupedModels[m.provider]) groupedModels[m.provider] = [];
    groupedModels[m.provider].push(m);
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30">
            <Zap className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AUTOPILOT <span className="text-orange-400 font-mono text-sm px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 font-bold">PLAYGROUND</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 font-normal">
          Direct prompt-to-response generation engine. Routes inputs across Gemini, Claude, Groq, and OpenAI models based on prompt quality.
        </p>
      </div>

      {/* Main Input Box Area */}
      <form
        onSubmit={handlePromptSubmit}
        className="rounded-xl bg-[#0a0a0d] border border-neutral-800 p-5 space-y-4 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-4 text-xs flex-wrap font-mono">
            <span className="text-neutral-400 font-medium">ROUTING:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300">
              <input
                type="radio"
                name="routingMode"
                value="auto"
                checked={routingMode === 'auto'}
                onChange={() => setRoutingMode('auto')}
                className="accent-orange-500"
              />
              <span className="font-semibold text-orange-400">Intelligent Quality Route</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-400 hover:text-neutral-200">
              <input
                type="radio"
                name="routingMode"
                value="manual"
                checked={routingMode === 'manual'}
                onChange={() => setRoutingMode('manual')}
                className="accent-orange-500"
              />
              <span>Manual Model Selection</span>
            </label>
          </div>

          {routingMode === 'auto' ? (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-neutral-400">PROVIDER:</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-[#121216] border border-neutral-700 text-neutral-200 rounded-md text-xs px-2.5 py-1 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Providers (Optimal Choice)</option>
                <option value="Google Gemini">Google Gemini Only</option>
                <option value="Anthropic Claude">Anthropic Claude Only</option>
                <option value="Groq AI">Groq AI Only (LPU)</option>
                <option value="OpenAI">OpenAI Only</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-neutral-400">MODEL:</span>
              <select
                value={selectedManualModel}
                onChange={(e) => setSelectedManualModel(e.target.value)}
                className="bg-[#121216] border border-neutral-700 text-neutral-200 rounded-md text-xs px-2.5 py-1 max-w-[280px] focus:border-orange-500 focus:outline-none"
              >
                {Object.entries(groupedModels).map(([prov, pModels]) => (
                  <optgroup key={prov} label={prov}>
                    {pModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.tier.toUpperCase()}) - ${m.inputCostPer1M}/1M
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="space-y-1.5">
          <textarea
            id="prompt-input"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleExecuteRoute();
              }
            }}
            placeholder="Type or paste any prompt to analyze quality signals, select the optimal LLM, and view the generated response..."
            className="w-full bg-[#050507] border border-neutral-800 rounded-lg p-3.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-orange-500/80 transition-colors font-sans leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono px-1">
            <span className="hidden sm:inline">
              Press <kbd className="px-1 py-0.5 rounded bg-[#16161b] text-neutral-300 border border-neutral-700 text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-[#16161b] text-neutral-300 border border-neutral-700 text-[10px]">Enter</kbd> to route
            </span>
            <span className="ml-auto">
              {prompt.length} chars · ~{Math.round(prompt.trim().split(/\s+/).filter(Boolean).length * 1.35)} tokens
            </span>
          </div>
        </div>

        {/* Sample Prompts Tray */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Quick Test Prompts:
            </span>
            <span className="text-[10px] font-mono text-neutral-400">Click to run</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.prompt)}
                className="px-2.5 py-1 rounded-md bg-[#121216] hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 hover:border-orange-500/40 hover:text-orange-300 whitespace-nowrap cursor-pointer transition-colors shrink-0 font-mono text-[11px]"
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                    sample.complexity === 'LOW'
                      ? 'bg-emerald-400'
                      : sample.complexity === 'MEDIUM'
                      ? 'bg-orange-400'
                      : 'bg-purple-400'
                  }`}
                />
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-neutral-400 font-mono text-[11px]">
            {routingMode === 'auto' ? (
              <span>
                Engine evaluates prompt quality and selects highest-efficiency model
              </span>
            ) : (
              <span>Manual model override mode active</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPrompt('');
                setResult(null);
                setTurns([]);
                setError(null);
              }}
              className="p-2 rounded-md bg-[#121216] text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition-colors"
              title="Clear input and results"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="execute-route-btn"
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 rounded-md bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-900 disabled:text-neutral-600 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{loading ? 'Routing & Answering...' : 'Route & Generate'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Live Routing Pipeline Indicator (Active while loading) */}
      {loading && (
        <div className="p-5 rounded-xl bg-[#0a0a0d] border border-orange-500/40 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center text-black font-bold shadow-md shadow-orange-500/30">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Routing Engine Processing</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                </h3>
                <p className="text-[11px] sm:text-xs text-orange-400 font-mono mt-0.5">
                  {executionStage || 'Evaluating prompt signals and finding optimal model...'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hidden sm:inline">
              Zero-Latency Analysis
            </span>
          </div>

          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Execution Results View */}
      {result && (
        <div ref={resultsRef} className="space-y-6 scroll-mt-6">
          {/* Decision Summary Card */}
          <div className="rounded-xl bg-[#0a0a0d] border border-neutral-800 p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                    ROUTING DECISION
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      result.decision.complexity === 'LOW'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : result.decision.complexity === 'MEDIUM'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    }`}
                  >
                    {result.decision.complexity} Complexity ({result.decision.complexityScore}/100)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Optimal Model: {result.decision.selectedModel.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${
                      getProviderBadge(result.decision.selectedModel.provider).badge
                    }`}
                  >
                    {result.decision.selectedModel.provider}
                  </span>
                </h3>
              </div>

              <div className="text-right sm:text-right font-mono">
                <div className="text-xs text-neutral-400">
                  Input: ${result.decision.selectedModel.inputCostPer1M}/1M · Output: $
                  {result.decision.selectedModel.outputCostPer1M}/1M
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Tokens: {result.decision.inputTokens} in · {result.decision.outputTokens} out
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-lg bg-[#050507] border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Inference Cost</div>
                <div className="text-base font-bold text-white mt-0.5">
                  ${result.decision.actualCost.toFixed(5)}
                </div>
                <div className="text-[10px] text-neutral-400">
                  Baseline: ${result.decision.baselineCost.toFixed(5)}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-orange-950/20 border border-orange-800/40">
                <div className="text-[10px] text-orange-400 uppercase tracking-wider font-bold">Cost Saved</div>
                <div className="text-base font-bold text-orange-400 mt-0.5">
                  {result.decision.savingsPercentage}%
                </div>
                <div className="text-[10px] text-orange-500/90 font-medium">
                  +${result.decision.costSaved.toFixed(5)} saved
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#050507] border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Latency</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {result.decision.latency.toFixed(2)}s
                </div>
                <div className="text-[10px] text-neutral-400 font-sans">Execution time</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#050507] border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Capability Rating</div>
                <div className="text-base font-bold text-orange-300 mt-0.5">
                  {result.decision.selectedModel.capabilityScore}/100
                </div>
                <div className="text-[10px] text-neutral-400 font-sans">Quality benchmark</div>
              </div>
            </div>

            {/* Prompt Quality Evaluation Breakdown */}
            <div className="p-4 rounded-lg bg-[#050507] border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                    Prompt Quality Analysis
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    result.decision.complexity === 'LOW'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : result.decision.complexity === 'MEDIUM'
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  }`}
                >
                  {result.decision.signals.qualityTier || `${result.decision.complexity} Tier`} · Score {result.decision.complexityScore}/100
                </span>
              </div>

              {result.decision.signals.qualitySummary && (
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {result.decision.signals.qualitySummary}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-mono">
                <div className="p-2.5 rounded-md bg-[#0d0d10] border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px] uppercase mb-0.5 tracking-wider">Instruction Clarity</span>
                  <span className="text-neutral-200 font-medium font-sans">{result.decision.signals.clarityFactor || 'Clear instruction'}</span>
                </div>
                <div className="p-2.5 rounded-md bg-[#0d0d10] border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px] uppercase mb-0.5 tracking-wider">Reasoning Load</span>
                  <span className="text-neutral-200 font-medium font-sans">{result.decision.signals.reasoningFactor || 'Balanced cognition'}</span>
                </div>
                <div className="p-2.5 rounded-md bg-[#0d0d10] border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px] uppercase mb-0.5 tracking-wider">Domain Depth</span>
                  <span className="text-neutral-200 font-medium font-sans">{result.decision.signals.technicalFactor || 'Standard vocabulary'}</span>
                </div>
              </div>
            </div>

            {/* Routing Reason & Signals */}
            <div className="p-4 rounded-lg bg-[#050507] border border-neutral-800/90 space-y-3">
              <div>
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">Routing Rationale:</span>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed font-sans">
                  {result.decision.reason}
                </p>
              </div>

              {result.decision.signals.detectedSignals.length > 0 && (
                <div className="pt-2 border-t border-neutral-800/70">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
                    Architectural Signals:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.decision.signals.detectedSignals.map((signal, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-[#121216] text-[10px] text-neutral-300 border border-neutral-800 font-mono"
                      >
                        ✓ {signal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Direct LLM Answer Section */}
          <div className="rounded-xl bg-[#0a0a0d] border border-neutral-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#0e0e12] border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/25">
                  <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                      LLM Answer
                    </span>
                    <span className="text-xs text-orange-400 font-mono font-bold">
                      [{result.decision.selectedModel.name}]
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                        getSourceBadge(result.decision.providerSource).style
                      }`}
                    >
                      {getSourceBadge(result.decision.providerSource).live && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {getSourceBadge(result.decision.providerSource).label}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Generated in {result.decision.latency.toFixed(2)}s · {result.decision.outputTokens} output tokens (${result.decision.actualCost.toFixed(5)})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16161b] hover:bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 transition-colors cursor-pointer font-mono"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prompt Given by the User */}
            {(turns.length > 0 ? turns : [{ prompt: result.prompt, response: result.response }]).map((turn, idx) => (
              <div key={`${idx}-${turn.prompt.slice(0, 24)}`}>
                <div className="px-6 py-3 bg-[#060608] border-b border-neutral-800/80 flex items-start gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 shrink-0 mt-0.5">
                    PROMPT:
                  </span>
                  <p className="text-xs text-neutral-200 font-medium leading-relaxed font-sans">
                    {turn.prompt}
                  </p>
                </div>
                <div className="p-6 text-sm text-neutral-100 leading-relaxed font-sans selection:bg-orange-500/25 max-h-[700px] overflow-y-auto markdown-content bg-[#040406]">
                  <Markdown>{turn.response}</Markdown>
                </div>
              </div>
            ))}

            {/* Interactive Follow-up Bar */}
            <div className="p-4 bg-[#09090c] border-t border-neutral-800">
              <form onSubmit={handleFollowUp} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={followUpText}
                    onChange={(e) => setFollowUpText(e.target.value)}
                    placeholder="Ask a follow-up query or modify parameters..."
                    className="w-full bg-[#040406] border border-neutral-800 rounded-md px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-orange-500/80 transition-colors font-sans"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !followUpText.trim()}
                  className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-900 disabled:text-neutral-600 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
