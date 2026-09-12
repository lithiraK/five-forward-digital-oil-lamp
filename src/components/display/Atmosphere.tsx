import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { GoldParticles } from './GoldParticles';
import { EnergyOrbits } from './EnergyOrbits';

export function Atmosphere() {
  const [particles, setParticles] = useState<{ id: number; top: string; left: string; delay: number }[]>([]);

  useEffect(() => {
    // Generate some random subtle noise particles
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="atmosphere">
      <EnergyOrbits />
      
      <div className="radial-glow"></div>
      <div className="radial-glow gold-bloom"></div>
      <div className="stage-reflection"></div>
      
      <GoldParticles />
      
      {/* Subtle particle noise */}
      <div className="particles-container">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="particle"
            style={{ top: p.top, left: p.left }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0], scale: [1, 1.5, 1] }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
