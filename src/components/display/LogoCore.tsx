import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Logo } from '../Logo';
import type { CeremonyObject } from '../../types/ceremony';

interface LogoCoreProps {
  impactTrigger: number;
  completedObjects: CeremonyObject[];
  positions: Record<CeremonyObject, { top: string; left: string; delay: number }>;
  logoRef?: React.RefObject<HTMLDivElement | null>;
}

const getLogoEdgeOrigin = (topStr: string, leftStr: string) => {
  const top = parseFloat(topStr);
  const left = parseFloat(leftStr);
  
  // Vector from center (50, 50)
  const dx = left - 50;
  const dy = top - 50;
  
  // Normalize vector
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = len === 0 ? 0 : dx / len;
  const ny = len === 0 ? 0 : dy / len;
  
  // Map normalized vector (-1 to 1) to logo percentages (0% to 100%)
  const px = ((nx + 1) / 2) * 100;
  const py = ((ny + 1) / 2) * 100;
  
  return `${px}% ${py}%`;
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

  // Progressive illumination calculations
  const glowOpacity = Math.min(0.2 + illuminationLevel * 0.1, 0.9);
  const haloOpacity = Math.min(0.05 + illuminationLevel * 0.1, 0.8);

  // Progressive Illumination Mask
  let maskImage = 'linear-gradient(transparent, transparent)'; // Fully hidden by default

  if (illuminationLevel > 0) {
    if (illuminationLevel === 8) {
      maskImage = 'none'; // Fully revealed
    } else {
      const masks = completedObjects.map(id => {
        const origin = getLogoEdgeOrigin(positions[id].top, positions[id].left);
        // Reveal a significant quadrant/section for each value
        return `radial-gradient(circle at ${origin}, black 0%, black 20%, transparent 60%)`;
      });
      maskImage = masks.join(', ');
    }
  }

  return (
    <div className="logo-core-container">
      {/* Background ambient glow that breathes constantly, scales with illumination */}
      <div className="logo-ambient-glow" style={{ background: `radial-gradient(circle, rgba(160, 42, 152, ${glowOpacity}) 0%, transparent 60%)` }} />
      <div className="logo-gold-halo" style={{ background: `radial-gradient(circle, rgba(212, 175, 55, ${haloOpacity}) 0%, transparent 60%)` }} />

      {/* Temporary pulse effect triggered when an object completes */}
      {pulse && (
        <>
          {/* Soft purple expanding ripple */}
          <motion.div
            className="logo-pulse purple"
            initial={{ opacity: 0.6, scale: 0.8, filter: 'blur(8px)' }}
            animate={{ opacity: 0, scale: 1.8, filter: 'blur(20px)' }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
          {/* Sharp bright gold core flash */}
          <motion.div
            className="logo-pulse gold"
            initial={{ opacity: 1, scale: 0.2, filter: 'blur(2px)' }}
            animate={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* Gold light ring expands */}
          <motion.div
            className="logo-pulse gold"
            style={{ border: '2px solid rgba(212, 175, 55, 0.8)', background: 'transparent' }}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
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
        {/* Base Layer: Dark and unlit */}
        <div style={{ position: 'absolute', inset: 0, filter: 'brightness(0.15) grayscale(0.8) contrast(1.2)' }}>
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
