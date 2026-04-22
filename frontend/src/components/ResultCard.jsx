import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, ChevronDown, Activity, Info } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import '../telemetry.css';

function getVerdict(probability) {
  if (probability >= 70) return { level: 'danger', label: 'Critical Threat', icon: XCircle, sub: 'High probability of phishing. Do not proceed.', color: '#ff453a' };
  if (probability >= 40) return { level: 'warning', label: 'Suspicious', icon: AlertTriangle, sub: 'Anomalies detected. Proceed with caution.', color: '#ffd60a' };
  return { level: 'safe', label: 'Secure', icon: ShieldCheck, sub: 'No malicious indicators identified.', color: '#30d158' };
}

// Map the 20 raw features into 4 intuitive risk dimensions (0-100 scale) for the Radar Chart
function calculateRiskDimensions(f) {
  if (!f) return [];

  let structural = 0;
  if (f['url_length'] > 75) structural += 30;
  if (f['count.'] > 3) structural += 20;
  if (f['count-digits'] > 10) structural += 20;
  if (f['count-'] > 2) structural += 15;
  if (f['count@'] > 0) structural += 15;
  structural = Math.min(100, structural);

  let domain = 0;
  if (f['subdomain_count'] > 2) domain += 40;
  if (f['suspicious_tld'] === 1) domain += 30;
  if (f['use_of_ip'] === 1) domain += 50;
  if (f['has_https'] === 0) domain += 20;
  domain = Math.min(100, domain);

  let behavioral = 0;
  if (f['path_length'] > 40) behavioral += 30;
  if (f['path_depth'] > 3) behavioral += 30;
  if (f['query_param_count'] > 2) behavioral += 20;
  if (f['tld_in_path'] === 1) behavioral += 20;
  behavioral = Math.min(100, behavioral);

  let security = 0;
  if (f['double_extension'] === 1) security += 30;
  if (f['has_fragment'] === 1) security += 20;
  if (f['short_url'] === 1) security += 30;
  if (f['phish_keyword'] === 1) security += 20;
  security = Math.min(100, security);

  return [
    { subject: 'Structural', risk: structural },
    { subject: 'Domain', risk: domain },
    { subject: 'Behavioral', risk: behavioral },
    { subject: 'Security', risk: security },
  ];
}

const FEATURE_CATEGORIES = {
  'Structural Anomalies': ['url_length', 'hostname_length', 'count.', 'count-digits', 'count-', 'count@', 'count%'],
  'Domain Trust': ['subdomain_count', 'suspicious_tld', 'use_of_ip', 'has_https'],
  'Path & Behavior': ['path_length', 'fd_length', 'path_depth', 'query_param_count', 'tld_in_path'],
  'Security Flags': ['double_extension', 'has_fragment', 'short_url', 'phish_keyword']
};

const SUSPICIOUS_FLAGS = ['use_of_ip', 'suspicious_tld', 'short_url', 'phish_keyword', 'double_extension', 'tld_in_path', 'has_fragment'];

const FEATURE_GLOSSARY = {
  'url_length': 'Total character length of the entire URL.',
  'hostname_length': 'Length of the domain name.',
  'count.': 'Number of dots (.) in the URL.',
  'count-digits': 'Total number of numeric digits in the URL.',
  'count-': 'Number of hyphens. Often used by attackers to mimic legitimate domains.',
  'count@': 'Number of @ symbols. Often used to obfuscate the real domain.',
  'count%': 'Number of % symbols, indicating URL encoding.',
  'subdomain_count': 'Number of subdomains. Phishers use long subdomains to trick users.',
  'suspicious_tld': 'Flags Top-Level Domains commonly associated with spam (e.g., .xyz, .top).',
  'use_of_ip': 'Flags if the domain is directly an IP address instead of a standard hostname.',
  'has_https': 'Checks if the URL uses secure HTTPS encryption.',
  'path_length': 'Length of the URL path (everything after the domain).',
  'fd_length': 'Length of the first directory in the path.',
  'path_depth': 'The number of directories (slashes) in the path.',
  'query_param_count': 'The number of parameters passed in the URL.',
  'tld_in_path': 'Flags if a domain extension (like .com) is hiding in the path to trick users.',
  'double_extension': 'Detects suspicious files with double extensions (e.g., .pdf.exe).',
  'has_fragment': 'Checks for # fragment identifiers in the URL.',
  'short_url': 'Detects if the URL uses a link shortener service like bit.ly.',
  'phish_keyword': 'Checks if common phishing words (like login, verify, secure) are present.'
};

function FeatureRow({ name, value }) {
  const isSuspicious = SUSPICIOUS_FLAGS.includes(name) && value === 1;
  const isHighValue = (name.includes('length') && value > 50) || (name.includes('count') && value > 5 && name !== 'hostname_length');
  const highlight = isSuspicious || isHighValue;
  const description = FEATURE_GLOSSARY[name] || 'No description available.';

  return (
    <div className={`feature-row ${highlight ? 'highlight' : ''}`}>
      <div className="feature-name-wrapper">
        <span className="feature-name">{name.replace(/_/g, ' ')}</span>
        <div className="tooltip-trigger">
          <Info size={12} strokeWidth={2.5} className="info-icon" />
          <div className="tooltip-content">{description}</div>
        </div>
      </div>
      <span className="feature-value">{value}</span>
    </div>
  );
}

export default function ResultCard({ result, url }) {
  const [showFeatures, setShowFeatures] = useState(false);
  const { probability, features } = result;
  const verdict = getVerdict(probability);
  const Icon = verdict.icon;
  const radarData = calculateRiskDimensions(features);

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
        <div className="telemetry-section">
          <div
            className="features-toggle"
            onClick={() => setShowFeatures((v) => !v)}
            role="button"
          >
            <span className="features-toggle-label">
              <Activity size={18} /> View Diagnostic Telemetry
            </span>
            <ChevronDown 
              className={`features-toggle-icon ${showFeatures ? 'open' : ''}`} 
              size={18} 
            />
          </div>

          <AnimatePresence>
            {showFeatures && (
              <motion.div 
                className="telemetry-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="telemetry-grid">
                  
                  {/* Left Column: Radar Chart */}
                  <div className="telemetry-visual">
                    <div className="telemetry-col-header">
                      <h4 className="telemetry-col-title">Anomaly Profile (Visual)</h4>
                      <div className="tooltip-trigger">
                        <Info size={14} strokeWidth={2.5} className="info-icon" />
                        <div className="tooltip-content tooltip-down tooltip-right" style={{ width: '220px' }}>
                          Aggregates the 20 raw features into 4 intuitive risk dimensions (0-100%). Higher scores indicate stronger phishing signals in that category.
                        </div>
                      </div>
                    </div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#86868b', fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(20,20,22,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: verdict.color }}
                          />
                          <Radar 
                            name="Risk Level" 
                            dataKey="risk" 
                            stroke={verdict.color} 
                            fill={verdict.color} 
                            fillOpacity={0.2} 
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Column: Categorized Features */}
                  <div className="telemetry-data">
                    <h4 className="telemetry-col-title">Raw Extraction (20 Features)</h4>
                    <div className="categories-wrapper">
                      {Object.entries(FEATURE_CATEGORIES).map(([catName, featureList]) => (
                        <div key={catName} className="feature-category">
                          <div className="category-title">{catName}</div>
                          <div className="feature-list">
                            {featureList.map(feat => (
                              <FeatureRow key={feat} name={feat} value={features[feat]} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
