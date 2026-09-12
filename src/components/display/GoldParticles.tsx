import { useEffect, useRef } from 'react';

export function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      dAlpha: number;
      maxAlpha: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = 130; // Increased for more luxurious presence
      for (let i = 0; i < numParticles; i++) {
        const isBrightCore = Math.random() > 0.85; // 15% are brighter cores
        const radius = isBrightCore ? Math.random() * 2 + 1 : Math.random() * 1.5 + 0.3;
        const maxAlpha = isBrightCore ? Math.random() * 0.6 + 0.4 : Math.random() * 0.4 + 0.1;

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12 - 0.08, // Subtle upward drift
          radius,
          alpha: Math.random() * maxAlpha,
          dAlpha: (Math.random() - 0.5) * 0.008,
          maxAlpha,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around seamlessly
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Shimmer effect
        p.alpha += p.dAlpha;
        if (p.alpha <= 0 || p.alpha >= p.maxAlpha) {
          p.dAlpha = -p.dAlpha;
          p.alpha = Math.max(0, Math.min(p.alpha, p.maxAlpha));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Premium warm gold: #d4af37 -> rgb(212, 175, 55)
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="gold-particles-canvas" />;
}
