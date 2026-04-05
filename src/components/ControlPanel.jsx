import { useState, useEffect, useRef } from "react";
import { useLang, LANGUAGES } from "../i18n";

const SECTIONS = [
  {
    labelKey: "ambiance",
    controls: [
      { key: "brightness", labelKey: "brightness", min: 0, max: 2, step: 0.01, default: 1 },
      { key: "bgBlue", labelKey: "bgBlue", min: 0, max: 0.2, step: 0.01, default: 0 },
      { key: "starDensity", labelKey: "starDensity", min: 0.2, max: 2, step: 0.1, default: 1 },
    ],
  },
  {
    labelKey: "animation",
    controls: [
      { key: "twinkleIntensity", labelKey: "twinkle", min: 0, max: 2, step: 0.1, default: 1 },
      { key: "rotationSpeed", labelKey: "rotation", min: 0, max: 3, step: 0.1, default: 1 },
      { key: "shootingFreq", labelKey: "shootingStars", min: 0, max: 3, step: 0.1, default: 1 },
    ],
  },
];

function getDefaults() {
  const d = {};
  SECTIONS.forEach((s) => s.controls.forEach((c) => (d[c.key] = c.default)));
  return d;
}

export const DEFAULT_SETTINGS = getDefaults();

export default function ControlPanel({ settings, onChange }) {
  const { t, lang, setLang } = useLang();
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const timerRef = useRef(null);
  const panelRef = useRef(null);

  const toggle = () => {
    if (visible) {
      setOpacity(0);
      setTimeout(() => setVisible(false), 500);
    } else {
      setVisible(true);
      setOpacity(1);
    }
  };

  const [btnOpacity, setBtnOpacity] = useState(1);
  const btnTimerRef = useRef(null);

  useEffect(() => {
    const handleMove = () => {
      setBtnOpacity(1);
      clearTimeout(btnTimerRef.current);
      btnTimerRef.current = setTimeout(() => setBtnOpacity(0), 4000);
    };
    window.addEventListener("mousemove", handleMove);
    btnTimerRef.current = setTimeout(() => setBtnOpacity(0), 4000);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      clearTimeout(btnTimerRef.current);
    };
  }, []);

  return (
    <>
      <button
        onClick={toggle}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 1001,
          width: 38, height: 38,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10,
          color: "#fff", padding: 0, cursor: "pointer", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: visible ? 1 : btnOpacity, transition: "opacity 0.5s ease",
          pointerEvents: "auto",
        }}
      >
        {visible ? "\u2715" : "\u2699"}
      </button>

      {visible && (
        <div
          ref={panelRef}
          style={{
            position: "fixed", top: 56, right: 16, zIndex: 1000, width: 260,
            maxHeight: "calc(100vh - 80px)", overflowY: "auto",
            background: "rgba(10, 10, 30, 0.55)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
            padding: "16px 18px", color: "#fff", fontSize: 13,
            opacity, transition: "opacity 0.5s ease", scrollbarWidth: "none",
          }}
        >
          {/* Language selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5,
              color: "rgba(255,255,255,0.4)", marginBottom: 10,
            }}>
              {t("language")}
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                width: "100%", padding: "6px 10px", borderRadius: 8, fontSize: 12,
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.12)", outline: "none", cursor: "pointer",
                appearance: "none", WebkitAppearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "#1a1a2e", color: "#fff" }}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.labelKey} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5,
                color: "rgba(255,255,255,0.4)", marginBottom: 10,
              }}>
                {t(section.labelKey)}
              </div>
              {section.controls.map((ctrl) => (
                <div key={ctrl.key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>
                      {t(ctrl.labelKey)}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                      {Number(settings[ctrl.key]).toFixed(ctrl.step < 1 ? 2 : 0)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min} max={ctrl.max} step={ctrl.step}
                    value={settings[ctrl.key]}
                    onChange={(e) => onChange({ ...settings, [ctrl.key]: parseFloat(e.target.value) })}
                    style={{
                      width: "100%", height: 4, appearance: "none",
                      background: "rgba(255,255,255,0.12)", borderRadius: 2,
                      outline: "none", cursor: "pointer",
                    }}
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Fullscreen */}
          <button
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              else document.documentElement.requestFullscreen().catch(() => {});
            }}
            style={{
              width: "100%", padding: "8px 0", marginBottom: 8,
              background: "rgba(140, 180, 255, 0.1)",
              border: "1px solid rgba(140, 180, 255, 0.2)", borderRadius: 8,
              color: "rgba(140, 180, 255, 0.8)", cursor: "pointer", fontSize: 12,
            }}
          >
            {t("fullscreen")}
          </button>

          {/* Reset */}
          <button
            onClick={() => onChange(getDefaults())}
            style={{
              width: "100%", padding: "8px 0",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12,
            }}
          >
            {t("reset")}
          </button>
        </div>
      )}
    </>
  );
}
