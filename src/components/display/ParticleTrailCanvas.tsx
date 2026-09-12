import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  color: 'gold-dust' | 'gold-spark' | 'purple' | 'energy';
  createdAt: number;
  speed: number;
  vx: number;
  vy: number;
}

interface ParticleTrailCanvasProps {
  isEmitting: boolean;
  nodeRef: React.RefObject<HTMLDivElement | null>;
}

export function ParticleTrailCanvas({ isEmitting, nodeRef }: ParticleTrailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let lastEmitTime = 0;
    let lastPos = { x: 0, y: 0 };
    
    // We only need to clear up if we completely stop. 
    // But since fade out is continuous, we need to keep drawing until all particles die.
    let isDrawing = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isEmitting && time - lastEmitTime > 16 && nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        const currentX = rect.left + rect.width / 2;
        const currentY = rect.top + rect.height / 2;

        const dx = currentX - lastPos.x;
        const dy = currentY - lastPos.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        const safeSpeed = lastPos.x === 0 ? 0 : speed;
        lastPos = { x: currentX, y: currentY };

        const numParticles = safeSpeed > 30 ? 5 : safeSpeed > 10 ? 3 : 2;
        const now = Date.now();

        for (let i = 0; i < numParticles; i++) {
          const rand = Math.random();
          let color: Particle['color'] = 'gold-dust';
          if (rand > 0.75) color = 'gold-spark'; // Increased spark ratio
          else if (rand > 0.55) color = 'purple';
          else if (i === 0 && safeSpeed > 15) color = 'energy';

          const spread = Math.min(safeSpeed * 0.6, 40);
          particles.push({
            x: currentX + (Math.random() - 0.5) * spread,
            y: currentY + (Math.random() - 0.5) * spread,
            color,
            createdAt: now,
            speed: safeSpeed,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
          });
        }
        lastEmitTime = time;
      }

      const now = Date.now();
      // Keep only particles younger than 700ms
      particles = particles.filter(p => now - p.createdAt < 700);

      for (const p of particles) {
        const age = now - p.createdAt;
        const lifeRatio = 1 - age / 700;
        
        // Easing scale (starts at 1, goes to 0)
        const scale = lifeRatio * lifeRatio; 
        
        // Update pos slightly
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        
        if (p.color === 'gold-dust') {
          ctx.arc(p.x, p.y, 3 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${lifeRatio})`;
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = 20;
        } else if (p.color === 'gold-spark') {
          ctx.arc(p.x, p.y, 4 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${lifeRatio})`;
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = 30;
        } else if (p.color === 'purple') {
          ctx.arc(p.x, p.y, 4 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160, 42, 152, ${lifeRatio})`;
          ctx.shadowColor = '#a02a98';
          ctx.shadowBlur = 25;
        } else {
          // energy
          ctx.arc(p.x, p.y, 12 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${lifeRatio * 0.7})`;
          ctx.shadowColor = 'rgba(212, 175, 55, 1)';
          ctx.shadowBlur = 40;
        }
        
        ctx.fill();
        // Reset shadow for next draw to avoid compounding performance hit
        ctx.shadowBlur = 0; 
      }

      if (isEmitting || particles.length > 0) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        isDrawing = false;
        // Reset lastPos so next emit doesn't create huge jump
        lastPos = { x: 0, y: 0 };
      }
    };

    if (isEmitting && !isDrawing) {
      isDrawing = true;
      animationFrameId = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isEmitting, nodeRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    />
  );
}
