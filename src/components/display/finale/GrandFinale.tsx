import { useEffect, useState } from 'react';
import { FinaleVideo } from './FinaleVideo';

interface GrandFinaleProps {
  play: boolean;
  instant?: boolean;
}

export type FinaleState = 'idle' | 'final-logo-hold' | 'video-playing' | 'video-complete' | 'hydrated';

export function GrandFinale({ play, instant }: GrandFinaleProps) {
  const [stage, setStage] = useState<FinaleState>('idle');

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

    const timer = setTimeout(() => {
      setStage('video-playing');
    }, 3000);

    return () => clearTimeout(timer);
  }, [play, instant]);

  if (!play || stage === 'hydrated') return null;

  return (
    <div className="finale-container">
      {(stage === 'video-playing' || stage === 'video-complete') && (
        <FinaleVideo 
          visible={true} 
          onComplete={() => setStage('video-complete')} 
        />
      )}
    </div>
  );
}
