"""
Routing Engine for LLM Cost Autopilot.
Preprocesses user prompts, analyzes multi-signal complexity, evaluates model alternatives,
and executes routing decisions.
"""

import re
from typing import Dict, Any, List, Tuple
from .cost_calculator import calculate_costs

def analyze_prompt_complexity(
    prompt: str,
    low_threshold: int = 35,
    medium_threshold: int = 70
) -> Tuple[int, str, Dict[str, Any]]:
    words = prompt.strip().split()
    word_count = len(words)
    char_count = len(prompt)
    question_count = prompt.count('?')

    score = 0
    signals = []

    # 1. Length scoring
    if word_count < 15:
        score += 5
    elif word_count < 50:
        score += 12
        signals.append(f"Moderate length ({word_count} words)")
    elif word_count < 150:
        score += 20
        signals.append(f"Substantial length ({word_count} words)")
    else:
        score += 25
        signals.append(f"Long context ({word_count} words)")

    # 2. Code detection
    has_code = bool(re.search(r'```|\b(def|class|function|interface|import|async|await|select|dockerfile)\b', prompt, re.I))
    if has_code:
        score += 25
        signals.append("Code syntax or programming keywords detected")

    # 3. Mathematical expressions
    has_math = bool(re.search(r'\b(gradient|integral|derivative|matrix|vector|probability|variance|formula)\b|\d+\s*[\+\-\*\/\^%]\s*\d+', prompt, re.I))
    if has_math:
        score += 20
        signals.append("Mathematical or computational concepts detected")

    # 4. Reasoning keywords
    reasoning_terms = ['trade-offs', 'tradeoffs', 'architecture', 'distributed', 'scalability', 'explain why', 'compare and contrast']
    matched_reasoning = [term for term in reasoning_terms if term in prompt.lower()]
    if matched_reasoning:
        score += min(20, len(matched_reasoning) * 8)
        signals.append(f"Deep reasoning keywords: {', '.join(matched_reasoning)}")

    normalized_score = min(100, max(5, score))

    if normalized_score > medium_threshold:
        level = "HIGH"
    elif normalized_score > low_threshold:
        level = "MEDIUM"
    else:
        level = "LOW"

    return normalized_score, level, {
        "word_count": word_count,
        "char_count": char_count,
        "question_count": question_count,
        "has_code": has_code,
        "has_math": has_math,
        "signals": signals
    }
