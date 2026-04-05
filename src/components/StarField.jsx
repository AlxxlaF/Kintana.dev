import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BASE_STAR_COUNT = 15000;
const DEPTH_LAYERS = 3; // near, mid, far — for subtle parallax

// ---------------------------------------------------------------------------
// Pseudo-random seeded noise (simple hash for clustered density)
// ---------------------------------------------------------------------------
function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

/**
 * Creates a non-uniform density field.
 * Returns a function(x, y) => 0..1 where higher = denser region.
 */
function createDensityField(width, height) {
  const cellSize = 200;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push(hash(c, r));
    }
  }
  return (x, y) => {
    const c = Math.min(cols - 1, Math.floor(x / cellSize));
    const r = Math.min(rows - 1, Math.floor(y / cellSize));
    return grid[r * cols + c];
  };
}

// ---------------------------------------------------------------------------
// Star generation — non-uniform distribution with varied sizes
// ---------------------------------------------------------------------------
function createStars(width, height, density) {
  const count = Math.round(BASE_STAR_COUNT * density);
  const stars = [];
  const cx = width / 2;
  const cy = -height * 0.3;
  const maxDist = Math.sqrt((width + 200) ** 2 + (height * 1.5 + 200) ** 2);
  const densityField = createDensityField(width * 2, height * 2);

  for (let i = 0; i < count; i++) {
    // --- Color distribution: 30% white, 50% soft blue, 20% deep blue ---
    const colorRoll = Math.random();
    const isDeepBlue = colorRoll < 0.2;
    const isSoftBlue = colorRoll >= 0.2 && colorRoll < 0.7;

    // --- Brightness tiers: 10% dim, 30% medium, 60% bright ---
    const brightRoll = Math.random();
    let baseAlpha;
    if (brightRoll < 0.1) baseAlpha = Math.random() * 0.2 + 0.15;
    else if (brightRoll < 0.4) baseAlpha = Math.random() * 0.3 + 0.4;
    else baseAlpha = Math.random() * 0.2 + 0.8;

    // --- Position in disk around rotation pole ---
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.sqrt(Math.random()) * maxDist;
    const relX = Math.cos(angle) * dist;
    const relY = Math.sin(angle) * dist;

    // --- Non-uniform density: reject some stars in sparse regions ---
    const screenX = cx + relX;
    const screenY = cy + relY;
    const localDensity = densityField(
      ((screenX % (width * 2)) + width * 2) % (width * 2),
      ((screenY % (height * 2)) + height * 2) % (height * 2)
    );
    if (Math.random() > 0.4 + localDensity * 0.6) continue;

    // --- Color ---
    let hue, saturation, fixedLightness;
    if (isDeepBlue) {
      hue = 210 + Math.random() * 30;
      saturation = 64 + Math.random() * 16;
      fixedLightness = 50;
    } else if (isSoftBlue) {
      hue = 210 + Math.random() * 30;
      saturation = 48 + Math.random() * 32;
      fixedLightness = 0; // dynamic lightness
    } else {
      hue = 0;
      saturation = 0;
      fixedLightness = 0;
    }

    // --- Size: non-uniform distribution (most tiny, few bigger) ---
    const sizeRoll = Math.random();
    let size;
    if (sizeRoll < 0.65) size = 1;          // 65% — single pixel
    else if (sizeRoll < 0.88) size = 1.5;    // 23% — slightly larger
    else if (sizeRoll < 0.97) size = 2;      // 9%  — medium
    else size = 2.5 + Math.random();         // 3%  — bright prominent stars

    // --- Depth layer for parallax ---
    const layer = size <= 1 ? 0 : size <= 2 ? 1 : 2;

    stars.push({
      relX, relY, baseAlpha, size, layer,
      // Each star has unique twinkle characteristics
      twinkleSpeed: Math.random() * 2.0 + 0.6,
      twinkleDepth: 0.3 + Math.random() * 0.7, // how much it fades (0.3 = subtle, 1.0 = full)
      phase: Math.random() * Math.PI * 2,
      hue, saturation, fixedLightness,
    });
  }
  return stars;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function StarField({ settings }) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animRef = useRef(null);
  const settingsRef = useRef(settings);
  const lastDensityRef = useRef(settings.starDensity);

  // Sync settings without recreating stars (unless density changes)
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

    // -------------------------------------------------------------------
    // Shooting stars — rare, natural trajectory, soft fading trail
    // -------------------------------------------------------------------
    let shootingStar = null;
    let nextShootAt = 8 + Math.random() * 12;

    function spawnShootingStar() {
      // Natural entry: top portion of screen, random angle
      const startX = Math.random() * w * 0.8 + w * 0.1;
      const startY = Math.random() * h * 0.3;
      const angle = 0.2 + Math.random() * 0.9; // 11° to 63° downward
      const speed = w * (0.3 + Math.random() * 0.4); // varied speed
      const length = 60 + Math.random() * 140;

      shootingStar = {
        x: startX, y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length,
        life: 0,
        duration: 0.3 + Math.random() * 0.5, // 0.3–0.8s
        maxAlpha: 0.6 + Math.random() * 0.4,  // brightness varies
      };
    }

    // -------------------------------------------------------------------
    // Main render loop
    // -------------------------------------------------------------------
    let lastTime = 0;

    function draw(time) {
      const s = settingsRef.current;
      const t = time / 1000;
      const dt = lastTime ? t - lastTime : 0.016;
      lastTime = t;

      // --- Parallax rotation speeds per layer ---
      const baseRotSpeed = 0.012 * s.rotationSpeed;
      const layerSpeeds = [
        baseRotSpeed,            // far stars — slowest
        baseRotSpeed * 1.15,     // mid stars
        baseRotSpeed * 1.3,      // near stars — fastest
      ];

      // --- Background ---
      const b = s.bgBlue;
      const br = Math.round(25 * b);
      const bg = Math.round(25 * b);
      const bb = Math.round(80 * b);
      ctx.fillStyle = b > 0 ? `rgb(${br},${bg},${bb})` : "#000";
      ctx.fillRect(0, 0, w, h);

      // --- Stars ---
      const brightness = s.brightness;
      const twinkleInt = s.twinkleIntensity;

      // Pre-compute rotation per layer
      const cosA = [], sinA = [];
      for (let l = 0; l < DEPTH_LAYERS; l++) {
        const angle = t * layerSpeeds[l];
        cosA[l] = Math.cos(angle);
        sinA[l] = Math.sin(angle);
      }

      for (const star of starsRef.current) {
        const l = star.layer;
        const sx = cx + star.relX * cosA[l] - star.relY * sinA[l];
        const sy = cy + star.relX * sinA[l] + star.relY * cosA[l];
        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;

        // --- Twinkle: two sine waves for organic feel ---
        const wave1 = Math.sin(t * star.twinkleSpeed * twinkleInt + star.phase);
        const wave2 = Math.sin(t * star.twinkleSpeed * twinkleInt * 1.7 + star.phase * 0.6);
        const twinkle = (wave1 + wave2 * 0.5) / 1.5 * 0.5 + 0.5;
        const alpha = star.baseAlpha * ((1 - star.twinkleDepth) + star.twinkleDepth * twinkle) * brightness;

        // --- Lightness ---
        const lightness = star.fixedLightness > 0
          ? star.fixedLightness
          : (star.saturation > 0 ? 70 + twinkle * 20 : 90 + twinkle * 10);

        const color = `hsla(${star.hue}, ${star.saturation}%, ${lightness}%, ${Math.min(1, alpha)})`;
        ctx.fillStyle = color;

        // --- Draw based on size ---
        if (star.size <= 1) {
          ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
        } else {
          const r = star.size * 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
          // Soft glow for largest stars
          if (star.size > 2 && twinkle > 0.6) {
            ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, ${lightness}%, ${Math.min(1, alpha * 0.12)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // --- Shooting stars ---
      const shootFreq = s.shootingFreq;
      if (shootFreq > 0) {
        if (!shootingStar && t >= nextShootAt) {
          spawnShootingStar();
          nextShootAt = t + (8 + Math.random() * 8) / shootFreq;
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
            // Smooth fade: quick in, slow out
            const fade = progress < 0.15
              ? progress / 0.15
              : 1 - Math.pow((progress - 0.15) / 0.85, 0.7);
            const tailLen = ss.length * fade;
            const norm = Math.sqrt(ss.dx * ss.dx + ss.dy * ss.dy);
            const tx = (-ss.dx / norm) * tailLen;
            const ty = (-ss.dy / norm) * tailLen;

            // Gradient trail
            const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + tx, ss.y + ty);
            const headAlpha = fade * ss.maxAlpha * brightness;
            grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, headAlpha)})`);
            grad.addColorStop(0.3, `rgba(200, 220, 255, ${Math.min(1, headAlpha * 0.5)})`);
            grad.addColorStop(1, "rgba(200, 220, 255, 0)");

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x + tx, ss.y + ty);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2 + fade * 0.8;
            ctx.lineCap = "round";
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
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "#000",
        display: "block",
      }}
    />
  );
}
