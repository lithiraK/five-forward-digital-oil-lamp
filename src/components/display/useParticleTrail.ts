import { useEffect, useRef, useState } from 'react';

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: 'gold-dust' | 'gold-spark' | 'purple' | 'energy';
  createdAt: number;
  speed: number;
}

export function useParticleTrail(isEmitting: boolean, nodeRef: React.RefObject<HTMLDivElement | null>) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isEmitting) {
      // Clear out particles shortly after emission stops
      const timer = setTimeout(() => setParticles([]), 1000);
      return () => clearTimeout(timer);
    }

    let lastEmitTime = 0;

    const animate = (time: number) => {
      if (time - lastEmitTime > 16 && nodeRef.current) { // ~60fps emission
        const rect = nodeRef.current.getBoundingClientRect();
        const currentX = rect.left + rect.width / 2;
        const currentY = rect.top + rect.height / 2;

        const dx = currentX - lastPos.current.x;
        const dy = currentY - lastPos.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        // Don't calculate extreme jumps if this is the first frame
        const safeSpeed = lastPos.current.x === 0 ? 0 : speed;
        lastPos.current = { x: currentX, y: currentY };

        // Determine particle density based on speed (more particles if moving fast)
        const numParticles = safeSpeed > 25 ? 3 : safeSpeed > 5 ? 2 : 1;

        setParticles((prev) => {
          const now = Date.now();
          const filtered = prev.filter((p) => now - p.createdAt < 700); // 700ms long fade

          const newParticles: Particle[] = [];
          for (let i = 0; i < numParticles; i++) {
             const rand = Math.random();
             let color: Particle['color'] = 'gold-dust';
             if (rand > 0.85) color = 'gold-spark';
             else if (rand > 0.65) color = 'purple';
             else if (i === 0 && safeSpeed > 10) color = 'energy';

             // Add spread based on speed
             const spread = Math.min(safeSpeed * 0.5, 30);
             newParticles.push({
               id: particleIdRef.current++,
               x: currentX + (Math.random() - 0.5) * spread,
               y: currentY + (Math.random() - 0.5) * spread,
               color,
               createdAt: now,
               speed: safeSpeed,
             });
          }
          return [...filtered, ...newParticles];
        });
        lastEmitTime = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isEmitting, nodeRef]);

  return particles;
}
