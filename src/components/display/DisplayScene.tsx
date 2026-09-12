import { useEffect, useState, useRef } from 'react';
import type { CeremonyState, CeremonyObject } from '../../types/ceremony';
import type { ClientToServerMessage } from '../../types/protocol';
import type { ActiveDragState } from '../../lib/websocket';
import { Atmosphere } from './Atmosphere';
import { DigitalObject } from './DigitalObject';
import { LogoCore } from './LogoCore';
import { GrandFinale } from './finale/GrandFinale';
import { useAudio } from '../../hooks/useAudio';

interface DisplaySceneProps {
  state: CeremonyState;
  sendMessage: (msg: ClientToServerMessage) => void;
  clientId: string;
}

const labels: Record<CeremonyObject, string> = {
  people: 'PEOPLE',
  innovation: 'INNOVATION',
  intelligence: 'INTELLIGENCE',
  collaboration: 'COLLABORATION',
  learning: 'LEARNING',
  vision: 'VISION',
  technology: 'TECHNOLOGY',
  future: 'FUTURE',
};

// Organic, non-grid animation delays
const positions: Record<CeremonyObject, { delay: number }> = {
  people: { delay: 0 },
  innovation: { delay: 1.2 },
  intelligence: { delay: 0.5 },
  collaboration: { delay: 2.1 },
  learning: { delay: 0.8 },
  vision: { delay: 2.5 },
  technology: { delay: 1.5 },
  future: { delay: 0.2 },
};

export function DisplayScene({ state, sendMessage, clientId }: DisplaySceneProps) {
  const [justCompleted, setJustCompleted] = useState<{ id: CeremonyObject; timestamp: number } | null>(null);
  const [previousState, setPreviousState] = useState<CeremonyState>(state);
  const targetRef = useRef<HTMLDivElement>(null);

  const [playFinale, setPlayFinale] = useState(false);
  const [instantFinale, setInstantFinale] = useState(false);

  const completedObjects = (Object.keys(state) as CeremonyObject[]).filter(
    (key) => state[key] === 'completed'
  );
  const completedCount = completedObjects.length;

  useEffect(() => {
    const keys = Object.keys(state) as CeremonyObject[];
    let newCompletion = false;
    for (const key of keys) {
      if (state[key] === 'completed' && previousState[key] !== 'completed') {
        setJustCompleted({ id: key, timestamp: Date.now() });
        newCompletion = true;
        
        // Impact occurs exactly 1.3s into the cinematic travel sequence
        setTimeout(() => {
          impactAudio.play(key);
        }, 1300);
      }
    }

    const prevCount = Object.values(previousState).filter((s) => s === 'completed').length;
    
    if (completedCount === 8 && prevCount === 7 && newCompletion) {
      setPlayFinale(true);
      setInstantFinale(false);
    } else if (completedCount === 8 && prevCount === 8 && !playFinale) {
      setPlayFinale(true);
      setInstantFinale(true);
    } else if (completedCount === 0) {
      setPlayFinale(false);
      setInstantFinale(false);
    }

    setPreviousState(state);
  }, [state, previousState, completedCount, playFinale]);

  // Clear newly completed flag after animation sequence buffer
  useEffect(() => {
    if (justCompleted) {
      const timer = setTimeout(() => setJustCompleted(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [justCompleted]);

  const impactAudio = useAudio('/assets/sounds/value-impact.mp3');

  return (
    <main className="screen display-screen">
      <GrandFinale play={playFinale} instant={instantFinale} />
      
      <Atmosphere />
      
      <div className="display-content cinematic">
        <LogoCore 
          logoRef={targetRef}
          completedObjects={completedObjects}
          positions={positions}
          impactTrigger={justCompleted?.timestamp || 0} 
        />
      </div>

      <div className="display-objects-container">
        {(Object.keys(labels) as CeremonyObject[]).map((key) => (
          <DigitalObject
            key={key}
            id={key}
            label={labels[key]}
            isCompleted={state[key] === 'completed'}
            isNewlyCompleted={justCompleted?.id === key}
            delay={positions[key].delay}
            targetRef={targetRef}
            onAttemptComplete={(id) => sendMessage({ type: 'COMPLETE_OBJECT', object: id })}
            sendMessage={sendMessage}
            clientId={clientId}
          />
        ))}
      </div>
    </main>
  );
}
