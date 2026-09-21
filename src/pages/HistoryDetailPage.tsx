import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Cpu,
  Layers,
  Copy,
  Check,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import { api } from '../services/api.js';
import { RequestRecord } from '../types/index.js';
import { formatCurrency, formatLatency } from '../lib/utils.js';

export function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<RequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getHistoryDetail(id)
      .then(setRecord)
      .catch((err) => setError(err.message || 'Record not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyResponse = () => {
    if (!record) return;
    navigator.clipboard.writeText(record.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReRun = () => {
    if (!record) return;
    navigate('/playground', { state: { prompt: record.prompt, autoSubmit: true } });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4" />
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl" />
        <div className="h-60 bg-slate-900 border border-slate-800 rounded-xl" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400">Request with ID "{id}" was not located in database storage.</p>
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Request History</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Request History</span>
        </Link>

        <button
          onClick={handleReRun}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Re-run in Playground</span>
        </button>
      </div>

      {/* Header Info Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Request Record</div>
            <h1 className="text-xl font-bold text-white font-mono">{record.id}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                record.complexity === 'LOW'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : record.complexity === 'MEDIUM'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              }`}
            >
              Complexity: {record.complexity} ({record.complexityScore}/100)
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono uppercase">
              {record.mode} Mode
            </span>
          </div>
        </div>

        {/* Prompt section */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Original Input Prompt
          </span>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans">
            {record.prompt}
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Actual Cost</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              ${record.actualCost.toFixed(5)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{record.totalTokens} total tokens</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Baseline Cost</div>
            <div className="text-base font-bold font-mono text-slate-400 mt-0.5">
              ${record.baselineCost.toFixed(5)}
            </div>
            <div className="text-[10px] text-slate-400">Without Autopilot</div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
            <div className="text-[10px] text-emerald-400 uppercase font-mono">Cost Saved</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              ${record.costSaved.toFixed(5)}
            </div>
            <div className="text-[10px] text-emerald-400/80">{record.savingsPercentage}% savings</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Inference Latency</div>
            <div className="text-base font-bold font-mono text-purple-400 mt-0.5">
              {formatLatency(record.latency)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{new Date(record.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Model Selection & Rationale */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Model Selection & Rationale</h3>
          <span className="text-xs font-mono text-orange-400">{record.selectedModelName}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
          {record.reason}
        </p>

        {record.signals?.detectedSignals && record.signals.detectedSignals.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block mb-1.5">Detected Classifier Signals:</span>
            <div className="flex flex-wrap gap-1.5">
              {record.signals.detectedSignals.map((sig, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700 font-mono"
                >
                  ✓ {sig}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alternatives Table */}
      {record.alternatives && record.alternatives.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white">Alternative Models Evaluated</h4>
            <p className="text-xs text-slate-400">Decision matrix considered during prompt intake</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Model</th>
                  <th className="py-2.5 px-4">Capability</th>
                  <th className="py-2.5 px-4">Est. Cost</th>
                  <th className="py-2.5 px-4">Savings vs Baseline</th>
                  <th className="py-2.5 px-4">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {record.alternatives.map((alt) => (
                  <tr
                    key={alt.modelId}
                    className={alt.isWinner ? 'bg-orange-500/10' : 'hover:bg-slate-800/30'}
                  >
                    <td className="py-2.5 px-4 font-medium text-white flex items-center gap-1.5">
                      {alt.isWinner && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                      <span>{alt.modelName}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">{alt.capabilityScore}/100</td>
                    <td className="py-2.5 px-4 font-mono text-white">${alt.estimatedCost.toFixed(5)}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400">{alt.savingsPercentage}%</td>
                    <td className="py-2.5 px-4">
                      {alt.isWinner ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500 text-white font-mono">
                          Selected
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{alt.rejectReason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated Response */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Inference Response Output
          </span>
          <button
            onClick={handleCopyResponse}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-5 text-sm text-slate-200 leading-relaxed font-sans markdown-content">
          <Markdown>{record.response}</Markdown>
        </div>
      </div>
    </div>
  );
}
