import { useState } from 'react';
import './index.css';
import { analyzeUrl } from './api';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';

export default function App() {
  const [result, setResult] = useState(null);
  const [analyzedUrl, setAnalyzedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (url) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setAnalyzedUrl(url);

    try {
      const data = await analyzeUrl(url, 'detailed');
      setResult(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Is the API server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      <main className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo-wrapper" aria-hidden="true">
            <span className="logo-icon">🛡️</span>
          </div>
          <h1 className="app-title">Phishing URL Detector</h1>
          <p className="app-subtitle">
            Paste any URL below and our ML model will instantly analyze it for phishing threats.
          </p>
        </header>

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <div className="loading-card" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p className="loading-text">Extracting features &amp; running ML model…</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="error-card" role="alert">
            <div className="error-icon" aria-hidden="true">⚠️</div>
            <div className="error-title">Analysis Failed</div>
            <p className="error-msg">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && !isLoading && (
          <ResultCard result={result} url={analyzedUrl} />
        )}
      </main>

      <footer className="app-footer">
        <p className="footer-text">
          ML-Based Phishing Detection · Powered by XGBoost &amp; FastAPI
        </p>
      </footer>
    </div>
  );
}
