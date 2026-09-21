"""
LLM Cost Autopilot - FastAPI Backend Application
"""

import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.router import analyze_prompt_complexity
from app.services.cost_calculator import calculate_costs

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI(
    title="LLM Cost Autopilot API",
    description="Intelligent AI Model Routing for Cost Optimization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS = [
    {
        "id": "gemini-3.5-flash-lite",
        "provider": "Google Gemini",
        "name": "Gemini 3.5 Flash-Lite",
        "tier": "fast",
        "capabilityScore": 82,
        "inputCostPer1M": 0.075,
        "outputCostPer1M": 0.30,
        "typicalLatency": 0.28,
        "contextWindow": 1000000,
        "enabled": True,
        "recommendedComplexity": "LOW",
        "badge": "Default Easy ⭐"
    },
    {
        "id": "claude-sonnet-5",
        "provider": "Anthropic Claude",
        "name": "Claude Sonnet 5",
        "tier": "balanced",
        "capabilityScore": 98,
        "inputCostPer1M": 3.00,
        "outputCostPer1M": 15.00,
        "typicalLatency": 1.20,
        "contextWindow": 200000,
        "enabled": True,
        "recommendedComplexity": "MEDIUM",
        "badge": "Default Medium ⭐"
    },
    {
        "id": "gpt-5.6-sol",
        "provider": "OpenAI",
        "name": "GPT-5.6 Sol",
        "tier": "premium",
        "capabilityScore": 99,
        "inputCostPer1M": 12.00,
        "outputCostPer1M": 48.00,
        "typicalLatency": 2.80,
        "contextWindow": 128000,
        "enabled": True,
        "recommendedComplexity": "HIGH",
        "badge": "Default Hard ⭐"
    },
    {
        "id": "groq-gpt-oss-120b",
        "provider": "Groq AI",
        "name": "Groq GPT-OSS 120B",
        "tier": "balanced",
        "capabilityScore": 96,
        "inputCostPer1M": 0.59,
        "outputCostPer1M": 0.79,
        "typicalLatency": 0.35,
        "contextWindow": 131072,
        "enabled": True,
        "recommendedComplexity": "MEDIUM",
        "badge": "300+ T/s LPU"
    }
]

class RouteRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="The prompt to analyze and route")
    manualModelId: Optional[str] = None
    forceMode: Optional[str] = "demo"
    preferredProvider: Optional[str] = None

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LLM Cost Autopilot Engine (FastAPI)",
        "version": "1.0.0",
        "mode": "live" if os.getenv("DEMO_MODE") == "false" else "demo"
    }

@app.get("/api/v1/models")
def get_models():
    return MODELS

@app.get("/api/v1/settings")
def get_settings():
    return {
        "appName": "LLM Cost Autopilot",
        "currency": "USD",
        "mode": "live" if os.getenv("DEMO_MODE") == "false" else "demo",
        "optimizationStrategy": os.getenv("OPTIMIZATION_STRATEGY", "balanced"),
        "easyModelId": os.getenv("EASY_MODEL", "gemini-3.5-flash-lite"),
        "mediumModelId": os.getenv("MEDIUM_MODEL", "claude-sonnet-5"),
        "hardModelId": os.getenv("HARD_MODEL", "gpt-5.6-sol"),
        "hasGeminiKey": bool(os.getenv("GEMINI_API_KEY")),
        "hasOpenAiKey": bool(os.getenv("OPENAI_API_KEY")),
        "hasAnthropicKey": bool(os.getenv("ANTHROPIC_API_KEY")),
        "hasGroqKey": bool(os.getenv("GROQ_API_KEY"))
    }

@app.post("/api/v1/analyze")
def analyze_endpoint(payload: RouteRequest):
    score, level, signals = analyze_prompt_complexity(payload.prompt)
    return {
        "score": score,
        "level": level,
        "signals": signals
    }

@app.post("/api/v1/route")
def route_endpoint(payload: RouteRequest):
    score, level, signals = analyze_prompt_complexity(payload.prompt)

    # Detect active keys
    has_gemini = bool(os.getenv("GEMINI_API_KEY"))
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    has_anthropic = bool(os.getenv("ANTHROPIC_API_KEY"))
    has_groq = bool(os.getenv("GROQ_API_KEY"))

    # Determine default model based on level and available keys
    if level == "LOW":
        if has_groq and not has_gemini:
            chosen_id = "groq-gpt-oss-120b"
        elif has_openai and not has_gemini:
            chosen_id = "gpt-5.6-sol"
        else:
            chosen_id = os.getenv("EASY_MODEL", "gemini-3.5-flash-lite")
        reason = f"Prompt Quality: Basic / Routine (Score: {score}/100). Low cognitive load; routed to fast, cost-efficient model ({chosen_id})."
    elif level == "MEDIUM":
        if has_gemini and not has_anthropic:
            chosen_id = "gemini-3.5-flash-lite"
        elif has_groq and not has_anthropic:
            chosen_id = "groq-gpt-oss-120b"
        elif has_openai and not has_anthropic:
            chosen_id = "gpt-5.6-sol"
        else:
            chosen_id = os.getenv("MEDIUM_MODEL", "claude-sonnet-5")
        reason = f"Prompt Quality: Intermediate / Structured (Score: {score}/100). Multi-step structured instructions; routed to balanced reasoning model ({chosen_id})."
    else:
        if has_gemini and not has_openai:
            chosen_id = "gemini-3.5-flash-lite"
        elif has_anthropic and not has_openai:
            chosen_id = "claude-sonnet-5"
        elif has_groq and not has_openai:
            chosen_id = "groq-gpt-oss-120b"
        else:
            chosen_id = os.getenv("HARD_MODEL", "gpt-5.6-sol")
        reason = f"Prompt Quality: Advanced / Frontier Reasoning (Score: {score}/100). High domain complexity and deep logic; routed to flagship frontier model ({chosen_id})."

    if payload.manualModelId:
        chosen_id = payload.manualModelId
        reason = f"Manual override to {chosen_id} requested by user."

    model = next((m for m in MODELS if m["id"] == chosen_id), MODELS[0])

    in_tokens = max(10, int(len(payload.prompt.split()) * 1.3))
    out_tokens = 150 if level == "LOW" else 350 if level == "MEDIUM" else 650

    costs = calculate_costs(
        input_tokens=in_tokens,
        output_tokens=out_tokens,
        model_input_cost=model["inputCostPer1M"],
        model_output_cost=model["outputCostPer1M"],
        baseline_input_cost=12.0,
        baseline_output_cost=48.0
    )

    return {
        "id": f"req-{os.urandom(4).hex()}",
        "prompt": payload.prompt,
        "timestamp": "2025-01-01T00:00:00Z",
        "response": f"Direct analysis for: {payload.prompt.strip()[:100]}...\n\nAnswer successfully generated by {model['name']} ({model['provider']}).",
        "decision": {
            "selectedModel": model,
            "baselineModel": MODELS[2],
            "reason": reason,
            "complexity": {
                "score": score,
                "level": level,
                "confidence": 0.95,
                "factors": {
                    "tokenCount": in_tokens,
                    "codeBlocks": 1 if signals.get("has_code") else 0,
                    "reasoningKeywords": len(signals.get("signals", [])),
                    "mathFormulas": 1 if signals.get("has_math") else 0,
                    "detectedLanguages": ["English"]
                },
                "signals": signals.get("signals", [])
            },
            "actualCost": costs["actual_cost"],
            "baselineCost": costs["baseline_cost"],
            "costSaved": costs["cost_saved"],
            "savingsPercentage": costs["savings_percentage"],
            "latency": model["typicalLatency"],
            "alternativeEvaluations": []
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
