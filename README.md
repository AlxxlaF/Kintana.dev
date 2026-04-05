# Kintana — Starfield Ambient Experience

A calm, immersive, and realistic starfield visualizer built with React and Canvas. Features twinkling stars, earth-like sky rotation, shooting stars, an integrated ambient music player with crossfade, and full internationalization (44 languages).

## Features

### Starfield
- **15,000+ stars** with non-uniform distribution (clustered density regions)
- **3 depth layers** with subtle parallax effect during rotation
- **Varied star sizes** — 65% single-pixel, 23% small, 9% medium, 3% prominent with glow
- **Realistic twinkle** — each star has unique amplitude, speed, and phase offset
- **Color distribution** — 30% white, 50% soft blue, 20% deep blue
- **Earth-like rotation** — stars rotate around a celestial pole (top of screen)

### Shooting Stars
- Rare events (~every 10s, configurable)
- Natural trajectory with varied angles and speed
- Soft fading trail with gradient from white to blue
- Smooth fade-in / fade-out lifecycle

### Settings Panel (glassmorphism UI)
- **Brightness** — 0x to 2x
- **Background** — black to midnight blue
- **Star density** — 0.2x to 2x
- **Twinkle intensity** — adjustable
- **Rotation speed** — 0x to 3x
- **Shooting star frequency** — adjustable
- **Fullscreen** toggle
- **Language selector** — 44 languages
- **Reset** to defaults
- Panel stays open until closed (no auto-fade)
- Buttons auto-fade after 4s of mouse inactivity

### Music Player
- **9 space ambient tracks** (royalty-free, local MP3s)
- Full player: play/pause, prev/next, shuffle, repeat
- **Seekable progress bar** with time display
- **Volume slider** with mute toggle
- **Crossfade** between tracks (1-12s, adjustable)
- Smooth crossfade with dual audio elements and ref-swapping
- Instant playback (preload="auto", no delay)
- Playlist with track highlighting

### Internationalization
- **44 languages** supported out of the box
- Covers Europe, Middle East, South Asia, East Asia, Southeast Asia, Africa
- Dropdown selector in settings panel
- French by default

## Tech Stack

- **React 19** + **Vite 8** — fast dev server with HMR
- **Canvas API** — performant rendering at native device pixel ratio
- **Lucide React** — minimal SVG icons
- **Plus Jakarta Sans** — clean Google Font
- **No external state library** — React Context for i18n, refs for performance-critical state
- **Zero backend** — fully static, client-side only

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- npm or yarn

### Installation

```bash
git clone https://github.com/AlxxlaF/starfield-react.git
cd starfield-react
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

The build output is in `dist/` — deploy to any static hosting (Vercel, Netlify, GitHub Pages, etc.).

## Project Structure

```
src/
  App.jsx              # Root component, state management
  App.css              # Slider thumb styling
  index.css            # Global reset styles
  main.jsx             # Entry point
  i18n.jsx             # Translations (44 languages) + LangProvider
  components/
    StarField.jsx      # Canvas starfield renderer (stars, rotation, shooting stars)
    ControlPanel.jsx   # Settings panel (sliders, language, fullscreen)
    MusicPlayer.jsx    # Audio player with crossfade, playlist, custom sliders
public/
  music/               # 9 space ambient MP3 tracks
```

## Adding Music

Place `.mp3` files in `public/music/` and add entries to the `PLAYLIST` array in `src/components/MusicPlayer.jsx`:

```js
{ title: "Track Name", artist: "Artist", url: "/music/filename.mp3" }
```

## Adding Languages

Edit `src/i18n.jsx`:

1. Add a new entry to `translations` using the `T()` helper function
2. Add a new entry to the `LANGUAGES` array

## Customization

All visual parameters are adjustable in real-time through the settings panel. For deeper customization, key constants in `StarField.jsx`:

| Constant | Default | Description |
|---|---|---|
| `BASE_STAR_COUNT` | 15000 | Number of stars at density 1.0 |
| `DEPTH_LAYERS` | 3 | Parallax layers (near/mid/far) |
| Rotation speed | 0.012 rad/s | Base celestial rotation speed |
| Shooting star interval | 8-16s | Time between shooting stars |

## Music Credits

All tracks are royalty-free. Artists:
- Clavier Music, Delosound, FreeMusicForVideo, Monume, Nikita Kondrashev, Viacheslav Starostin

## License

MIT

---

Built with React + Canvas. Designed to feel calm, immersive, and realistic.
