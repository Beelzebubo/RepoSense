import { useEffect, useRef } from 'react';

export function SakuraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const petals: Petal[] = [];
    const PETAL_COUNT = 12;

    interface Petal {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      color: string;
    }

    const colors = ['#F5A0C0', '#E879A0', '#F0C0D4', '#D4608A', '#FFD0E0'];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createPetal(): Petal {
      return {
        x: Math.random() * canvas!.width,
        y: -20,
        size: Math.random() * 8 + 4,
        speedX: Math.random() * 0.5 - 0.1,
        speedY: Math.random() * 0.8 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    }

    function drawPetal(p: Petal) {
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.bezierCurveTo(p.size / 2, -p.size, p.size, -p.size / 2, p.size, 0);
      ctx!.bezierCurveTo(p.size, p.size / 2, p.size / 2, p.size, 0, 0);
      ctx!.fill();
      ctx!.restore();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      if (petals.length < PETAL_COUNT && Math.random() < 0.02) {
        petals.push(createPetal());
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.3;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas!.height + 20) {
          petals.splice(i, 1);
          continue;
        }

        drawPetal(p);
      }

      animId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
