/**
 * Plagiarism Similarity Analysis
 * Computes k-gram token fingerprints and Jaccard similarity coefficients
 */

const { preprocessCode } = require('./preprocessor');
const { tokenizeCode } = require('./tokenizer');

// Generate k-grams from token array
function generateKGrams(tokens, k = 4) {
  if (tokens.length < k) {
    return [tokens.join(' ')];
  }
  const kGrams = [];
  for (let i = 0; i <= tokens.length - k; i++) {
    kGrams.push(tokens.slice(i, i + k).join(' '));
  }
  return kGrams;
}

// Simple deterministic hash for tokens
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Winnowing Fingerprinting Algorithm
function getFingerprints(kGrams, windowSize = 4) {
  const hashes = kGrams.map(g => simpleHash(g));
  if (hashes.length <= windowSize) {
    return new Set(hashes);
  }

  const fingerprints = new Set();
  let minIdx = -1;

  for (let i = 0; i <= hashes.length - windowSize; i++) {
    let windowMin = Infinity;
    let currentMinIdx = -1;

    for (let j = 0; j < windowSize; j++) {
      if (hashes[i + j] <= windowMin) {
        windowMin = hashes[i + j];
        currentMinIdx = i + j;
      }
    }

    if (currentMinIdx !== minIdx) {
      fingerprints.add(windowMin);
      minIdx = currentMinIdx;
    }
  }

  return fingerprints;
}

// Calculate Jaccard Similarity between two fingerprint sets
function calculateJaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : (intersectionCount / unionCount);
}

// Token frequency cosine overlap
function calculateTokenFrequencyOverlap(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const freqA = {};
  const freqB = {};

  tokensA.forEach(t => { freqA[t] = (freqA[t] || 0) + 1; });
  tokensB.forEach(t => { freqB[t] = (freqB[t] || 0) + 1; });

  const allKeys = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of allKeys) {
    const valA = freqA[key] || 0;
    const valB = freqB[key] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Main Similarity Function between two source codes
function compareCodes(codeA, codeB, language = 'python') {
  const prepA = preprocessCode(codeA, language);
  const prepB = preprocessCode(codeB, language);

  const tokensA = tokenizeCode(prepA);
  const tokensB = tokenizeCode(prepB);

  const kGramsA = generateKGrams(tokensA, 4);
  const kGramsB = generateKGrams(tokensB, 4);

  const fpA = getFingerprints(kGramsA, 4);
  const fpB = getFingerprints(kGramsB, 4);

  const jaccard = calculateJaccardSimilarity(fpA, fpB);
  const tokenCosine = calculateTokenFrequencyOverlap(tokensA, tokensB);

  // Blended score: 65% Winnowing structural fingerprints + 35% Token distribution
  const blended = (jaccard * 0.65) + (tokenCosine * 0.35);
  const scorePercent = Number(Math.min(100, Math.max(0, blended * 100)).toFixed(2));

  let status = 'LOW_SIMILARITY';
  if (scorePercent >= 60.0) {
    status = 'HIGH_SIMILARITY';
  } else if (scorePercent >= 35.0) {
    status = 'MODERATE_SIMILARITY';
  }

  return {
    similarityScore: scorePercent,
    detectionStatus: status,
    jaccardIndex: Number(jaccard.toFixed(4)),
    tokenCosine: Number(tokenCosine.toFixed(4)),
    tokenCountA: tokensA.length,
    tokenCountB: tokensB.length
  };
}

module.exports = {
  compareCodes,
  generateKGrams,
  tokenizeCode,
  preprocessCode
};
