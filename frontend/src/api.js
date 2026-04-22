const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Sends a URL to the FastAPI backend for phishing analysis.
 * @param {string} url - The URL to analyze.
 * @param {string} mode - 'fast' or 'detailed'
 * @returns {Promise<{probability: number, message: string, features: object|null, timestamp: string}>}
 */
export async function analyzeUrl(url, mode = 'detailed') {
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, mode }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json();
}
