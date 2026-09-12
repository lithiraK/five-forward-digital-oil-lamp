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
      blur: number;
      isSpark: boolean;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = 200; // Increased for a richer field
      for (let i = 0; i < numParticles; i++) {
        const isSpark = Math.random() > 0.92; // 8% are bright shimmering sparks
        const isBrightCore = Math.random() > 0.8;
        
        let radius, maxAlpha, blur;
        
        if (isSpark) {
          radius = Math.random() * 2 + 1.5;
          maxAlpha = Math.random() * 0.4 + 0.6; // 0.6 - 1.0 opacity
          blur = 0;
        } else if (isBrightCore) {
          radius = Math.random() * 2.5 + 1;
          maxAlpha = Math.random() * 0.5 + 0.3; // 0.3 - 0.8 opacity
          blur = Math.random() * 2;
        } else {
          radius = Math.random() * 1.5 + 0.5;
          maxAlpha = Math.random() * 0.3 + 0.1; // 0.1 - 0.4 opacity
          blur = Math.random() * 4 + 1; // background depth
        }

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15 - 0.1, // Subtle upward drift
          radius,
          alpha: Math.random() * maxAlpha,
          dAlpha: (Math.random() - 0.5) * (isSpark ? 0.02 : 0.005),
          maxAlpha,
          blur,
          isSpark,
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
        
        if (p.isSpark) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#d4af37';
        } else {
          // Premium warm gold: #d4af37 -> rgb(212, 175, 55)
          ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
          if (p.blur > 0) {
            ctx.shadowBlur = p.blur * 2;
            ctx.shadowColor = `rgba(212, 175, 55, ${p.alpha})`;
          } else {
            ctx.shadowBlur = 0;
          }
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset
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
