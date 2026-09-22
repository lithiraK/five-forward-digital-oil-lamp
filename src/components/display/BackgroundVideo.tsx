import { motion } from 'framer-motion';

interface BackgroundVideoProps {
  fadeOut: boolean;
}

export function BackgroundVideo({ fadeOut }: BackgroundVideoProps) {
  return (
    <motion.div
      className="background-video-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      <video
        className="background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/assets/background/five-forward-background.mp4" type="video/mp4" />
      </video>
      <div className="background-overlay" />
    </motion.div>
  );
}
