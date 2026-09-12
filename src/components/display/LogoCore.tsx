import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Logo } from '../Logo';
import type { CeremonyObject } from '../../types/ceremony';

interface LogoCoreProps {
  impactTrigger: number;
  completedObjects: CeremonyObject[];
  positions?: any; // Kept for backwards compatibility but unused
  logoRef?: React.RefObject<HTMLDivElement | null>;
}

// Pre-calculated origins based on the general quadrants of each node
const maskOrigins: Record<CeremonyObject, string> = {
  people: '14.6% 17.6%',
  innovation: '60.1% 9.9%',
  intelligence: '85.2% 34.8%',
  collaboration: '80.3% 65.2%',
  learning: '65.2% 85.2%',
  vision: '29.7% 88.3%',
  technology: '9.7% 70.3%',
  future: '4.7% 39.9%',
};

export function LogoCore({ impactTrigger, completedObjects, positions, logoRef }: LogoCoreProps) {
  const [pulse, setPulse] = useState(false);
  const illuminationLevel = completedObjects.length;

  useEffect(() => {
    if (impactTrigger > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [impactTrigger]);

  // Progressive illumination calculations (higher base values for premium 0/8 presence)
  const glowOpacity = Math.min(0.4 + illuminationLevel * 0.1, 1);
  const haloOpacity = Math.min(0.15 + illuminationLevel * 0.1, 0.9);

  // Progressive Illumination Mask
  let maskImage = 'linear-gradient(transparent, transparent)'; // Fully hidden by default

  if (illuminationLevel > 0) {
    if (illuminationLevel === 8) {
      maskImage = 'none'; // Fully revealed
    } else {
      const masks = completedObjects.map(id => {
        const origin = maskOrigins[id];
        // Reveal a significant quadrant/section for each value
        return `radial-gradient(circle at ${origin}, black 0%, black 20%, transparent 60%)`;
      });
      maskImage = masks.join(', ');
    }
  }

  return (
    <div className="logo-core-container">
      {/* Background ambient glow that breathes constantly, scales with illumination */}
      <div className="logo-ambient-glow" style={{ opacity: glowOpacity }} />
      <div className="logo-gold-halo" style={{ opacity: haloOpacity }} />

      {/* Temporary pulse effect triggered when an object completes */}
      {pulse && (
        <>
          {/* Sharp bright gold core flash */}
          <motion.div
            className="logo-pulse gold"
            initial={{ opacity: 1, scale: 0.2, filter: 'blur(2px)' }}
            animate={{ opacity: 0, scale: 1.3, filter: 'blur(8px)' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          {/* Gold dust burst ring */}
          <motion.div
            className="logo-pulse gold"
            style={{ border: '3px solid rgba(212, 175, 55, 0.9)', background: 'transparent' }}
            initial={{ opacity: 1, scale: 0.5, filter: 'blur(1px)' }}
            animate={{ opacity: 0, scale: 1.6, filter: 'blur(4px)' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
          />
          {/* Soft purple expanding ripple */}
          <motion.div
            className="logo-pulse purple"
            initial={{ opacity: 0.7, scale: 0.8, filter: 'blur(8px)' }}
            animate={{ opacity: 0, scale: 1.9, filter: 'blur(24px)' }}
            transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
          />
        </>
      )}

      {/* The Wrapper for positioning both logo layers */}
      <motion.div
        ref={logoRef}
        className="logo-wrapper"
        animate={
          pulse
            ? { scale: [1, 0.95, 1.03, 1] } // tiny compression -> expand -> settle
            : { scale: [1, 1.015, 1] }
        }
        transition={
          pulse
            ? { duration: 0.8, ease: 'easeOut' }
            : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Base Layer: Dark and unlit but premium */}
        <div style={{ position: 'absolute', inset: 0, filter: 'brightness(0.2) grayscale(0.5) contrast(1.1) drop-shadow(0 0 10px rgba(160, 42, 152, 0.2))' }}>
          <Logo />
        </div>

        {/* Illuminated Layer: Bright, glowing, and masked */}
        <div style={{ 
          position: 'relative', 
          filter: `drop-shadow(0 0 15px rgba(212, 175, 55, 0.8)) brightness(1.2)`,
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
        }}>
          <Logo />
        </div>
      </motion.div>
    </div>
  );
}
