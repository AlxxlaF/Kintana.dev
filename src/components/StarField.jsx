import { useEffect, useRef } from "react";

const BASE_STAR_COUNT = 15000;

function createStars(width, height, density) {
  const count = Math.round(BASE_STAR_COUNT * density);
  const stars = [];
  const cx = width / 2;
  const cy = -height * 0.3;
  const maxDist = Math.sqrt((width + 200) ** 2 + (height * 1.5 + 200) ** 2);

  for (let i = 0; i < count; i++) {
    const colorRoll = Math.random();
    // 30% white, 50% soft blue, 20% deep blue
    const isDeepBlue = colorRoll < 0.2;
    const isSoftBlue = colorRoll >= 0.2 && colorRoll < 0.7;

    const brightRoll = Math.random();
    let baseAlpha;
    if (brightRoll < 0.1) baseAlpha = Math.random() * 0.2 + 0.15;
    else if (brightRoll < 0.4) baseAlpha = Math.random() * 0.3 + 0.4;
    else baseAlpha = Math.random() * 0.2 + 0.8;

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.sqrt(Math.random()) * maxDist;

    let hue, saturation, fixedLightness;
    if (isDeepBlue) {
      hue = 210 + Math.random() * 30;
      saturation = 64 + Math.random() * 16;
      fixedLightness = 50;
    } else if (isSoftBlue) {
      hue = 210 + Math.random() * 30;
      saturation = 48 + Math.random() * 32;
      fixedLightness = 0;
    } else {
      hue = 0;
      saturation = 0;
      fixedLightness = 0;
    }

    stars.push({
      relX: Math.cos(angle) * dist,
      relY: Math.sin(angle) * dist,
      baseAlpha,
      twinkleSpeed: Math.random() * 2.0 + 0.6,
      phase: Math.random() * Math.PI * 2,
      hue, saturation, fixedLightness,
    });
  }
  return stars;
}

export default function StarField({ settings }) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animRef = useRef(null);
  const settingsRef = useRef(settings);
  const lastDensityRef = useRef(settings.starDensity);

  useEffect(() => {
    settingsRef.current = settings;
    if (settings.starDensity !== lastDensityRef.current) {
      lastDensityRef.current = settings.starDensity;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      starsRef.current = createStars(w, h, settings.starDensity);
    }
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    let w, h, cx, cy;

    function resize() {
      w = Math.round(window.innerWidth * dpr);
      h = Math.round(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      cx = w / 2;
      cy = -h * 0.3;
      starsRef.current = createStars(w, h, settingsRef.current.starDensity);
    }

    resize();
    window.addEventListener("resize", resize);

    // Shooting stars
    let shootingStar = null;
    let nextShootAt = 5 + Math.random() * 10;

    function spawnShootingStar() {
      const startX = Math.random() * w * 0.8 + w * 0.1;
      const startY = Math.random() * h * 0.4;
      const a = Math.random() * 0.8 + 0.3;
      const speed = w * (0.4 + Math.random() * 0.3);
      shootingStar = {
        x: startX, y: startY,
        dx: Math.cos(a) * speed, dy: Math.sin(a) * speed,
        length: 80 + Math.random() * 120,
        life: 0, duration: 0.4 + Math.random() * 0.4,
      };
    }

    let lastTime = 0;

    function draw(time) {
      const s = settingsRef.current;
      const t = time / 1000;
      const dt = lastTime ? t - lastTime : 0.016;
      lastTime = t;

      const rotSpeed = 0.012 * s.rotationSpeed;
      const angle = t * rotSpeed;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Background: black (0) to midnight blue (1)
      // Midnight blue ≈ rgb(25, 25, 80)
      const b = s.bgBlue;
      const br = Math.round(25 * b);
      const bg = Math.round(25 * b);
      const bb = Math.round(80 * b);
      ctx.fillStyle = b > 0 ? `rgb(${br},${bg},${bb})` : "#000";
      ctx.fillRect(0, 0, w, h);

      // --- Stars ---
      const brightness = s.brightness;
      const twinkleInt = s.twinkleIntensity;

      for (const star of starsRef.current) {
        const sx = cx + star.relX * cosA - star.relY * sinA;
        const sy = cy + star.relX * sinA + star.relY * cosA;
        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;

        const wave1 = Math.sin(t * star.twinkleSpeed * twinkleInt + star.phase);
        const wave2 = Math.sin(t * star.twinkleSpeed * twinkleInt * 1.7 + star.phase * 0.6);
        const twinkle = (wave1 + wave2 * 0.5) / 1.5 * 0.5 + 0.5;
        const alpha = star.baseAlpha * (0.05 + 0.95 * twinkle) * brightness;

        const lightness = star.fixedLightness > 0
          ? star.fixedLightness
          : (star.saturation > 0 ? 70 + twinkle * 20 : 90 + twinkle * 10);

        ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, ${lightness}%, ${alpha})`;
        ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
      }

      // --- Shooting star ---
      const shootFreq = s.shootingFreq;
      if (shootFreq > 0) {
        if (!shootingStar && t >= nextShootAt) {
          spawnShootingStar();
          const interval = (8 + Math.random() * 6) / shootFreq;
          nextShootAt = t + interval;
        }
        if (shootingStar) {
          const ss = shootingStar;
          ss.life += dt;
          ss.x += ss.dx * dt;
          ss.y += ss.dy * dt;
          const progress = ss.life / ss.duration;
          if (progress >= 1) {
            shootingStar = null;
          } else {
            const fade = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
            const tailLen = ss.length * fade;
            const norm = Math.sqrt(ss.dx * ss.dx + ss.dy * ss.dy);
            const tx = -ss.dx / norm * tailLen;
            const ty = -ss.dy / norm * tailLen;
            const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + tx, ss.y + ty);
            grad.addColorStop(0, `rgba(255, 255, 255, ${fade * 0.9 * brightness})`);
            grad.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x + tx, ss.y + ty);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "block",
      }}
    />
  );
}
