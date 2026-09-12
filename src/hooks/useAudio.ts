import { useCallback } from 'react';

// Global registry ensures only one Audio instance exists per src path.
// This allows true generic unlocking and prevents browser multi-context limits.
const audioInstances: Record<string, HTMLAudioElement> = {};
const unlockedInstances: Record<string, boolean> = {};

export function useAudio(src: string) {
  if (typeof window !== 'undefined' && !audioInstances[src]) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioInstances[src] = audio;
    unlockedInstances[src] = false;
  }

  const unlock = useCallback(() => {
    const audio = audioInstances[src];
    if (audio && !unlockedInstances[src]) {
      unlockedInstances[src] = true; // Prevent multiple unlocks which can break the Audio element
      audio.volume = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;
          })
          .catch((err) => {
            console.log(`[Audio] unlock failed for ${src}:`, err.message);
            unlockedInstances[src] = false; // Reset so it can be retried
          });
      }
    }
  }, [src]);

  const play = useCallback((objectName?: string) => {
    const audio = audioInstances[src];
    if (audio) {
      if (objectName) {
        console.log(`[Audio] impact sound attempt: ${objectName.toUpperCase()}`);
      }
      
      // Reset time to allow rapid re-playing if necessary
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (objectName) {
              console.log(`[Audio] impact sound success: ${objectName.toUpperCase()}`);
            }
          })
          .catch((error) => {
            console.warn(`[Audio] playback prevented for ${src}:`, error.message);
          });
      }
    }
  }, [src]);

  return { play, unlock };
}
