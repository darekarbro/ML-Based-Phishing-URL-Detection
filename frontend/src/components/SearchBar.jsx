import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

const QUICK_TESTS = [
  { label: 'Suspicious', url: 'http://secure-login-update.xyz/verify?user=12345', icon: ShieldAlert, color: '#ff453a' },
  { label: 'Safe', url: 'https://www.apple.com', icon: ShieldCheck, color: '#30d158' },
];

export default function SearchBar({ onSearch, isLoading }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return (
    <section className="search-section">
      <motion.label 
        className="search-label" 
        htmlFor="url-input"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Target URL Analysis
      </motion.label>
      
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="search-box">
          <Link2 className="search-icon" size={20} strokeWidth={2} />
          <input
            id="url-input"
            className="search-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="https://example.com"
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
          />
          <button
            id="analyze-btn"
            className="search-btn"
            type="submit"
            disabled={isLoading || !inputVal.trim()}
          >
            <span>Scan</span>
            <ArrowRight size={18} strokeWidth={2.5} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </motion.form>

      <motion.div 
        className="quick-tests"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <span className="quick-label">Presets:</span>
        {QUICK_TESTS.map(({ label, url, icon: Icon, color }) => (
          <button
            key={url}
            className="quick-pill"
            onClick={() => {
              setInputVal(url);
              onSearch(url);
            }}
            disabled={isLoading}
            type="button"
          >
            <Icon size={12} color={color} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </motion.div>
    </section>
  );
}
