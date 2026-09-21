import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { processRoute } from './server/router.js';
import { analyzeComplexity } from './server/complexity.js';
import { getProviderForModel } from './server/providers.js';
import { ModelConfig } from './src/types/index.js';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes First
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'LLM Cost Autopilot Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      mode: db.getSettings().mode,
    });
  });

  // Fast analyze endpoint (for instant UI feedback)
  app.post('/api/v1/analyze', (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt string is required' });
        return;
      }
      const settings = db.getSettings();
      const analysis = analyzeComplexity(prompt, settings.lowThreshold, settings.mediumThreshold);
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Analysis failed' });
    }
  });

  // Main Route endpoint
  app.post('/api/v1/route', async (req, res) => {
    try {
      const { prompt, manualModelId, forceMode, preferredProvider } = req.body;
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({ error: 'Prompt must be a non-empty string.' });
        return;
      }

      const result = await processRoute({
        prompt: prompt.trim(),
        manualModelId,
        forceMode,
        preferredProvider,
      });

      res.json(result);
    } catch (err: any) {
      console.error('Routing execution error:', err);
      res.status(500).json({
        error: 'Failed to execute routing pipeline',
        details: err.message || 'Internal error',
      });
    }
  });

  // Chat compatibility endpoint
  app.post('/api/v1/chat', async (req, res) => {
    try {
      const { message, modelId } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }
      const result = await processRoute({
        prompt: message,
        manualModelId: modelId,
      });
      res.json({
        response: result.response,
        model: result.decision.selectedModel.name,
        cost: result.decision.actualCost,
        savings: result.decision.savingsPercentage,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cross-Model Provider & Tier Comparison endpoint: answers prompt across providers/models
  app.post('/api/v1/compare', async (req, res) => {
    try {
      const { prompt, forceMode, modelIds, compareMode, tier } = req.body;
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({ error: 'Prompt must be a non-empty string.' });
        return;
      }

      const allModels = db.getModels().filter((m) => m.enabled);

      // Select target models for comparison
      let targetModels: ModelConfig[] = allModels;

      if (Array.isArray(modelIds) && modelIds.length > 0) {
        targetModels = allModels.filter((m) => modelIds.includes(m.id));
      } else if (tier) {
        targetModels = allModels.filter((m) => m.tier === tier);
      } else if (compareMode === 'tiers') {
        // One model from each tier
        const fast = allModels.find((m) => m.tier === 'fast') || allModels[0];
        const balanced = allModels.find((m) => m.tier === 'balanced') || allModels[1];
        const premium = allModels.find((m) => m.tier === 'premium') || allModels[2];
        targetModels = [fast, balanced, premium].filter(Boolean);
      } else {
        // Default: Compare across all 4 major providers: Google Gemini, Anthropic Claude, Groq AI, OpenAI!
        const representativeIds = ['gemini-2-0-flash', 'claude-3-5-sonnet', 'llama-3-3-70b-versatile', 'gpt-4o'];
        const chosen = representativeIds
          .map((id) => allModels.find((m) => m.id === id))
          .filter(Boolean) as ModelConfig[];

        if (chosen.length >= 3) {
          targetModels = chosen;
        } else {
          // Fallback if custom IDs
          const providers = ['Google Gemini', 'Anthropic Claude', 'Groq AI', 'OpenAI'];
          const picked: ModelConfig[] = [];
          for (const p of providers) {
            const match = allModels.find((m) => m.provider.toLowerCase().includes(p.toLowerCase()));
            if (match) picked.push(match);
          }
          targetModels = picked.length > 0 ? picked : allModels.slice(0, 4);
        }
      }

      // Run optimal routing decision
      const optimalResult = await processRoute({
        prompt: prompt.trim(),
        forceMode,
      });

      // Answer prompt for each target model concurrently with slight stagger to avoid burst rate limits
      const comparisons = await Promise.all(
        targetModels.map(async (model, index) => {
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, index * 100));
          }
          try {
            const provider = getProviderForModel(model, forceMode);
            const gen = await provider.generate(prompt.trim(), model);
            const inputCost = (gen.inputTokens / 1_000_000) * model.inputCostPer1M;
            const outputCost = (gen.outputTokens / 1_000_000) * model.outputCostPer1M;
            const totalCost = Number((inputCost + outputCost).toFixed(6));
            return {
              modelId: model.id,
              modelName: model.name,
              provider: model.provider,
              tier: model.tier,
              response: gen.response,
              inputTokens: gen.inputTokens,
              outputTokens: gen.outputTokens,
              totalTokens: gen.inputTokens + gen.outputTokens,
              latency: gen.latency,
              cost: totalCost,
              isOptimal: optimalResult.decision.selectedModel.id === model.id,
              providerSource: gen.providerSource,
            };
          } catch (modelErr: any) {
            console.warn(`[Compare] Error on model ${model.id}:`, modelErr?.message);
            return {
              modelId: model.id,
              modelName: model.name,
              provider: model.provider,
              tier: model.tier,
              response: 'Response generation temporarily unavailable for this model.',
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
              latency: 0.1,
              cost: 0,
              isOptimal: false,
              providerSource: 'simulation' as const,
            };
          }
        })
      );

      res.json({
        prompt: prompt.trim(),
        optimalModelId: optimalResult.decision.selectedModel.id,
        optimalModelName: optimalResult.decision.selectedModel.name,
        complexity: optimalResult.decision.complexity,
        complexityScore: optimalResult.decision.complexityScore,
        comparisons,
      });
    } catch (err: any) {
      console.error('Compare execution error:', err);
      res.status(500).json({ error: err.message || 'Failed to compare models' });
    }
  });

  // Models Management
  app.get('/api/v1/models', (_req, res) => {
    res.json(db.getModels());
  });

  app.post('/api/v1/models', (req, res) => {
    try {
      const model = req.body;
      if (!model.id || !model.name || !model.tier) {
        res.status(400).json({ error: 'Missing required model parameters (id, name, tier)' });
        return;
      }
      const created = db.addModel(model);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/v1/models/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.updateModel(id, req.body);
      if (!updated) {
        res.status(404).json({ error: `Model with ID ${id} not found` });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Analytics
  app.get('/api/v1/analytics', (req, res) => {
    try {
      const hours = req.query.hours ? Number(req.query.hours) : undefined;
      const analytics = db.getAnalytics(hours);
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // History with filtering & pagination
  app.get('/api/v1/history', (req, res) => {
    try {
      const { q, complexity, model, page = '1', limit = '20' } = req.query;
      let requests = db.getRequests(500);

      if (typeof q === 'string' && q.trim()) {
        const term = q.toLowerCase().trim();
        requests = requests.filter(
          (r) =>
            r.prompt.toLowerCase().includes(term) ||
            r.response.toLowerCase().includes(term) ||
            r.id.toLowerCase().includes(term)
        );
      }

      if (typeof complexity === 'string' && complexity) {
        requests = requests.filter((r) => r.complexity === complexity);
      }

      if (typeof model === 'string' && model) {
        requests = requests.filter(
          (r) => r.selectedModelId === model || r.selectedModelName.includes(model)
        );
      }

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.max(1, parseInt(limit as string, 10));
      const total = requests.length;
      const paginated = requests.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      res.json({
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        data: paginated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v1/history/:id', (req, res) => {
    try {
      const { id } = req.params;
      const record = db.getRequestById(id);
      if (!record) {
        res.status(404).json({ error: `Request with ID ${id} not found` });
        return;
      }
      res.json(record);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings
  app.get('/api/v1/settings', (_req, res) => {
    res.json(db.getSettings());
  });

  app.patch('/api/v1/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed Reset
  app.post('/api/v1/seed/reset', (_req, res) => {
    db.resetSeed();
    res.json({ message: 'Seed data restored successfully', analytics: db.getAnalytics() });
  });

  // Vite Middleware / Static fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/node_modules/**', '**/.git/**', '**/data/**'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LLM Cost Autopilot] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
