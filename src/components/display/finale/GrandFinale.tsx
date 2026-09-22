import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinalLogoRevealVideo } from './FinalLogoRevealVideo';

interface GrandFinaleProps {
  play: boolean;
  instant?: boolean;
  onStageChange?: (stage: FinaleState) => void;
}

export type FinaleState = 'idle' | 'final-logo-hold' | 'transition' | 'video-playing' | 'video-complete' | 'hydrated';

export function GrandFinale({ play, instant, onStageChange }: GrandFinaleProps) {
  const [stage, setStage] = useState<FinaleState>('idle');

  useEffect(() => {
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  useEffect(() => {
    if (!play) {
      setStage('idle');
      return;
    }

    if (instant) {
      setStage('hydrated');
      return;
    }

    // 0.0s: play = true (8th Node begins transit)
    // 1.3s: Node hits logo
    // 1.6s: Node impact finishes
    // 3.0s: Cinematic hold ends (1.4s hold of fully illuminated logo)
    
    setStage('final-logo-hold');

    const transitionTimer = setTimeout(() => {
      setStage('transition');
    }, 3000);

    const videoTimer = setTimeout(() => {
      setStage('video-playing');
    }, 4500);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(videoTimer);
    };
  }, [play, instant]);

  if (!play || stage === 'hydrated') return null;

  return (
    <div className="finale-container">
      <AnimatePresence>
        {stage === 'transition' && (
          <motion.div
            className="finale-cinematic-transition"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1.2, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.4) 0%, rgba(160, 42, 152, 0.2) 40%, transparent 80%)',
              zIndex: 40,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <FinalLogoRevealVideo 
        stage={stage} 
        onComplete={() => setStage('video-complete')} 
      />
    </div>
  );
}
