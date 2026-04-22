import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, ChevronDown } from 'lucide-react';

function getVerdict(probability) {
  if (probability >= 70) return { level: 'danger', label: 'Critical Threat', icon: XCircle, sub: 'High probability of phishing. Do not proceed.' };
  if (probability >= 40) return { level: 'warning', label: 'Suspicious', icon: AlertTriangle, sub: 'Anomalies detected. Proceed with caution.' };
  return { level: 'safe', label: 'Secure', icon: ShieldCheck, sub: 'No malicious indicators identified.' };
}

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
  const Icon = verdict.icon;

  return (
    <motion.div 
      className={`result-card ${verdict.level}`}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="result-header">
        <div className="result-verdict">
          <div className={`verdict-icon-wrapper ${verdict.level}`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="verdict-label">{verdict.label}</div>
            <div className="verdict-sub">{verdict.sub}</div>
          </div>
        </div>

        <div className="prob-meter">
          <div className={`prob-value ${verdict.level}`}>
            {probability}<span className="prob-unit">%</span>
          </div>
          <div className="prob-label">Risk Profile</div>
        </div>
      </div>

      <div className="result-url-wrapper">
        <div className="result-url-label">Analyzed URI</div>
        <div className="result-url">{url}</div>
      </div>

      {features && (
        <div className="features-section">
          <div
            className="features-toggle"
            onClick={() => setShowFeatures((v) => !v)}
            role="button"
          >
            <span className="features-toggle-label">
              Diagnostic Telemetry ({Object.keys(features).length})
            </span>
            <ChevronDown 
              className={`features-toggle-icon ${showFeatures ? 'open' : ''}`} 
              size={18} 
            />
          </div>

          <AnimatePresence>
            {showFeatures && (
              <motion.div 
                className="features-grid"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {Object.entries(features).map(([name, value]) => (
                  <FeatureChip key={name} name={name} value={value} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
