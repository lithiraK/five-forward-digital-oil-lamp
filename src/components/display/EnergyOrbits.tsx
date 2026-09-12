import { motion } from 'framer-motion';

export function EnergyOrbits() {
  return (
    <div className="energy-orbits-container">
      <svg
        width="100%"
        height="100%"
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Inner Orbit (Purple Base) */}
        <motion.ellipse
          cx="0"
          cy="0"
          rx="340"
          ry="240"
          fill="none"
          stroke="rgba(160, 42, 152, 0.25)"
          strokeWidth="1.5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner Orbit (Gold Stream) */}
        <motion.ellipse
          cx="0"
          cy="0"
          rx="340"
          ry="240"
          fill="none"
          stroke="rgba(212, 175, 55, 0.85)"
          strokeWidth="2.5"
          strokeDasharray="4 20 60 100 3000"
          style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.9))' }}
          initial={{ rotate: 45 }}
          animate={{ rotate: 405 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        />

        {/* Mid Orbit (Purple Base) */}
        <motion.ellipse
          cx="0"
          cy="0"
          rx="440"
          ry="320"
          fill="none"
          stroke="rgba(160, 42, 152, 0.15)"
          strokeWidth="1.5"
          initial={{ rotate: 60 }}
          animate={{ rotate: -300 }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
        />
        {/* Mid Orbit (Gold Stream) */}
        <motion.ellipse
          cx="0"
          cy="0"
          rx="440"
          ry="320"
          fill="none"
          stroke="rgba(212, 175, 55, 0.6)"
          strokeWidth="3"
          strokeDasharray="6 15 50 40 120 4000"
          style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.8))' }}
          initial={{ rotate: -60 }}
          animate={{ rotate: -420 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        />

        {/* Outer Orbit (Faint Purple) */}
        <motion.ellipse
          cx="0"
          cy="0"
          rx="540"
          ry="400"
          fill="none"
          stroke="rgba(160, 42, 152, 0.1)"
          strokeWidth="1"
          initial={{ rotate: 120 }}
          animate={{ rotate: 480 }}
          transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
        />
        {/* Outer Orbit (Fast Gold Stream) */}
        <motion.ellipse
          cx="0"
          cy="0"
          rx="540"
          ry="400"
          fill="none"
          stroke="rgba(212, 175, 55, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="3 10 30 50 5000"
          style={{ filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))' }}
          initial={{ rotate: 180 }}
          animate={{ rotate: 540 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
