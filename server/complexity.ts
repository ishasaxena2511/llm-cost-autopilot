import { ComplexityLevel, ComplexitySignals } from '../src/types/index.js';

export function analyzeComplexity(
  prompt: string,
  lowThreshold: number = 35,
  mediumThreshold: number = 70
): {
  score: number;
  level: ComplexityLevel;
  signals: ComplexitySignals;
} {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();

  // Basic token and context metrics
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = trimmed.length;
  const questionCount = (prompt.match(/\?/g) || []).length;

  const detectedSignals: string[] = [];
  let score = 0;

  // 1. Length & Context Volume Scoring (up to 25 points)
  if (wordCount < 12) {
    score += 5;
  } else if (wordCount < 40) {
    score += 12;
    detectedSignals.push(`Moderate length (${wordCount} words)`);
  } else if (wordCount < 120) {
    score += 20;
    detectedSignals.push(`Substantial context (${wordCount} words)`);
  } else {
    score += 25;
    detectedSignals.push(`Extensive context (${wordCount} words)`);
  }

  // 2. High-Order Mathematical Proofs & Theoretical Frontier Directives (+50 points)
  // Mathematical proofs and theoretical physics derivations inherently require frontier models, regardless of prompt length.
  const proofTerms = [
    'prove',
    'formal proof',
    'mathematical proof',
    'theorem',
    'conjecture',
    'lemma',
    'axiom',
    'fermat',
    'riemann',
    'navier-stokes',
    'schrodinger',
    'schrödinger',
    'feynman',
    'maxwell',
    'poincare',
    'poincaré',
    'godel',
    'turing completeness',
    'halting problem',
    'p vs np',
    "euler's identity",
    'taylor series expansion',
  ];
  const matchedProof = proofTerms.filter((term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    return regex.test(lower);
  });
  const hasTheoreticalProof = matchedProof.length > 0;
  if (hasTheoreticalProof) {
    score += 50;
    detectedSignals.push(`Formal theoretical / mathematical proof directive (${matchedProof.join(', ')})`);
  }

  // 3. Advanced Algorithms & Complex Data Structures (+45 points)
  // Short prompts asking for Red-Black trees, AVL trees, Dijkstra, or NP-hard algorithms represent peak technical complexity.
  const algoTerms = [
    'red-black tree',
    'red black tree',
    'avl tree',
    'b-tree',
    'b+ tree',
    'trie',
    'segment tree',
    'fenwick tree',
    'disjoint set',
    'dijkstra',
    'bellman-ford',
    'floyd-warshall',
    'a* search',
    'tarjan',
    'kruskal',
    'prim',
    'dynamic programming',
    'memoization',
    'knapsack',
    'traveling salesman',
    'np-hard',
    'np-complete',
    'lru cache',
    'lfu cache',
    'bloom filter',
    'skip list',
    'radix sort',
  ];
  const matchedAlgo = algoTerms.filter((term) => lower.includes(term));
  const hasAdvancedAlgorithm = matchedAlgo.length > 0;
  if (hasAdvancedAlgorithm) {
    score += 45;
    detectedSignals.push(`Advanced algorithm / data structure (${matchedAlgo.join(', ')})`);
  }

  // 4. Distributed Systems, Concurrency & Resiliency (+40 points)
  // Deep systems engineering concepts like Byzantine faults, Raft, Paxos, and distributed deadlocks require high-capability reasoning.
  const distributedTerms = [
    'byzantine',
    'fault tolerance',
    'paxos',
    'raft',
    'split brain',
    'split-brain',
    'two-phase commit',
    '2pc',
    'saga pattern',
    'cap theorem',
    'pacelc',
    'distributed deadlock',
    'deadlock',
    'mutex',
    'semaphore',
    'race condition',
    'memory barrier',
    'cache coherence',
    'mesi protocol',
    'vector clock',
    'lamport timestamp',
    'eventual consistency',
    'sharding',
    'replication factor',
  ];
  const matchedDistributed = distributedTerms.filter((term) => lower.includes(term));
  const hasDistributedSystems = matchedDistributed.length > 0;
  if (hasDistributedSystems) {
    score += Math.min(50, 35 + matchedDistributed.length * 8);
    detectedSignals.push(`Distributed systems / concurrency mechanisms (${matchedDistributed.join(', ')})`);
  }

  // 5. Code & Implementation Detection (+32 points)
  // Uses clean regex boundaries that correctly match languages (e.g. C++, Rust, Python) and directive verbs (e.g. implement, pseudocode, regex).
  const codePatterns = [
    /```[\s\S]*?```/,
    /\b(function|def|class|const|let|var|return|import|export|interface|async|await|public|private)\b/,
    /(?:\bc\+\+|\bcpp\b|\brust\b|\bgolang\b|\bpython\b|\btypescript\b|\bjavascript\b|\bcsharp\b|\bjava\b|\bassembly\b|\bcuda\b|\bsql\b|\bregex\b|\bdockerfile\b|\byaml\b|\bjson\b)/i,
    /\b(pseudocode|pseudo-code|implementation|implement|snippet|algorithm|parser|compiler|interpreter|script)\b/i,
    /[{};<>]=?/,
    /\b(api|endpoint|sdk|graphql|rest|grpc)\b/i,
  ];
  const hasCode = codePatterns.some((pattern) => pattern.test(prompt));
  if (hasCode) {
    score += 32;
    detectedSignals.push('Code, pseudocode, or language implementation');
  }

  // 6. Mathematical expressions & Calculations (+25 points)
  const mathPatterns = [
    /\b(calculate|equation|integral|derivative|matrix|vector|gradient|probability|variance|stddev|formula|algorithm|euler|laplace|fourier|tiling|softmax|multiplication|eigen|eigenvalue|eigenvalues|eigenvector|eigenvectors|tensor|hessian|loss function|norm)\b/i,
    /(\d+\s*[\+\-\*\/\^%]\s*\d+)/,
    /[∑∏√∫≈≠≤≥]/,
  ];
  const hasMath = mathPatterns.some((p) => p.test(prompt));
  if (hasMath) {
    score += 25;
    detectedSignals.push('Mathematical / computational reasoning');
  }

  // 7. Reasoning keywords (up to 20 points)
  const reasoningTerms = [
    'explain why',
    'compare and contrast',
    'compared to',
    'trade-offs',
    'tradeoff',
    'architecture',
    'distributed',
    'scalability',
    'evaluate',
    'critique',
    'analyze',
    'derive',
    'derivation',
    'mathematical formulation',
    'internal mechanics',
    'mechanics of',
    'pros and cons',
    'under the hood',
    'step by step',
    'in-depth',
  ];
  const matchedReasoning = reasoningTerms.filter((term) => lower.includes(term));
  const hasReasoningKeywords = matchedReasoning.length > 0;
  if (hasReasoningKeywords) {
    const points = Math.min(20, matchedReasoning.length * 8);
    score += points;
    detectedSignals.push(`Deep reasoning keywords: "${matchedReasoning.slice(0, 3).join(', ')}"`);
  }

  // 8. Multi-step instructions (up to 15 points)
  const multiStepPatterns = [
    /\b(step by step|step-by-step)\b/i,
    /\b(first|second|third|finally|then|after that)\b/i,
    /\b(step 1|step 2|\b1\.\s+|\b2\.\s+)/i,
    /\b(multi-stage|pipeline|workflow|lifecycle)\b/i,
  ];
  const hasMultiStep = multiStepPatterns.some((p) => p.test(prompt));
  if (hasMultiStep) {
    score += 15;
    detectedSignals.push('Multi-step procedural instructions');
  }

  // 9. Structured output requirements (up to 15 points)
  const structuredTerms = [
    'json format',
    'return json',
    'valid json',
    'yaml',
    'table with columns',
    'markdown table',
    'strict schema',
    'csv',
  ];
  const hasStructuredOutput = structuredTerms.some((term) => lower.includes(term));
  if (hasStructuredOutput) {
    score += 15;
    detectedSignals.push('Strict structured output format required');
  }

  // 10. Advanced Domain Terminology (up to 20 points)
  const technicalTerms = [
    'kubernetes',
    'microservices',
    'cqrs',
    'zero-knowledge',
    'cryptography',
    'flashattention',
    'multi-head attention',
    'attention mechanism',
    'transformer architecture',
    'backpropagation',
    'backward pass',
    'recomputation',
    'gpu',
    'hbm',
    'sram',
    'cuda',
    'kernel',
    'memory bandwidth',
    'kafka',
    'flink',
    'fraud detection',
    'redis',
    'consensus',
    'distributed architecture',
    'high availability',
    'quantum entanglement',
    'superposition',
    'qubit',
    'qubits',
    'eigenvalues',
    'eigenvectors',
    'matrix diagonalization',
    'fourier transform',
    'laplace transform',
  ];
  const matchedTech = technicalTerms.filter((term) => lower.includes(term));
  const technicalTermsCount = matchedTech.length;
  if (technicalTermsCount > 0) {
    score += Math.min(25, technicalTermsCount * 12);
    detectedSignals.push(`Advanced domain terminology (${matchedTech.join(', ')})`);
  }

  // 11. High Information Density Multiplier for Short Technical Prompts
  // If a prompt is brief (< 25 words) but contains high-order technical concepts (proofs, algorithms, distributed systems, code, or technical terms),
  // it is an information-dense technical challenge. Elevate it rather than penalizing its brevity.
  const hasHighTierConcept = hasTheoreticalProof || hasAdvancedAlgorithm || hasDistributedSystems;
  const hasMediumTierConcept = hasCode || hasMath || technicalTermsCount > 0;

  if (wordCount < 25) {
    if (hasHighTierConcept) {
      score += 25;
      detectedSignals.push('High concept density in concise prompt');
    } else if (hasMediumTierConcept) {
      score += 15;
      detectedSignals.push('Technical domain focus in concise prompt');
    }
  }

  // 12. Guarded Conversational Dampener
  // ONLY dampens prompts if they have ZERO technical, algorithmic, mathematical, or proof signals.
  const isPurelyConversational =
    !hasTheoreticalProof &&
    !hasAdvancedAlgorithm &&
    !hasDistributedSystems &&
    !hasCode &&
    !hasMath &&
    !hasReasoningKeywords &&
    technicalTermsCount === 0;

  if (wordCount < 12 && questionCount <= 1 && isPurelyConversational) {
    score = Math.min(score, 25);
    detectedSignals.push('Concise single-turn query');
  }

  // Clamp score between 5 and 100
  const normalizedScore = Math.min(100, Math.max(5, Math.round(score)));

  let level: ComplexityLevel = 'LOW';
  let qualityTier: 'Basic / Routine' | 'Intermediate / Structured' | 'Advanced / Frontier Reasoning' = 'Basic / Routine';
  let qualitySummary = 'Simple, single-turn informational query requiring standard fast inference.';
  let clarityFactor = 'Clear, concise instruction';
  let reasoningFactor = 'Low cognitive load';
  let technicalFactor = 'Standard vocabulary';

  if (normalizedScore > mediumThreshold) {
    level = 'HIGH';
    qualityTier = 'Advanced / Frontier Reasoning';
    qualitySummary = 'High-complexity prompt demanding deep domain expertise, multi-factor trade-offs, or advanced algorithmic reasoning.';
    clarityFactor = 'Detailed, multi-faceted prompt structure with comprehensive directives';
    reasoningFactor = 'High: Requires rigorous chain-of-thought, trade-off synthesis, or mathematical deduction';
    technicalFactor = hasCode || technicalTermsCount > 0 || hasTheoreticalProof || hasAdvancedAlgorithm || hasDistributedSystems
      ? 'Advanced: Domain-specific systems architecture, code, or mathematics'
      : 'Specialized conceptual depth';
  } else if (normalizedScore > lowThreshold) {
    level = 'MEDIUM';
    qualityTier = 'Intermediate / Structured';
    qualitySummary = 'Moderately complex prompt involving structured transformations, multi-step workflows, or standard coding.';
    clarityFactor = 'Structured task specification with explicit parameters or format';
    reasoningFactor = 'Moderate: Involves sequential steps or analytical explanations';
    technicalFactor = hasCode || hasStructuredOutput ? 'Structured format or technical implementation patterns' : 'Standard professional knowledge';
  }

  const signals: ComplexitySignals = {
    wordCount,
    charCount,
    questionCount,
    hasCode,
    hasMath,
    hasReasoningKeywords,
    hasMultiStep,
    hasStructuredOutput,
    technicalTermsCount,
    detectedSignals,
    qualityTier,
    qualityScore: normalizedScore,
    qualitySummary,
    clarityFactor,
    reasoningFactor,
    technicalFactor,
  };

  return {
    score: normalizedScore,
    level,
    signals,
  };
}
