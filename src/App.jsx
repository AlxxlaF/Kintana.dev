import { useState } from "react";
import StarField from "./components/StarField";
import ControlPanel, { DEFAULT_SETTINGS } from "./components/ControlPanel";
import MusicPlayer from "./components/MusicPlayer";
import { LangProvider } from "./i18n";

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  return (
    <LangProvider>
      <StarField settings={settings} />
      <ControlPanel settings={settings} onChange={setSettings} />
      <MusicPlayer />
    </LangProvider>
  );
}

export default App;
