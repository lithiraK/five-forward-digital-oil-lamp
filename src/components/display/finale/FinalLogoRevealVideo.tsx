import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { FinaleState } from './GrandFinale';

interface FinalLogoRevealVideoProps {
  stage: FinaleState;
  onComplete: () => void;
}

export function FinalLogoRevealVideo({ stage, onComplete }: FinalLogoRevealVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // start unmuted

  const isVisible = stage === 'video-playing';
  // Keep the video mounted but hidden during earlier states
  const shouldMount = stage !== 'idle' && stage !== 'hydrated' && stage !== 'video-complete';

  useEffect(() => {
    if (isVisible && videoRef.current) {
      // Attempt unmuted play first
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setHasStarted(true);
        }).catch((error) => {
          console.warn("Audible autoplay prevented by browser:", error.message);
          // Fallback to muted playback
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => {
              setHasStarted(true);
            }).catch((mutedError) => {
              console.error("Even muted autoplay failed:", mutedError.message);
              // If it totally fails, force completion so we don't get stuck
              onComplete();
            });
          }
        });
      }
    } else if (!isVisible && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setHasStarted(false);
    }
  }, [isVisible, onComplete]);

  if (!shouldMount) return null;

  return (
    <motion.div
      className="finale-video-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <video
        ref={videoRef}
        src="/assets/finale/code-to-logo-reveal.mp4"
        className="finale-video"
        muted={isMuted}
        playsInline
        preload="auto"
        onEnded={() => {
          onComplete();
        }}
        style={{ objectFit: 'cover' }}
      />
    </motion.div>
  );
}
