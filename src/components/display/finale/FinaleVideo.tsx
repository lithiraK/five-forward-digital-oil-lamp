import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface FinaleVideoProps {
  visible: boolean;
  onComplete: () => void;
}

export function FinaleVideo({ visible, onComplete }: FinaleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (visible && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setHasStarted(true);
        }).catch((error) => {
          console.error("Autoplay prevented by browser:", error);
          // In a live environment, the user interaction with the controller often gives
          // sufficient context, but if it fails, it can be triggered manually.
        });
      }
    } else if (!visible && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setHasStarted(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="finale-video-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    >
      <video
        ref={videoRef}
        src="/assets/finale/five-forward-finale.mp4"
        className="finale-video"
        muted
        playsInline
        loop
      />
    </motion.div>
  );
}
