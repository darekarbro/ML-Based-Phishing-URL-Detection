import { motion } from 'framer-motion';

export default function ModeSelector({ mode, setMode }) {
  const modes = [
    { id: 'fast', label: 'Fast Scan' },
    { id: 'detailed', label: 'Detailed Analysis' }
  ];

  return (
    <div className="mode-selector-wrapper">
      <div className="segmented-control">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
            style={{ flex: 1 }}
          >
            {m.label}
          </button>
        ))}
        <motion.div
          className="mode-indicator"
          initial={false}
          animate={{
            left: mode === 'fast' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)'
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      </div>
    </div>
  );
}
