import React, { useState } from 'react';
import {
  Info,
  Zap,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatNumber } from '../lib/utils.js';

export function AboutPage() {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(250000);
  const [avgTokensPerReq, setAvgTokensPerReq] = useState<number>(600);

  // Without routing: assume 100% frontier model ($1.25 / 1M input, $5.00 / 1M output -> avg $2.50 / 1M tokens)
  const baselineCost = (monthlyVolume * avgTokensPerReq * 2.5) / 1000000;

  // With Autopilot: 65% Low ($0.15/1M avg), 25% Medium ($0.70/1M avg), 10% High ($2.50/1M avg)
  // Weighted avg price: 0.65*0.15 + 0.25*0.70 + 0.10*2.50 = 0.0975 + 0.175 + 0.25 = $0.5225 / 1M
  const routedCost = (monthlyVolume * avgTokensPerReq * 0.5225) / 1000000;
  const netSaved = baselineCost - routedCost;
  const savingsPct = Math.round((netSaved / baselineCost) * 100);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
            <Info className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">About LLM Cost Autopilot</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Mission, system architecture, and real-world economics of intelligent model orchestration.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Our Mission</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          AI engineering teams today face soaring inference budgets because default configurations treat every prompt identically. Sending a simple 5-word date conversion to a $5/million token model is the economic equivalent of taking a helicopter to cross the street.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>LLM Cost Autopilot</strong> exists to make enterprise AI cost-sustainable. By introducing a zero-latency heuristic classification layer, every request is automatically routed to the right model size without sacrificing quality or user experience.
        </p>
      </div>

      {/* Interactive ROI Calculator */}
      <div className="p-6 rounded-xl bg-slate-900 border border-orange-500/30 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
              Interactive ROI Calculator
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Simulate Your Organization's Monthly Savings
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Adjust your monthly prompt volume and token size to project cost reduction with Autopilot:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Monthly Requests:</span>
              <span className="font-mono text-orange-400 font-bold">{formatNumber(monthlyVolume)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="10000"
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Average Tokens / Request:</span>
              <span className="font-mono text-orange-400 font-bold">{avgTokensPerReq} tokens</span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={avgTokensPerReq}
              onChange={(e) => setAvgTokensPerReq(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Projected ROI outcome */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-500">Unrouted Spend (100% Frontier)</span>
            <div className="text-xl font-bold font-mono text-slate-400 mt-1">
              {formatCurrency(baselineCost)}
            </div>
            <span className="text-[10px] text-slate-500">per month</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-orange-500/20">
            <span className="text-[10px] uppercase font-mono text-orange-400">Autopilot Routed Spend</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {formatCurrency(routedCost)}
            </div>
            <span className="text-[10px] text-slate-400">multi-tier optimized</span>
          </div>

          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/50">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Net Capital Preserved</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {formatCurrency(netSaved)} / mo
            </div>
            <span className="text-[10px] text-emerald-500/80 font-bold">{savingsPct}% budget reduction</span>
          </div>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">System Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-white">Sub-millisecond Classifier</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Regex and statistical token analysis runs in under 1ms with 0 API overhead before any upstream request is dispatched.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-white">Dynamic Cost Matrix</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Real-time evaluation against configurable token pricing tables and client SLA requirements.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-white">Dual-Mode Fallback</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Graceful degradation support for Live Gemini APIs or realistic offline simulation mode.
            </p>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-orange-600/20 to-slate-900 border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Ready to test intelligent model routing?</h3>
          <p className="text-xs text-slate-400 mt-0.5">Explore the live sandbox or view recent routing audit logs.</p>
        </div>
        <Link
          to="/playground"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          <span>Open Playground</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
