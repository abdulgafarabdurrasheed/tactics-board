import FootballField from "./components/FootballField";
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <div className="field-section">
        <FootballField />
      </div>
      <div className="dashboard-section">
        <h1 style={{ color: 'white' }}>Tactical Engine</h1>
        <p style={{ color: 'var(--text-muted)' }}>Dashboard controls</p>
      </div>
    </div>
  )
}

export default App;