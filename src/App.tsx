import FootballField from "./components/FootballField";
import './App.css';
import { useState } from 'react';
import { generateInitialPlayers } from "./constants";
import type { Player, Phase } from "./types";

function App() {
  const [players, setPlayers] = useState<Player[]>(generateInitialPlayers());
  const [phase, setPhase] = useState<Phase>('offensive');
  
  return (
    <div className="app-layout">
      <div className="field-section">
        <FootballField players={players} phase={phase} />
      </div>
      <div className="dashboard-section">
        <h1 style={{ color: 'white' }}>Tactical Engine</h1>
        <p style={{ color: 'var(--text-muted)' }}>Dashboard controls</p>
      </div>
    </div>
  )
}

export default App;