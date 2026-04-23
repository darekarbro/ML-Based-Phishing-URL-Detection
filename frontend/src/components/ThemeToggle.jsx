import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <div className="top-bar">
      <motion.button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle Theme"
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === 'dark' ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {theme === 'dark' ? (
            <Moon size={20} strokeWidth={2} />
          ) : (
            <Sun size={20} strokeWidth={2} />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
