"""
Cost Calculator Service for LLM Cost Autopilot.
Calculates token costs, baseline comparison against premium models, and savings percentages.
"""

from typing import Tuple

def calculate_costs(
    input_tokens: int,
    output_tokens: int,
    input_price_per_1m: float,
    output_price_per_1m: float,
    baseline_input_price_per_1m: float,
    baseline_output_price_per_1m: float
) -> Tuple[float, float, float, float]:
    """
    Returns: (actual_cost, baseline_cost, cost_saved, savings_percentage)
    Formula:
        input_cost = (input_tokens / 1,000,000) * input_price
        output_cost = (output_tokens / 1,000,000) * output_price
        total_cost = input_cost + output_cost
    """
    actual_input_cost = (input_tokens / 1_000_000.0) * input_price_per_1m
    actual_output_cost = (output_tokens / 1_000_000.0) * output_price_per_1m
    actual_cost = round(actual_input_cost + actual_output_cost, 6)

    baseline_input_cost = (input_tokens / 1_000_000.0) * baseline_input_price_per_1m
    baseline_output_cost = (output_tokens / 1_000_000.0) * baseline_output_price_per_1m
    baseline_cost = round(baseline_input_cost + baseline_output_cost, 6)

    cost_saved = round(max(0.0, baseline_cost - actual_cost), 6)
    savings_percentage = round((cost_saved / baseline_cost * 100.0), 1) if baseline_cost > 0 else 0.0

    return actual_cost, baseline_cost, cost_saved, savings_percentage
