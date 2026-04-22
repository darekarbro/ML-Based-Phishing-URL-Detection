import { useState } from 'react';

const QUICK_TESTS = [
  { label: '🔴 Suspicious', url: 'http://secure-login-update.xyz/verify?user=12345' },
  { label: '🟢 Safe', url: 'https://www.google.com' },
  { label: '🔴 Phishing', url: 'http://paypa1-account-verify.tk/login' },
];

export default function SearchBar({ onSearch, isLoading }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  const handleQuickTest = (url) => {
    setInputVal(url);
    onSearch(url);
  };

  return (
    <section className="search-section">
      <label className="search-label" htmlFor="url-input">
        Enter a URL to analyze
      </label>
      <form onSubmit={handleSubmit}>
        <div className="search-box">
          <span className="search-icon">🔗</span>
          <input
            id="url-input"
            className="search-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="https://example.com/path?param=value"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            id="analyze-btn"
            className="search-btn"
            type="submit"
            disabled={isLoading || !inputVal.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Analyze →'}
          </button>
        </div>
      </form>

      <div className="quick-tests">
        <span className="quick-label">Try:</span>
        {QUICK_TESTS.map(({ label, url }) => (
          <button
            key={url}
            className="quick-pill"
            onClick={() => handleQuickTest(url)}
            disabled={isLoading}
            title={url}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
