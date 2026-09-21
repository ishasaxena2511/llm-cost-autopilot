import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitFork,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Zap,
  Cpu,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Play,
} from 'lucide-react';
import { api } from '../services/api.js';
import { SystemSettings } from '../types/index.js';

export function RoutingEnginePage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [testPrompt, setTestPrompt] = useState('Design a distributed caching architecture with Redis and consistent hashing.');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!testPrompt.trim()) {
      setAnalysisResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: testPrompt }),
        });
        if (res.ok) {
          const data = await res.json();
          setAnalysisResult(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [testPrompt, settings?.lowThreshold, settings?.mediumThreshold]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateSettings({
        lowThreshold: Number(settings.lowThreshold),
        mediumThreshold: Number(settings.mediumThreshold),
        optimizationStrategy: settings.optimizationStrategy,
        maxCostPerRequest: Number(settings.maxCostPerRequest),
      });
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save routing settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
            <GitFork className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Routing Engine Configuration</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Fine-tune the rule-based complexity classifier, signal weights, and multi-tier routing policies.
        </p>
      </div>

      {/* Interactive Threshold & Strategy Config Card */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Complexity Classification Thresholds</h3>
            <p className="text-xs text-slate-400">
              Normalized scoring 0–100 mapping prompts into Fast, Balanced, or Premium tiers
            </p>
          </div>
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved successfully</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low to Medium Threshold */}
          <div className="space-y-2 p-4 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-400">LOW Threshold Ceiling</span>
              <span className="font-mono text-white font-bold bg-slate-800 px-2 py-0.5 rounded">
                0 – {settings?.lowThreshold || 35}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              value={settings?.lowThreshold || 35}
              onChange={(e) =>
                setSettings(settings ? { ...settings, lowThreshold: Number(e.target.value) } : null)
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Prompts scoring below this point route strictly to the fast low-cost model.
            </p>
          </div>

          {/* Medium to High Threshold */}
          <div className="space-y-2 p-4 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-amber-400">MEDIUM Threshold Ceiling</span>
              <span className="font-mono text-white font-bold bg-slate-800 px-2 py-0.5 rounded">
                {(settings?.lowThreshold || 35) + 1} – {settings?.mediumThreshold || 70}
              </span>
            </div>
            <input
              type="range"
              min="51"
              max="85"
              value={settings?.mediumThreshold || 70}
              onChange={(e) =>
                setSettings(
                  settings ? { ...settings, mediumThreshold: Number(e.target.value) } : null
                )
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Prompts scoring above this point route to the premium frontier model.
            </p>
          </div>
        </div>

        {/* Optimization Policy Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white">Preferred Optimization Policy</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'balanced', label: 'Balanced (Default)', desc: 'Best cost/intelligence ratio' },
              { id: 'cost', label: 'Aggressive Cost', desc: 'Prioritizes cheaper models' },
              { id: 'quality', label: 'Maximum Quality', desc: 'Bias towards frontier reasoning' },
              { id: 'latency', label: 'Lowest Latency', desc: 'Optimizes for response speed' },
            ].map((strat) => (
              <button
                key={strat.id}
                onClick={() =>
                  setSettings(
                    settings
                      ? { ...settings, optimizationStrategy: strat.id as any }
                      : null
                  )
                }
                className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                  settings?.optimizationStrategy === strat.id
                    ? 'bg-orange-500/15 border-orange-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold capitalize">{strat.label}</div>
                <div className="text-[10px] text-slate-400 mt-1">{strat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            id="save-routing-settings-btn"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Live Classifier Benchmark & Sandbox */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Signal & Complexity Tester</h3>
            <p className="text-xs text-slate-400">
              Type or paste any query to see instantaneous signal parsing and complexity tier mapping.
            </p>
          </div>
        </div>

        <textarea
          rows={3}
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
          placeholder="Test a query for instant complexity evaluation..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
        />

        {analysisResult && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Classification:</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                    analysisResult.level === 'LOW'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : analysisResult.level === 'MEDIUM'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  }`}
                >
                  {analysisResult.level} ({analysisResult.score}/100)
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {analysisResult.signals.wordCount} words · {analysisResult.signals.charCount} chars · {analysisResult.signals.questionCount} questions
              </div>
            </div>

            {analysisResult.signals.detectedSignals.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Triggered Signals:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.signals.detectedSignals.map((sig: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700 font-mono"
                    >
                      ✓ {sig}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Recommended tier: <span className="text-white font-bold">{analysisResult.level}</span>
              </span>
              <button
                onClick={() => navigate('/playground', { state: { prompt: testPrompt, autoSubmit: true } })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run & Answer Prompt in Playground</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Weights Matrix */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Classification Signal Weights</h3>
        <p className="text-xs text-slate-400">
          The rule engine uses the following weighted heuristics to evaluate prompt complexity:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Code & Syntax Detection</span>
              <span className="text-orange-400 font-mono">+25 pts</span>
            </div>
            <p className="text-[11px] text-slate-400">Backticks, function declarations, imports, SQL syntax</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Mathematical Reasoning</span>
              <span className="text-orange-400 font-mono">+20 pts</span>
            </div>
            <p className="text-[11px] text-slate-400">Derivatives, formulas, gradients, matrices, probabilities</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Deep Reasoning Keywords</span>
              <span className="text-orange-400 font-mono">+20 pts</span>
            </div>
            <p className="text-[11px] text-slate-400">Trade-offs, distributed architecture, compare and contrast</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Length & Context Volume</span>
              <span className="text-orange-400 font-mono">+25 pts</span>
            </div>
            <p className="text-[11px] text-slate-400">Word count scaling from 50 to 150+ tokens</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Multi-Step Procedural Logic</span>
              <span className="text-orange-400 font-mono">+15 pts</span>
            </div>
            <p className="text-[11px] text-slate-400">Numbered steps, workflows, pipelines, lifecycle phases</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Strict Structured Output</span>
              <span className="text-orange-400 font-mono">+15 pts</span>
            </div>
            <p className="text-[11px] text-slate-400">JSON schema requirements, markdown tables, CSV formats</p>
          </div>
        </div>
      </div>
    </div>
  );
}
