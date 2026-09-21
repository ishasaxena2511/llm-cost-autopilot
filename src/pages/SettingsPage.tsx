import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Zap,
  DollarSign,
  Layers,
  Info,
  Key,
  Check,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api.js';
import { SystemSettings, ModelConfig } from '../types/index.js';

export function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([api.getSettings(), api.getModels()]);
      setSettings(s);
      setModels(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Reset routing thresholds and settings to factory defaults?')) return;
    setSaving(true);
    try {
      const updated = await api.updateSettings({
        lowThreshold: 35,
        mediumThreshold: 70,
        optimizationStrategy: 'balanced',
        baselineModelId: 'gpt-4o',
        fallbackModelId: 'gemini-2-0-flash',
        preferredProvider: 'all',
        maxCostPerRequest: 0.05,
      });
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to reset defaults');
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all request records? (This will reset telemetry)')) {
      return;
    }
    try {
      await fetch('/api/v1/history/clear', { method: 'POST' });
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    } catch (err) {
      alert('Failed to clear database history');
    }
  };

  if (loading || !settings) {
    return <div className="animate-pulse h-96 bg-slate-900 rounded-xl" />;
  }

  // Group models by provider
  const groupedModels: { [provider: string]: ModelConfig[] } = {};
  models.forEach((m) => {
    if (!groupedModels[m.provider]) groupedModels[m.provider] = [];
    groupedModels[m.provider].push(m);
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
            <Settings className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Settings & Policies</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure baseline cost benchmarking, multi-provider credentials, routing thresholds, and optimization strategy.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration updated successfully.</span>
        </div>
      )}

      {clearSuccess && (
        <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-800 text-orange-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Request audit history cleared and re-initialized.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Multi-Provider Connection Status */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Multi-Provider Live Integration Status</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Environment Managed</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            API keys are securely held server-side via environment variables. When a live key is present, calls route directly to the provider's production endpoint. In demonstration mode, high-fidelity AI simulation generates contextual responses with exact mathematical pricing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Google Gemini */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Google Gemini</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">GEMINI_API_KEY</div>
              </div>
              {settings.hasGeminiKey ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Simulation
                </span>
              )}
            </div>

            {/* Anthropic Claude */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Anthropic Claude</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">ANTHROPIC_API_KEY</div>
              </div>
              {settings.hasAnthropicKey ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Simulation / Gemini
                </span>
              )}
            </div>

            {/* Groq AI */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Groq AI (LPU™)</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">GROQ_API_KEY</div>
              </div>
              {settings.hasGroqKey ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Simulation / Gemini
                </span>
              )}
            </div>

            {/* OpenAI */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>OpenAI</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">OPENAI_API_KEY</div>
              </div>
              {settings.hasOpenAiKey ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Simulation / Gemini
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Difficulty Tier Default Models (Autopilot Defaults) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Difficulty Tier Default Models</h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
              Autopilot Routing Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Specify the default model to target for each of the 3 difficulty levels. Alternative candidates across Gemini, Claude, OpenAI, and Groq are dynamically evaluated based on your optimization strategy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
            {/* Easy Tier */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  🟢 Easy Tier Default
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Score 0-{settings.lowThreshold}</span>
              </div>
              <select
                value={settings.easyModelId || 'gemini-3.5-flash-lite'}
                onChange={(e) => setSettings({ ...settings, easyModelId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500"
              >
                {Object.entries(groupedModels).map(([prov, pModels]) => (
                  <optgroup key={prov} label={prov}>
                    {pModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.tier.toUpperCase()})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Recommended: <strong className="text-slate-300">Gemini 3.5 Flash-Lite</strong> (cost-efficient, sub-second latency).
              </p>
            </div>

            {/* Medium Tier */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  🟡 Medium Tier Default
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Score {settings.lowThreshold + 1}-{settings.mediumThreshold}</span>
              </div>
              <select
                value={settings.mediumModelId || 'claude-sonnet-5'}
                onChange={(e) => setSettings({ ...settings, mediumModelId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
              >
                {Object.entries(groupedModels).map(([prov, pModels]) => (
                  <optgroup key={prov} label={prov}>
                    {pModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.tier.toUpperCase()})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Recommended: <strong className="text-slate-300">Claude Sonnet 5</strong> (nuanced reasoning, benchmark coding).
              </p>
            </div>

            {/* Hard Tier */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-red-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  🔴 Hard Tier Default
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Score {settings.mediumThreshold + 1}-100</span>
              </div>
              <select
                value={settings.hardModelId || 'gpt-5.6-sol'}
                onChange={(e) => setSettings({ ...settings, hardModelId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white font-mono text-xs focus:ring-1 focus:ring-red-500"
              >
                {Object.entries(groupedModels).map(([prov, pModels]) => (
                  <optgroup key={prov} label={prov}>
                    {pModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.tier.toUpperCase()})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Recommended: <strong className="text-slate-300">GPT-5.6 Sol</strong> (flagship reasoning, architecture).
              </p>
            </div>
          </div>
        </div>

        {/* Local VS Code Setup Guide */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Running Locally in VS Code</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Local Dev Guide</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            To run this app in VS Code with your own live API keys, create a <code className="text-orange-300 bg-slate-950 px-1 py-0.5 rounded font-mono">.env</code> file in the project root:
          </p>
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-emerald-400 font-mono overflow-x-auto select-all leading-relaxed">
{`# Add your keys in .env
GEMINI_API_KEY="your-google-gemini-key"
ANTHROPIC_API_KEY="your-anthropic-key"
OPENAI_API_KEY="your-openai-key"
GROQ_API_KEY="your-groq-key"

# Defaults for the 3 difficulty levels
EASY_MODEL="gemini-3.5-flash-lite"
MEDIUM_MODEL="claude-sonnet-5"
HARD_MODEL="gpt-5.6-sol"

DEMO_MODE="false"`}
          </pre>
          <p className="text-[11px] text-slate-400">
            Start backend & frontend with <code className="text-slate-200 font-mono">npm install && npm run dev</code>. The server automatically loads the <code className="text-slate-200 font-mono">.env</code> file.
          </p>
        </div>

        {/* Global Routing Preferences */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Default Routing Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Preferred LLM Provider</label>
              <select
                value={settings.preferredProvider || 'all'}
                onChange={(e) => setSettings({ ...settings, preferredProvider: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              >
                <option value="all">All Providers (Optimal Cost & Quality)</option>
                <option value="Google Gemini">Google Gemini Only</option>
                <option value="Anthropic Claude">Anthropic Claude Only</option>
                <option value="Groq AI">Groq AI Only (LPU)</option>
                <option value="OpenAI">OpenAI Only</option>
              </select>
              <span className="text-[10px] text-slate-500 block">
                Restrict automated routing to a single vendor or route universally across all 4.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Optimization Strategy</label>
              <select
                value={settings.optimizationStrategy || 'balanced'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    optimizationStrategy: e.target.value as any,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              >
                <option value="balanced">Balanced (Optimal Latency, Quality, Cost)</option>
                <option value="cost">Aggressive Cost Saver (Prioritize lowest $/token)</option>
                <option value="quality">Frontier Quality (Prioritize capability score)</option>
                <option value="latency">Low Latency (Prioritize sub-second speed)</option>
              </select>
              <span className="text-[10px] text-slate-500 block">
                Algorithm tuning for trade-off evaluation.
              </span>
            </div>
          </div>
        </div>

        {/* Routing Thresholds */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Complexity Score Boundaries</h3>
          <p className="text-xs text-slate-400">
            Define the score bands that separate Low, Medium, and High complexity queries:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">
                Low Complexity Ceiling (0 to X)
              </label>
              <input
                type="number"
                min="10"
                max="50"
                value={settings.lowThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, lowThreshold: parseInt(e.target.value, 10) || 35 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500 block">Default: 35</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">
                Medium Complexity Ceiling (X+1 to Y)
              </label>
              <input
                type="number"
                min="51"
                max="90"
                value={settings.mediumThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, mediumThreshold: parseInt(e.target.value, 10) || 70 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500 block">Default: 70</span>
            </div>
          </div>
        </div>

        {/* Model Baseline & Fallback Assignment */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Baseline Benchmark & Fallback</h3>
          <p className="text-xs text-slate-400">
            Select the model used to calculate cost savings against (baseline), and the fail-safe model:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">
                Baseline Model (Unrouted Comparison Standard)
              </label>
              <select
                value={settings.baselineModelId}
                onChange={(e) => setSettings({ ...settings, baselineModelId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
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
              <span className="text-[10px] text-slate-500 block">
                Calculates "What would this cost without Autopilot?"
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Fallback / Degraded Routing Model</label>
              <select
                value={settings.fallbackModelId}
                onChange={(e) => setSettings({ ...settings, fallbackModelId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
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
              <span className="text-[10px] text-slate-500 block">
                Target if primary candidate fails or experiences outage
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs text-slate-300 font-medium block mb-1.5">
              Max Allowable Cost per Single Request ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="1.00"
              value={settings.maxCostPerRequest}
              onChange={(e) =>
                setSettings({ ...settings, maxCostPerRequest: parseFloat(e.target.value) || 0.05 })
              }
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-400 text-xs font-semibold border border-red-900/40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History DB</span>
            </button>
          </div>

          <button
            type="submit"
            id="save-all-settings-btn"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
