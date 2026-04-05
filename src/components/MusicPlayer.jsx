import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX,
  Music, X, Repeat, ArrowRightLeft,
} from "lucide-react";
import { useLang } from "../i18n";

const PLAYLIST = [
  { title: "Calm Space Music", artist: "Clavier Music", url: "/music/clavier-music-calm-space-music-312291.mp3" },
  { title: "Space Ambient", artist: "Delosound", url: "/music/delosound-space-ambient-351305.mp3" },
  { title: "Space Ambient Cinematic", artist: "Delosound", url: "/music/delosound-space-ambient-cinematic-442834.mp3" },
  { title: "Space Ambient I", artist: "FreeMusicForVideo", url: "/music/freemusicforvideo-space-ambient-446647.mp3" },
  { title: "Space Ambient II", artist: "FreeMusicForVideo", url: "/music/freemusicforvideo-space-ambient-495614.mp3" },
  { title: "Space Ambient", artist: "Monume", url: "/music/monume-space-ambient-498030.mp3" },
  { title: "Cinematic Space", artist: "Nikita Kondrashev", url: "/music/nikitakondrashev-cinematic-space-510707.mp3" },
  { title: "Space Ambient", artist: "Nikita Kondrashev", url: "/music/nikitakondrashev-space-ambient-509783.mp3" },
  { title: "Space Ambient Cinematic", artist: "Viacheslav Starostin", url: "/music/viacheslavstarostin-space-ambient-cinematic-music-338203.mp3" },
];

const CROSSFADE_DEFAULT = 5;

function formatTime(sec) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [crossfade, setCrossfade] = useState(true);
  const [crossfadeDuration, setCrossfadeDuration] = useState(CROSSFADE_DEFAULT);
  const [repeat, setRepeat] = useState(false);
  const [muted, setMuted] = useState(false);
  const [btnOpacity, setBtnOpacity] = useState(1);

  const audioRef = useRef(null);
  const audioNextRef = useRef(null);
  const btnTimerRef = useRef(null);
  const progressRef = useRef(null);
  const crossfadingRef = useRef(false);
  const fadeIntervalRef = useRef(null);
  const volumeRef = useRef(volume);
  const crossfadeJustFinishedRef = useRef(false);
  const crossfadeDurationRef = useRef(crossfadeDuration);
  const playOnNextTrackRef = useRef(false);

  const { t } = useLang();
  const track = PLAYLIST[trackIdx];
  volumeRef.current = volume;
  crossfadeDurationRef.current = crossfadeDuration;

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

  const getNextIdx = useCallback(() => {
    if (repeat) return trackIdx;
    if (shuffle) {
      let next;
      do { next = Math.floor(Math.random() * PLAYLIST.length); } while (next === trackIdx && PLAYLIST.length > 1);
      return next;
    }
    return (trackIdx + 1) % PLAYLIST.length;
  }, [shuffle, repeat, trackIdx]);

  const startCrossfade = useCallback(() => {
    if (crossfadingRef.current) return;
    crossfadingRef.current = true;
    const main = audioRef.current;
    const next = audioNextRef.current;
    const nextIdx = getNextIdx();
    const vol = volumeRef.current;

    next.src = PLAYLIST[nextIdx].url;
    next.volume = 0;
    next.play().catch(() => {});

    const steps = 50;
    const interval = (crossfadeDurationRef.current * 1000) / steps;
    let step = 0;

    clearInterval(fadeIntervalRef.current);
    fadeIntervalRef.current = setInterval(() => {
      step++;
      const ratio = step / steps;
      main.volume = Math.max(0, vol * (1 - ratio));
      next.volume = vol * ratio;

      if (step >= steps) {
        clearInterval(fadeIntervalRef.current);
        main.pause();
        main.src = "";
        // Swap refs — next becomes main, main becomes next
        const temp = audioRef.current;
        audioRef.current = audioNextRef.current;
        audioNextRef.current = temp;
        audioRef.current.volume = vol;
        crossfadingRef.current = false;
        crossfadeJustFinishedRef.current = true;
        setTrackIdx(nextIdx);
      }
    }, interval);
  }, [getNextIdx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (crossfade && playing && audio.duration && !crossfadingRef.current) {
        const remaining = audio.duration - audio.currentTime;
        if (remaining <= crossfadeDurationRef.current && remaining > 0) startCrossfade();
      }
    };
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => { if (!crossfadingRef.current) setTrackIdx(getNextIdx()); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [crossfade, playing, startCrossfade, getNextIdx]);

  useEffect(() => {
    // Skip if crossfade just swapped — audio is already playing the right track
    if (crossfadeJustFinishedRef.current) {
      crossfadeJustFinishedRef.current = false;
      // Just update duration from the already-playing audio
      const audio = audioRef.current;
      if (audio) {
        setDuration(audio.duration || 0);
        setCurrentTime(audio.currentTime || 0);
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio || crossfadingRef.current) return;
    audio.src = track.url;
    audio.volume = muted ? 0 : volume;
    setCurrentTime(0);
    setDuration(0);
    // Play immediately — either already playing or explicitly requested
    if (playing || playOnNextTrackRef.current) {
      playOnNextTrackRef.current = false;
      audio.play().catch(() => {});
    }
  }, [trackIdx]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      audioNextRef.current?.pause();
      clearInterval(fadeIntervalRef.current);
      crossfadingRef.current = false;
    } else {
      if (!audio.src || audio.ended) audio.src = track.url;
      audio.volume = muted ? 0 : volume;
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const stop = () => {
    clearInterval(fadeIntervalRef.current);
    crossfadingRef.current = false;
    audioNextRef.current?.pause();
  };

  const nextTrack = () => { stop(); setTrackIdx(getNextIdx()); };
  const prevTrack = () => {
    stop();
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setTrackIdx((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    }
  };

  const selectTrack = (i) => {
    stop();
    // Always play when selecting a track from the playlist
    playOnNextTrackRef.current = true;
    setTrackIdx(i);
    setPlaying(true);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setMuted(false);
    if (audioRef.current && !crossfadingRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    if (audioRef.current) audioRef.current.volume = m ? 0 : volume;
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audioRef.current && duration) audioRef.current.currentTime = ratio * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const accent = "rgba(140, 180, 255,";

  return (
    <>
      <audio ref={audioRef} preload="auto" />
      <audio ref={audioNextRef} preload="auto" />

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          position: "fixed", top: 56, right: 16, zIndex: 1001,
          width: 38, height: 38,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10,
          color: "#fff", padding: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: expanded ? 1 : btnOpacity, transition: "opacity 0.5s ease",
        }}
      >
        {expanded ? <X size={16} /> : <Music size={16} />}
      </button>

      {expanded && (
        <div style={{
          position: "fixed", top: 96, right: 16, zIndex: 1000, width: 320,
          background: "rgba(10, 10, 30, 0.65)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
          padding: "20px 22px", color: "#fff",
        }}>

          {/* Now playing */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
              {t("nowPlaying")}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {track.title}
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              {track.artist}
            </div>
          </div>

          {/* Progress */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            style={{
              width: "100%", height: 4, background: "rgba(255,255,255,0.08)",
              borderRadius: 2, cursor: "pointer", marginBottom: 8, position: "relative",
            }}
          >
            <div style={{
              width: `${progress}%`, height: "100%",
              background: `${accent} 0.7)`, borderRadius: 2,
            }} />
            {/* Thumb */}
            <div style={{
              position: "absolute", top: -4, left: `${progress}%`, transform: "translateX(-50%)",
              width: 12, height: 12, borderRadius: "50%",
              background: `${accent} 0.9)`, border: "2px solid rgba(10,10,30,0.8)",
            }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Main controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 }}>
            <button onClick={() => setShuffle(!shuffle)} style={iconBtn(shuffle)} title={t("shuffle")}>
              <Shuffle size={15} />
            </button>
            <button onClick={prevTrack} style={iconBtn(true)}>
              <SkipBack size={18} fill="white" />
            </button>
            <button onClick={togglePlay} style={{
              width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: `${accent} 0.15)`, border: `1px solid ${accent} 0.25)`,
              color: "#fff", cursor: "pointer",
            }}>
              {playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={nextTrack} style={iconBtn(true)}>
              <SkipForward size={18} fill="white" />
            </button>
            <button onClick={() => setRepeat(!repeat)} style={iconBtn(repeat)} title={t("repeat")}>
              <Repeat size={15} />
            </button>
          </div>

          {/* Volume + crossfade */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <button onClick={toggleMute} style={{ ...iconBtn(true), padding: 4 }}>
              {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <Slider
              value={muted ? 0 : volume} min={0} max={1} step={0.01}
              onChange={(v) => { setVolume(v); setMuted(false); if (audioRef.current && !crossfadingRef.current) audioRef.current.volume = v; }}
            />
            <button
              onClick={() => setCrossfade(!crossfade)}
              style={{ ...iconBtn(crossfade), padding: 4, fontSize: 11 }}
              title={t("crossfade")}
            >
              <ArrowRightLeft size={14} />
            </button>
          </div>

          {crossfade && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 10, color: "rgba(140, 180, 255, 0.4)", whiteSpace: "nowrap" }}>
                {t("crossfade")}
              </span>
              <Slider
                value={crossfadeDuration} min={1} max={12} step={1}
                onChange={(v) => setCrossfadeDuration(v)}
              />
              <span style={{ fontSize: 10, color: "rgba(140, 180, 255, 0.4)", minWidth: 20, textAlign: "right" }}>
                {Math.round(crossfadeDuration)}s
              </span>
            </div>
          )}

          {/* Playlist */}
          <div style={{
            maxHeight: 180, overflowY: "auto", scrollbarWidth: "none",
            borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10,
          }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>
              {t("playlist")} — {PLAYLIST.length} {t("tracks")}
            </div>
            {PLAYLIST.map((t, i) => (
              <div
                key={i}
                onClick={() => selectTrack(i)}
                style={{
                  padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                  background: i === trackIdx ? "rgba(140, 180, 255, 0.1)" : "transparent",
                  marginBottom: 2, display: "flex", alignItems: "center", gap: 10,
                  transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                  background: i === trackIdx ? `${accent} 0.15)` : "rgba(255,255,255,0.04)",
                  fontSize: 11, color: i === trackIdx ? `${accent} 0.9)` : "rgba(255,255,255,0.3)",
                }}>
                  {i === trackIdx && playing ? <Pause size={10} /> : <span>{i + 1}</span>}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{
                    fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    color: i === trackIdx ? `${accent} 0.95)` : "rgba(255,255,255,0.6)",
                  }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                    {t.artist}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Slider({ value, min, max, step, onChange, color = "rgba(140, 180, 255, 0.7)" }) {
  const ref = useRef(null);
  const pct = ((value - min) / (max - min)) * 100;

  const computeValue = (clientX) => {
    const rect = ref.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return min + ratio * (max - min);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    onChange(computeValue(e.clientX));
    const onMove = (ev) => onChange(computeValue(ev.clientX));
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      style={{
        flex: 1, height: 14, background: "transparent",
        cursor: "pointer", position: "relative",
        display: "flex", alignItems: "center",
      }}
    >
      <div style={{
        width: "100%", height: 4, background: "rgba(255,255,255,0.08)",
        borderRadius: 2, position: "relative",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: 2,
        }} />
      </div>
      <div style={{
        position: "absolute", top: "50%", left: `${pct}%`,
        transform: "translate(-50%, -50%)",
        width: 12, height: 12, borderRadius: "50%",
        background: color, border: "2px solid rgba(10,10,30,0.8)",
      }} />
    </div>
  );
}

const iconBtn = (active) => ({
  background: "none", border: "none", color: "#fff",
  padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  opacity: active ? 0.8 : 0.3, transition: "opacity 0.2s",
});

