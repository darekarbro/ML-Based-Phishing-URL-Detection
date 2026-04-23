import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import './index.css';
import { analyzeUrl } from './api';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import ThemeToggle from './components/ThemeToggle';
import ModeSelector from './components/ModeSelector';

export default function App() {
  const [result, setResult] = useState(null);
  const [analyzedUrl, setAnalyzedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('detailed');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = async (url) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setAnalyzedUrl(url);

    try {
      // Small artificial delay to let the user see the scanning animation
      await new Promise(r => setTimeout(r, 800)); 
      
      const data = await analyzeUrl(url, mode);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Connection to inference engine failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

      {/* Pearl Mist Background with Top Glow */}
      <div className="pearl-mist-bg" />

      <main className="app-container">
        
        {/* Header */}
        <header className="app-header">
          <motion.div 
            className="logo-wrapper"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Shield size={36} strokeWidth={1.5} />
          </motion.div>
          <motion.h1 
            className="app-title"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Phishing URL Detection
          </motion.h1>
          <motion.p 
            className="app-subtitle"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Enterprise-grade machine learning to identify malicious links and zero-day threats in real-time.
          </motion.p>
        </header>

        {/* Mode Selector */}
        <ModeSelector mode={mode} setMode={setMode} />

        {/* Input Region */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Dynamic State Region */}
        <div style={{ minHeight: '300px' }}>
          <AnimatePresence mode="wait">
            
            {/* Scanning State */}
            {isLoading && (
              <motion.div 
                key="loading"
                className="scanning-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="scanning-visual">
                  <motion.div 
                    className="scanning-line"
                    animate={{ 
                      x: ['-100%', '350%'] 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5, 
                      ease: "linear" 
                    }}
                  />
                </div>
                <div className="scanning-text">Analyzing URL Topology</div>
                <div className="scanning-subtext">Extracting features and querying XGBoost model...</div>
              </motion.div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <motion.div 
                key="error"
                className="error-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <AlertCircle className="error-icon" size={40} strokeWidth={1.5} />
                <div className="error-title">Analysis Interrupted</div>
                <p className="error-msg">{error}</p>
              </motion.div>
            )}

            {/* Result State */}
            {result && !isLoading && (
              <ResultCard key="result" result={result} url={analyzedUrl} />
            )}

          </AnimatePresence>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-text">
          <Shield size={14} /> Core Engine: FastAPI &amp; XGBoost
        </div>
      </footer>
    </div>
  );
}
