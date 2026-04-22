import { useState } from 'react';

function getVerdict(probability) {
  if (probability >= 70) return { level: 'danger', label: 'Phishing Detected', icon: '🚨', sub: 'This URL shows strong signs of being malicious.' };
  if (probability >= 40) return { level: 'warning', label: 'Suspicious URL', icon: '⚠️', sub: 'This URL has some suspicious characteristics.' };
  return { level: 'safe', label: 'URL Appears Safe', icon: '✅', sub: 'No major phishing indicators were detected.' };
}

// Highlight features that are suspicious (value = 1 for flags, or high numbers)
const SUSPICIOUS_FLAGS = ['use_of_ip', 'suspicious_tld', 'short_url', 'phish_keyword', 'double_extension', 'tld_in_path', 'has_fragment'];

function FeatureChip({ name, value }) {
  const isSuspicious = SUSPICIOUS_FLAGS.includes(name) && value === 1;
  return (
    <div className={`feature-chip ${isSuspicious ? 'highlight' : ''}`}>
      <span className="feature-name" title={name}>{name.replace(/_/g, ' ')}</span>
      <span className="feature-value">{value}</span>
    </div>
  );
}

export default function ResultCard({ result, url }) {
  const [showFeatures, setShowFeatures] = useState(false);
  const { probability, features } = result;
  const verdict = getVerdict(probability);

  return (
    <div className={`result-card ${verdict.level}`} role="region" aria-label="Analysis result">
      {/* Header */}
      <div className="result-header">
        <div className="result-verdict">
          <span className="verdict-icon" aria-hidden="true">{verdict.icon}</span>
          <div>
            <div className={`verdict-label ${verdict.level}`}>{verdict.label}</div>
            <div className="verdict-sub">{verdict.sub}</div>
          </div>
        </div>

        {/* Probability Circle */}
        <div className="prob-meter" aria-label={`Phishing probability: ${probability}%`}>
          <div className={`prob-circle ${verdict.level}`}>
            <span className={`prob-value ${verdict.level}`}>{probability}</span>
            <span className="prob-unit">%</span>
          </div>
          <div className="prob-label">phishing risk</div>
        </div>
      </div>

      {/* URL */}
      <div>
        <div className="result-url-label">Analyzed URL</div>
        <div className="result-url">{url}</div>
      </div>

      {/* Progress Bar */}
      <div className="progress-wrap">
        <div className="progress-header">
          <span className="progress-title">Risk Level</span>
          <span className="progress-pct">{probability}%</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${verdict.level}`}
            style={{ width: `${probability}%` }}
            role="progressbar"
            aria-valuenow={probability}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      {/* Features Section */}
      {features && (
        <div className="features-section">
          <div
            className="features-toggle"
            onClick={() => setShowFeatures((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowFeatures((v) => !v)}
            aria-expanded={showFeatures}
          >
            <span className="features-toggle-label">🔬 Extracted Features ({Object.keys(features).length})</span>
            <span className={`features-toggle-icon ${showFeatures ? 'open' : ''}`}>▼</span>
          </div>

          {showFeatures && (
            <div className="features-grid">
              {Object.entries(features).map(([name, value]) => (
                <FeatureChip key={name} name={name} value={value} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
