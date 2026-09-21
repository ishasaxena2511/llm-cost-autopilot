import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Edit2,
  Check,
  X,
  Plus,
  RefreshCw,
  Power,
  Shield,
  DollarSign,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ModelConfig } from '../types/index.js';
import { formatCurrency, formatLatency } from '../lib/utils.js';

export function ModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await api.getModels();
      setModels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleToggleEnabled = async (model: ModelConfig) => {
    try {
      const updated = await api.updateModel(model.id, { enabled: !model.enabled });
      setModels((prev) => prev.map((m) => (m.id === model.id ? updated : m)));
    } catch (err) {
      alert('Failed to update model status');
    }
  };

  const handleSaveModelEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    try {
      const updated = await api.updateModel(editingModel.id, {
        inputCostPer1M: Number(editingModel.inputCostPer1M),
        outputCostPer1M: Number(editingModel.outputCostPer1M),
        typicalLatency: Number(editingModel.typicalLatency),
        capabilityScore: Number(editingModel.capabilityScore),
        description: editingModel.description,
      });

      setModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSaveSuccess(updated.id);
      setTimeout(() => setSaveSuccess(null), 2500);
      setEditingModel(null);
    } catch (err) {
      alert('Failed to save model updates');
    }
  };

  const getProviderBadge = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes('gemini') || p.includes('google')) {
      return {
        label: 'Google Gemini',
        style: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      };
    }
    if (p.includes('claude') || p.includes('anthropic')) {
      return {
        label: 'Anthropic Claude',
        style: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      };
    }
    if (p.includes('groq') || p.includes('llama') || p.includes('deepseek')) {
      return {
        label: 'Groq AI',
        style: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      };
    }
    if (p.includes('openai') || p.includes('gpt') || p.includes('o1')) {
      return {
        label: 'OpenAI',
        style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      };
    }
    return {
      label: provider,
      style: 'bg-slate-800 text-slate-300 border-slate-700',
    };
  };

  const filteredModels = models.filter((m) => {
    if (selectedProvider !== 'all') {
      if (!m.provider.toLowerCase().includes(selectedProvider.toLowerCase())) {
        return false;
      }
    }
    if (selectedTier !== 'all' && m.tier !== selectedTier) {
      return false;
    }
    return true;
  });

  const providers = [
    { id: 'all', name: 'All Providers', count: models.length },
    {
      id: 'Google Gemini',
      name: 'Google Gemini',
      count: models.filter((m) => m.provider.includes('Gemini')).length,
    },
    {
      id: 'Anthropic Claude',
      name: 'Anthropic Claude',
      count: models.filter((m) => m.provider.includes('Claude')).length,
    },
    {
      id: 'Groq AI',
      name: 'Groq AI',
      count: models.filter((m) => m.provider.includes('Groq')).length,
    },
    {
      id: 'OpenAI',
      name: 'OpenAI',
      count: models.filter((m) => m.provider.includes('OpenAI')).length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Model Registry & Multi-Provider Catalog</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare capabilities, latency, and token pricing across Google Gemini, Anthropic Claude, Groq AI, and OpenAI models.
          </p>
        </div>

        <button
          onClick={fetchModels}
          className="self-start sm:self-auto p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          title="Reload models from database"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Model pricing and parameters updated successfully!</span>
        </div>
      )}

      {/* Provider Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Provider:
          </span>
          {providers.map((p) => {
            const active = selectedProvider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
                }`}
              >
                <span>{p.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-orange-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {p.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Tier:</span>
          {['all', 'fast', 'balanced', 'premium'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                selectedTier === tier
                  ? 'bg-slate-700 text-white font-bold border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((m) => {
          const tierBadge =
            m.tier === 'fast'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : m.tier === 'balanced'
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

          const provBadge = getProviderBadge(m.provider);

          return (
            <div
              key={m.id}
              className={`p-5 rounded-xl bg-slate-900 border transition-all flex flex-col justify-between ${
                m.enabled ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${tierBadge}`}
                    >
                      {m.tier} tier
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${provBadge.style}`}
                    >
                      {provBadge.label}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleEnabled(m)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      m.enabled
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{m.enabled ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{m.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">{m.id}</div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed min-h-[44px]">
                  {m.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Capability Rating:</span>
                    <span className="font-mono text-white font-semibold">
                      {m.capabilityScore} / 100
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Input Cost / 1M:</span>
                    <span className="font-mono text-white font-semibold">
                      ${m.inputCostPer1M.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Output Cost / 1M:</span>
                    <span className="font-mono text-white font-semibold">
                      ${m.outputCostPer1M.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Typical Latency:</span>
                    <span className="font-mono text-purple-400 font-semibold">
                      {formatLatency(m.typicalLatency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Context Window:</span>
                    <span className="font-mono text-slate-300">
                      {(m.contextWindow / 1000).toLocaleString()}k tokens
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex justify-end">
                <button
                  id={`edit-model-${m.id}`}
                  onClick={() => setEditingModel(m)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-orange-400" />
                  <span>Edit Parameters</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Model Modal / Drawer */}
      {editingModel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Model: {editingModel.name}</h3>
                <p className="text-xs text-slate-400">
                  {editingModel.provider} · {editingModel.tier.toUpperCase()} Tier
                </p>
              </div>
              <button
                onClick={() => setEditingModel(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModelEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={editingModel.description}
                  onChange={(e) =>
                    setEditingModel({ ...editingModel, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Input Cost ($ / 1M)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingModel.inputCostPer1M}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        inputCostPer1M: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Output Cost ($ / 1M)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingModel.outputCostPer1M}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        outputCostPer1M: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Typical Latency (s)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingModel.typicalLatency}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        typicalLatency: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Capability Score (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingModel.capabilityScore}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        capabilityScore: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold cursor-pointer shadow-md"
                >
                  Save Model Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
