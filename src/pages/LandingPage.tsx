import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  TrendingDown,
  Gauge,
  Sliders,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Scale,
  Clock,
  DollarSign,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const handleRunSamplePrompt = (prompt: string) => {
    navigate('/playground', { state: { prompt, autoSubmit: true } });
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-b from-[#0c0c0f] via-[#08080a] to-[#040405] p-8 sm:p-12 lg:p-16 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Inference Orchestration</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          LLM COST <span className="text-orange-500 font-mono tracking-normal">AUTOPILOT</span>
        </h1>

        <h2 className="text-base sm:text-lg font-medium text-orange-400 mt-2 font-mono">
          Intelligent AI Model Routing for Cost Optimization
        </h2>

        <p className="mt-4 text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Automatically route every prompt to the right model based on complexity, cost, latency, and quality. Stop burning budget sending simple queries to frontier models.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/playground"
            id="landing-hero-open-autopilot"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-orange-600 hover:bg-orange-500 text-black font-bold font-mono text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.02]"
          >
            <span>Open Autopilot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            id="landing-hero-view-dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#121216] hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
          >
            <BarChart3 className="w-4 h-4 text-orange-400" />
            <span>View Dashboard</span>
          </Link>
        </div>

        {/* Interactive Try-it-now pill presets */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 max-w-3xl mx-auto">
          <div className="text-xs text-slate-400 mb-3 font-medium">Try a benchmark prompt:</div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <button
              onClick={() => handleRunSamplePrompt('What is the capital of France?')}
              className="px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-orange-500/50 transition-colors cursor-pointer text-left"
            >
              <span className="text-emerald-400 font-mono mr-1">LOW:</span> "What is the capital of France?"
            </button>
            <button
              onClick={() => handleRunSamplePrompt('Explain how gradient descent works with an example and pseudocode.')}
              className="px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-orange-500/50 transition-colors cursor-pointer text-left"
            >
              <span className="text-amber-400 font-mono mr-1">MED:</span> "Explain gradient descent with pseudocode"
            </button>
            <button
              onClick={() => handleRunSamplePrompt('Design a scalable distributed architecture for a real-time financial fraud detection system and explain the trade-offs.')}
              className="px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-orange-500/50 transition-colors cursor-pointer text-left"
            >
              <span className="text-orange-400 font-mono mr-1">HIGH:</span> "Distributed architecture for fraud detection"
            </button>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Flow Diagram */}
      <section className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-white tracking-tight">The Autopilot Pipeline</h3>
          <p className="text-xs text-slate-400">Zero-latency synchronous routing decision flow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: '01',
              title: 'User Prompt',
              desc: 'Raw user request ingested with zero schema lock-in',
              badge: 'Input',
            },
            {
              step: '02',
              title: 'Complexity Analysis',
              desc: 'Tokens, reasoning keywords, syntax, and math scoring',
              badge: 'Analyzer',
            },
            {
              step: '03',
              title: 'Model Selection',
              desc: 'Optimal match across Fast, Balanced, and Premium tiers',
              badge: 'Router',
            },
            {
              step: '04',
              title: 'LLM Response',
              desc: 'Sub-second inference via best provider endpoint',
              badge: 'Inference',
            },
            {
              step: '05',
              title: 'Cost Optimization',
              desc: 'Calculated savings logged with real-time audit trail',
              badge: 'Metrics',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-orange-400">{item.step}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why LLM Cost Optimization */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Why LLM Cost Optimization?</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Over 65% of enterprise LLM queries do not require a $10/1M token frontier model.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Rising LLM API Costs</h4>
            <p className="text-xs text-slate-400">
              As product adoption scales from thousands to millions of tokens daily, monthly API bills escalate exponentially.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Model Over-Provisioning</h4>
            <p className="text-xs text-slate-400">
              Developers default to GPT-4o or Claude 3.5 Sonnet for everything, including basic sentiment analysis and simple regex transforms.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Latency Bottlenecks</h4>
            <p className="text-xs text-slate-400">
              Frontier models often take 2 to 4 seconds to respond, degrading interactive user experiences for tasks manageable in 300ms.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Lack of Intelligent Routing</h4>
            <p className="text-xs text-slate-400">
              Static routing creates rigid trade-offs. Autopilot inspects prompts in real-time to pick the exact right model.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Cost vs Quality Balance</h4>
            <p className="text-xs text-slate-400">
              Maintain 99% task success by allocating high-capacity models solely when multi-hop logic or code generation is detected.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Auditable Analytics</h4>
            <p className="text-xs text-slate-400">
              Every request logs calculated baseline costs versus actual costs, providing transparent ROI reporting for engineering teams.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">How It Works: The 6-Stage Engine</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Built upon production-tested signal extraction and multi-objective routing rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              num: '1',
              title: 'Analyze',
              desc: 'Evaluates prompt character length, word density, question count, and structure.',
            },
            {
              num: '2',
              title: 'Classify',
              desc: 'Scores multi-step indicators, code blocks, mathematical expressions, and technical domains.',
            },
            {
              num: '3',
              title: 'Route',
              desc: 'Resolves optimal tier (Fast, Balanced, or Premium) based on threshold settings and strategy.',
            },
            {
              num: '4',
              title: 'Respond',
              desc: 'Executes inference with low jitter and captures response output token metrics.',
            },
            {
              num: '5',
              title: 'Measure',
              desc: 'Calculates exact cost per 1M tokens against baseline premium pricing.',
            },
            {
              num: '6',
              title: 'Optimize',
              desc: 'Logs request metrics to historical records and updates live ROI analytics.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold text-xs flex items-center justify-center font-mono">
                {item.num}
              </div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Model Classes */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Supported Model Classes</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure pricing, latency targets, and capability scores dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fast / Low Cost
                </span>
                <span className="text-xs text-slate-400 font-mono">~0.45s Latency</span>
              </div>
              <h4 className="text-base font-bold text-white">Gemini 1.5 Flash-8B / Llama 3.1 8B</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ideal for simple factual questions, short summaries, classification, formatting, and grammar cleanup.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Input Cost / 1M:</span>
                <span className="text-white font-mono font-semibold">$0.0375</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Output Cost / 1M:</span>
                <span className="text-white font-mono font-semibold">$0.1500</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Capability Score:</span>
                <span className="text-emerald-400 font-mono font-semibold">72 / 100</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-orange-500/40 relative flex flex-col justify-between shadow-lg shadow-orange-950/20">
            <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-orange-600 text-[10px] font-bold text-white uppercase tracking-wider">
              Recommended Default
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Balanced Tier
                </span>
                <span className="text-xs text-slate-400 font-mono">~1.15s Latency</span>
              </div>
              <h4 className="text-base font-bold text-white">Gemini 2.0 Flash / Claude 3.5 Haiku</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Exceptional coding, moderate mathematical intuition, multi-turn reasoning, and structured data generation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Input Cost / 1M:</span>
                <span className="text-white font-mono font-semibold">$0.1000</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Output Cost / 1M:</span>
                <span className="text-white font-mono font-semibold">$0.4000</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Capability Score:</span>
                <span className="text-orange-400 font-mono font-semibold">88 / 100</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Premium Frontier
                </span>
                <span className="text-xs text-slate-400 font-mono">~2.85s Latency</span>
              </div>
              <h4 className="text-base font-bold text-white">Gemini 1.5 Pro / GPT-4o</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Reserved for deep distributed systems architecture, subtle mathematical proofs, and complex repository logic.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Input Cost / 1M:</span>
                <span className="text-white font-mono font-semibold">$2.5000</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Output Cost / 1M:</span>
                <span className="text-white font-mono font-semibold">$10.0000</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Capability Score:</span>
                <span className="text-purple-400 font-mono font-semibold">97 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expected Benefits */}
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white tracking-tight mb-6 text-center">
          Measurable Operational Benefits
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-mono">40–70%</div>
            <div className="text-xs text-white font-semibold mt-1">Lower Spend</div>
            <div className="text-[11px] text-slate-400 mt-0.5">By shedding over-provisioned tokens</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">2.5×</div>
            <div className="text-xs text-white font-semibold mt-1">Faster Responses</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Through sub-500ms lightweight inference</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">100%</div>
            <div className="text-xs text-white font-semibold mt-1">Intelligent Routing</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Automated signal classification</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">Zero</div>
            <div className="text-xs text-white font-semibold mt-1">Quality Degradation</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Complex queries still get flagship models</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/playground"
            id="landing-bottom-cta"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-md transition-all"
          >
            <span>Launch Playground Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
