import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  Layers,
  Zap,
  TrendingDown,
  Copy,
  Check,
  ChevronRight,
  Terminal,
} from 'lucide-react';

export function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlExample = `curl -X POST https://your-domain.com/api/v1/route \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "What are the trade-offs between Redis and Memcached?"
  }'`;

  const pythonExample = `import requests

response = requests.post(
    "https://your-domain.com/api/v1/route",
    json={"prompt": "Explain gradient descent in machine learning."}
)

data = response.json()
print("Routed Model:", data["decision"]["selectedModel"]["name"])
print("Actual Cost:", data["decision"]["actualCost"])
print("Cost Saved:", data["decision"]["costSaved"])
print("Response:", data["response"])`;

  const tsExample = `import axios from 'axios';

async function queryAutopilot(prompt: string) {
  const res = await axios.post('https://your-domain.com/api/v1/route', {
    prompt,
  });

  const { decision, response } = res.data;
  console.log(\`Routed to \${decision.selectedModel.name} (\${decision.complexity})\`);
  console.log(\`Saved \${decision.savingsPercentage}% vs baseline\`);
  return response;
}`;

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Documentation</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Architecture, routing heuristics, cost equations, and API integration guides.
        </p>
      </div>

      {/* Section 1: What is Model Routing? */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-orange-500">01.</span>
          <span>What is Model Routing?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Modern AI applications often route 100% of user queries to expensive frontier models like GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro. However, benchmark evaluations reveal that <strong>60% to 75% of production prompts</strong> are simple lookups, formatting requests, short summaries, or basic classifications that can be answered with indistinguishable accuracy by lightweight models (such as Gemini 1.5 Flash or Claude Haiku) at <strong>1/20th of the cost</strong>.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>LLM Cost Autopilot</strong> dynamically inspects incoming prompts, measures their complexity in sub-millisecond time, and directs each request to the most cost-effective tier.
        </p>
      </section>

      {/* Section 2: Complexity Evaluation Formula */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-orange-500">02.</span>
          <span>How Prompt Complexity is Measured</span>
        </h2>
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <p className="text-xs text-slate-300">
            Complexity scores span from <strong>0 to 100</strong> and are calculated via rule-based heuristic extraction:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-orange-400">Length & Volume (0 to 25 pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Raw prompt length and token estimate. Queries under 20 words receive 0 points; prompts over 150 words get up to 25 points.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-orange-400">Code & Programming (0 or 25 pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Detection of backticks, programming language indicators, SQL statements, and syntax symbols.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-orange-400">Mathematical Reasoning (0 or 20 pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Calculus terms, equations, matrices, geometric formulas, and statistical reasoning triggers.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-orange-400">Deep Reasoning Keywords (0 or 20 pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Keywords like "trade-offs", "architectural pattern", "distributed", "evaluate pros and cons".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Model Tiers */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-orange-500">03.</span>
          <span>Model Tiers</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Fast Tier (Low)</div>
            <h3 className="text-sm font-bold text-white">Gemini 1.5 Flash</h3>
            <p className="text-slate-400 text-[11px]">
              Sub-second response latency. Ideal for entity extraction, simple FAQ responses, translations, and short conversions.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold pt-1">
              $0.075 / 1M input · $0.30 / 1M output
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/30 space-y-2">
            <div className="text-[10px] font-mono font-bold text-orange-400 uppercase">Balanced Tier (Medium)</div>
            <h3 className="text-sm font-bold text-white">Gemini 1.5 Flash (Thoughtful)</h3>
            <p className="text-slate-400 text-[11px]">
              Excellent general-purpose workhorse for medium synthesis, document analysis, and standard coding tasks.
            </p>
            <div className="text-[11px] font-mono text-orange-400 font-semibold pt-1">
              $0.35 / 1M input · $1.40 / 1M output
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2">
            <div className="text-[10px] font-mono font-bold text-purple-400 uppercase">Premium Tier (High)</div>
            <h3 className="text-sm font-bold text-white">Gemini 1.5 Pro / GPT-4o</h3>
            <p className="text-slate-400 text-[11px]">
              Maximum reasoning capability, complex multi-hop algorithmic problems, and large codebase refactoring.
            </p>
            <div className="text-[11px] font-mono text-purple-400 font-semibold pt-1">
              $1.25 / 1M input · $5.00 / 1M output
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Cost Formula */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-orange-500">04.</span>
          <span>Cost Calculation Mathematical Formula</span>
        </h2>
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-orange-300 text-xs overflow-x-auto">
            Actual Cost = (Input Tokens × Input Price / 1,000,000) + (Output Tokens × Output Price / 1,000,000)
          </div>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-slate-300 text-xs overflow-x-auto">
            Baseline Cost = (Input Tokens × Baseline Input Price / 1,000,000) + (Output Tokens × Baseline Output Price / 1,000,000)
          </div>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-emerald-400 text-xs overflow-x-auto">
            Net Savings = Baseline Cost - Actual Cost | Savings % = (Net Savings / Baseline Cost) × 100
          </div>
        </div>
      </section>

      {/* Section 5: API Integration */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-orange-500">05.</span>
          <span>API Integration Guide</span>
        </h2>

        {/* cURL */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
          <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono font-semibold text-slate-300">cURL Request</span>
            <button
              onClick={() => copySnippet('curl', curlExample)}
              className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedCode === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'curl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 font-mono text-slate-300 overflow-x-auto">{curlExample}</pre>
        </div>

        {/* Python */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
          <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono font-semibold text-slate-300">Python (requests)</span>
            <button
              onClick={() => copySnippet('python', pythonExample)}
              className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedCode === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'python' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 font-mono text-slate-300 overflow-x-auto">{pythonExample}</pre>
        </div>

        {/* TypeScript */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
          <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono font-semibold text-slate-300">TypeScript / Node.js</span>
            <button
              onClick={() => copySnippet('ts', tsExample)}
              className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
            >
              {copiedCode === 'ts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'ts' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 font-mono text-slate-300 overflow-x-auto">{tsExample}</pre>
        </div>
      </section>
    </div>
  );
}
