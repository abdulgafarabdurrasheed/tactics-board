import FootballField from "./components/FootballField";
import "./App.css";
import { useState, useRef, useEffect } from "react";
import { FORMATIONS, ROLES, PLAYING_STYLES , generateInitialPlayers } from "./constants";
import type {
  Player,
  Phase,
  ToolType,
  Arrow,
  TeamType,
  Coordinates,
  SavedPlay,
} from "./types";
import html2canvas from "html2canvas";
import type { HeatmapView } from "./types";
import { createEmptyGrid, stampPositions, type HeatGrid } from "./heatmapEngine";
import {
  Move,
  Navigation,
  PenTool,
  Trash2,
  Users,
  Download,
  X,
  Check,
  Play,
  Pause,
  Flame,
} from "lucide-react";
import { nextPosition } from "./simulationEngine";
import type { BallState } from './matchEngine/types';
import { updatePossession } from "./matchEngine/possessionSystem";

const SAVED_PLAYERS_KEY = "tactics_board_players";
const SAVED_ARROWS_KEY = "tactics_board_arrows";
const SAVED_BALL_KEY = "tactics_board_ball";
const SAVED_PLAYS_KEY = "tactics_board_saved_plays";

const loadSavedPlayers = (): Player[] => {
  const saved = localStorage.getItem(SAVED_PLAYERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved players", e);
    }
  }
  return generateInitialPlayers();
};

const loadSavedArrows = (): Arrow[] => {
  const saved = localStorage.getItem(SAVED_ARROWS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved arrows", e);
    }
  }
  return [];
};

const loadSavedBall = (): Coordinates => {
  const saved = localStorage.getItem(SAVED_BALL_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return { x: 50, y: 50 };
};

const loadSavedPlays = (): SavedPlay[] => {
  const saved = localStorage.getItem(SAVED_PLAYS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved plays", e);
    }
  }
  return [];
};

function App() {
  const [players, setPlayers] = useState<Player[]>(loadSavedPlayers);
  const [phase, setPhase] = useState<Phase>("offensive");
  const [tool, setTool] = useState<ToolType>("select");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>(loadSavedArrows);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"field" | "dashboard">("field");
  const [isSimulating, setIsSimulating] = useState(false);
  const [playingStyle, setPlayingStyle] = useState(PLAYING_STYLES[0]);
  const [ballPosition, setBallPosition] = useState<Coordinates>(loadSavedBall);
  const [savedPlays, setSavedPlays] = useState<SavedPlay[]>(loadSavedPlays);
  const [isRecording, setIsRecording] = useState(false);
  const [frames, setFrames] = useState<{ players: Player[], ballPosition: Coordinates }[]>([]);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);
  const [heatmapView, setHeatmapView] = useState<HeatmapView>("off");
  const [homeGrid, setHomeGrid] = useState<HeatGrid>(createEmptyGrid);
  const [awayGrid, setAwayGrid] = useState<HeatGrid>(createEmptyGrid);
  const [drawState, setDrawState] = useState({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [activeTeam, setActiveTeam] = useState<TeamType>("home");

  const applyFormation = (formationName: string) => {
    const formation = FORMATIONS[formationName];
    if (!formation) return;

    setPlayers((prev) => {
      const teamPlayers = prev.filter((pl) => pl.team === activeTeam);

      return prev.map((p) => {
        if (p.team !== activeTeam) return p;

        const fIdx = teamPlayers.findIndex((pl) => pl.id === p.id);

        if (fIdx === -1 || fIdx >= formation.length) return p;

        const newPos = formation[fIdx];
        const targetX = activeTeam === "home" ? newPos.x : 100 - newPos.x;
        const targetY = activeTeam === "home" ? newPos.y : 100 - newPos.y;

        return {
          ...p,
          number: newPos.n,
          role: newPos.r,
          position: {
            ...p.position,
            [phase]: { x: targetX, y: targetY },
          },
        };
      });
    });
  };

  const updatePlayer = (field: keyof Player, value: string | number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === selectedPlayerId ? { ...p, [field]: value } : p,
      ),
    );
  };
  const exportBoard = async () => {
    showToast("Preparing export...");
    try {
      const element = document.getElementById("field-export-area");
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: "#020617",
        scale: 2,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `Tactics-Board-${Date.now()}.png`;
      link.href = image;
      link.click();

      showToast("Export successful!");
    } catch (err) {
      console.error(err);
      showToast("Export failed!");
    }
  };
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const clearArrows = () => setArrows([]);

  const saveCurrentPlay = () => {
    const newPlay: SavedPlay = {
      id: Date.now().toString(),
      name: `Tactic ${savedPlays.length + 1}`,
      players: JSON.parse(JSON.stringify(players)),
      arrows: JSON.parse(JSON.stringify(arrows)),
      ballPosition: { ...ballPosition },
      phase,
    };
    setSavedPlays((prev) => [...prev, newPlay]);
  };

  const loadPlay = (play: SavedPlay) => {
    setPlayers(JSON.parse(JSON.stringify(play.players)));
    setArrows(JSON.parse(JSON.stringify(play.arrows)));
    setBallPosition({ ...play.ballPosition });
    setPhase(play.phase);
    setTool("select");
  };

  const deletePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPlays((prev) => prev.filter((p) => p.id !== id));
  };
  const [dragged, setDragged] = useState({
    isDragging: false,
    id: null as string | null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(SAVED_PLAYERS_KEY, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(SAVED_ARROWS_KEY, JSON.stringify(arrows));
  }, [arrows]);
  useEffect(() => {
    localStorage.setItem(SAVED_BALL_KEY, JSON.stringify(ballPosition));
  }, [ballPosition]);
  useEffect(() => {
    localStorage.setItem(SAVED_PLAYS_KEY, JSON.stringify(savedPlays));
  }, [savedPlays]);

  const getCoordinates = (
    e: globalThis.MouseEvent | globalThis.TouchEvent | React.PointerEvent,
  ) => {
    if (!fieldRef.current) return { x: 0, y: 0 };
    const rect = fieldRef.current.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as globalThis.MouseEvent).clientX;
      clientY = (e as globalThis.MouseEvent).clientY;
    }

    const x = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, ((clientY - rect.top) / rect.height) * 100),
    );
    return { x, y };
  };

  const handlePlayerPosition = (e: React.PointerEvent, player: Player) => {
    if (tool !== "select") return;
    e.stopPropagation();

    setSelectedPlayerId(player.id);
    const coordinates = getCoordinates(e);

    setDragged({
      isDragging: true,
      id: player.id,
      startX: coordinates.x,
      startY: coordinates.y,
      currentX: player.position[phase].x,
      currentY: player.position[phase].y,
    });
  };

  const handleBallPosition = (e: React.PointerEvent) => {
    if (tool !== "select") return;
    e.stopPropagation();
    setSelectedPlayerId(null);

    const coordinates = getCoordinates(e);
    setDragged({
      isDragging: true,
      id: "match-ball",
      startX: coordinates.x,
      startY: coordinates.y,
      currentX: ballPosition.x,
      currentY: ballPosition.y,
    });
  };

  const handleFieldPointerDown = (e: React.PointerEvent) => {
    if (tool === "select") {
      setSelectedPlayerId(null);
      return;
    }
    e.preventDefault();
    const coordinates = getCoordinates(e);
    setDrawState({
      isDrawing: true,
      startX: coordinates.x,
      startY: coordinates.y,
      currentX: coordinates.x,
      currentY: coordinates.y,
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!dragged.isDragging && !drawState.isDrawing) return;

      const coordinates = getCoordinates(e);

      if (dragged.isDragging && dragged.id) {
        const deltaX = coordinates.x - dragged.startX;
        const deltaY = coordinates.y - dragged.startY;
        const newX = Math.max(0, Math.min(100, dragged.currentX + deltaX));
        const newY = Math.max(0, Math.min(100, dragged.currentY + deltaY));

        if (dragged.id === "match-ball") {
          setBallPosition({ x: newX, y: newY });
        } else {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === dragged.id
                ? {
                    ...p,
                    position: { ...p.position, [phase]: { x: newX, y: newY } },
                  }
                : p,
            ),
          );
        }

        setDragged((prev) => ({
          ...prev,
          startX: coordinates.x,
          startY: coordinates.y,
          currentX: newX,
          currentY: newY,
        }));
      } else if (drawState.isDrawing) {
        const coordinates = getCoordinates(e);
        setDrawState((prev) => ({
          ...prev,
          currentX: coordinates.x,
          currentY: coordinates.y,
        }));
      }
    };

    const handlePointerUp = () => {
      if (dragged.isDragging) {
        setDragged((prev) => ({ ...prev, isDragging: false, id: null }));
      }
      if (drawState.isDrawing) {
        const dx = drawState.currentX - drawState.startX;
        const dy = drawState.currentY - drawState.startY;
        if (Math.sqrt(dx * dx + dy * dy) > 2) {
          setArrows((prev) => [
            ...prev,
            {
              id: Date.now(),
              start: { x: drawState.startX, y: drawState.startY },
              end: { x: drawState.currentX, y: drawState.currentY },
              type: tool as "pass" | "run",
            },
          ]);
        }
        setDrawState((prev) => ({ ...prev, isDrawing: false }));
      }
    };

    if (dragged.isDragging || drawState.isDrawing) {
      window.addEventListener(
        "pointermove",
        handlePointerMove as EventListener,
      );
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove as EventListener,
      );
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragged, phase, drawState, tool]);

  useEffect(() => {
      let intervalId: ReturnType<typeof setInterval>;
      if (isSimulating) {
        intervalId = setInterval(() => {
          if (!dragged.isDragging || dragged.id === 'match-ball') {
            const currentBallState: BallState = {
              holder: null,
              team: null,
              position: ballPosition,
              velocity: { x: 0, y: 0 },
              isLoose: false,
            };

            const possessionBall = updatePossession(players, currentBallState, phase);
            const nextPlayers = nextPosition(players, possessionBall, phase, playingStyle);
            setPlayers(nextPlayers);

            if (possessionBall.holder) {
              const holder = nextPlayers.find(p => p.id === possessionBall.holder);
              if (holder) {
                const hPos = holder.position[phase];

                const targetX = holder.team === 'home' ? hPos.x : 100 - hPos.x;
                const targetY = holder.team === 'home' ? hPos.y : 100 - hPos.y;

                setBallPosition({ x: targetX, y: targetY + 1.5 });
              }
            }
          }
        }, 33);
      }
      return () => clearInterval(intervalId);
  }, [isSimulating, ballPosition, phase, playingStyle, dragged.isDragging, dragged.id, players]);

  useEffect(() => {
    if(!isSimulating || heatmapView === 'off') return;
    const interval = setInterval(() => {
      const homePlayers = players
        .filter(p => p.team === 'home')
        .map(p => p.position[phase])
      const awayPlayers = players
        .filter(p => p.team === 'away')
        .map(p => p.position[phase])

      setHomeGrid(prev => stampPositions(prev, homePlayers));
      setAwayGrid(prev => stampPositions(prev, awayPlayers))
      
    }, 200)
    return () => clearInterval(interval)
  }, [isSimulating, players, phase, heatmapView])

  const clearHeatmap = () => {
    setHomeGrid(createEmptyGrid());
    setAwayGrid(createEmptyGrid());
  };

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setFrames(prev => [...prev, {
        players: JSON.parse(JSON.stringify(players)),
        ballPosition: { ...ballPosition }
      }]);
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording, players, ballPosition])
  
  const displayPlayers = (replayIndex !== null && frames[replayIndex]) ? frames[replayIndex].players : players;
  const displayBall = (replayIndex !== null && frames[replayIndex]) ? frames[replayIndex].ballPosition : ballPosition;

  return (
    <div className="app-layout">
      <div className="mobile-tabs">
        <button
          className={`tab-btn ${activeTab === "field" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("field")}
        >
          Field View
        </button>
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard View
        </button>
      </div>
      <div
        className={`field-section ${activeTab === "dashboard" ? "mobile-hidden" : ""}`}
      >
        <div className="phase-overlay">
          <button
            onClick={() => setPhase("offensive")}
            className={`phase-btn ${phase === "offensive" ? "active-offense" : ""}`}
          >
            {" "}
            In Possession
          </button>
          <button
            onClick={() => setPhase("defensive")}
            className={`phase-btn ${phase === "defensive" ? "active-defense" : ""}`}
          >
            {" "}
            Out of Possession
          </button>
        </div>
        <FootballField
          players={displayPlayers}
          phase={phase}
          fieldRef={fieldRef}
          selectedPlayerId={selectedPlayerId}
          onPlayerPointerDown={handlePlayerPosition}
          onFieldPointerDown={handleFieldPointerDown}
          arrows={arrows}
          drawState={drawState}
          tool={tool}
          ballPosition={displayBall}
          onBallPointerDown={handleBallPosition}
          draggedId={dragged.id}
          activeTeam={activeTeam}
          heatmapView={heatmapView}
          homeGrid={homeGrid}
          awayGrid={awayGrid}
        />
      </div>
      <div
        className={`dashboard-section ${activeTab === "field" ? "mobile-hidden" : ""}`}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                color: "white",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Tactical Engine
            </h1>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
              }}
            >
              Football Manager Dashboard controls
            </p>
          </div>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="save-play-btn"
            style={{
              width: "auto",
              backgroundColor: isSimulating
                ? "var(--accent-rose)"
                : "var(--accent-cyan)",
              color: "var(--bg-darker)",
              borderColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isSimulating ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {isSimulating ? "HALT SIM" : "PLAY SIM"}
          </button>
        </div>

        <div className="tools-container">
          <h2 className="tools-header">Drawing Tools</h2>
          <div className="tools-grid">
            <button
              onClick={() => setTool("select")}
              className={`tool-button ${tool === "select" ? "active-select" : ""}`}
            >
              <Move size={18} />
            </button>
            <button
              onClick={() => setTool("pass")}
              className={`tool-button ${tool === "pass" ? "active-pass" : ""}`}
            >
              <Navigation size={18} style={{ transform: "rotate(45deg)" }} />
            </button>
            <button
              onClick={() => setTool("run")}
              className={`tool-button ${tool === "run" ? "active-run" : ""}`}
            >
              <PenTool size={18} />
            </button>
            <button onClick={clearArrows} className="tool-button clear-btn">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="config-card">
            <h2 className="tools-header" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Flame size={14} /> Heatmap
            </h2>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {(['off', 'home', 'away', 'both'] as HeatmapView[]).map(view => (
                <button
                  key={view}
                  onClick={() => setHeatmapView(view)}
                  style={{
                  flex: 1,
                  padding: '0.375rem',
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: heatmapView === view ? view === 'home' ? 'var(--accent-cyan)' : view === 'away' ? 'var(--accent-rose)' : view === 'both' ? '#a78bfa' : 'var(--bg-panel)' : 'transparent',
                  color: heatmapView === view ? 'black' : 'var(--text-muted)',
                }}
                >
                  {view}
                </button>
              ))}
            </div>
            {heatmapView !== 'off' && (
            <button
              onClick={clearHeatmap}
              className="formation-btn"
              style={{ width: '100%', color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
            >
              Clear Heatmap
            </button>
          )}
        </div>

        <div className="config-card">
          <h2 className="tools-header">Manager Playstyle</h2>
          <select 
            value={playingStyle}
            onChange={(e) => setPlayingStyle(e.target.value)}
            className="input-field"
            style={{ fontWeight: 'bold' }}
          >
            {PLAYING_STYLES.map(ps => <option key={ps} value={ps}>{ps}</option>)}
          </select>
        </div>

        <div className="config-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <h2 className="tools-header" style={{ margin: 0 }}>
              Formations
            </h2>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button
                onClick={() => setActiveTeam("home")}
                style={{
                  fontSize: "0.625rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  background:
                    activeTeam === "home"
                      ? "var(--accent-cyan)"
                      : "transparent",
                  color: activeTeam === "home" ? "black" : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                HOME
              </button>
              <button
                onClick={() => setActiveTeam("away")}
                style={{
                  fontSize: "0.625rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  background:
                    activeTeam === "away"
                      ? "var(--accent-rose)"
                      : "transparent",
                  color: activeTeam === "away" ? "black" : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                AWAY
              </button>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem",
            }}
          >
            {Object.keys(FORMATIONS).map((f) => (
              <button
                key={f}
                onClick={() => applyFormation(f)}
                className="formation-btn"
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="config-card">
          <h2 className="tools-header">Playbook</h2>
          <button onClick={saveCurrentPlay} className="save-play-btn">
            Save current Board
          </button>

          {savedPlays.length > 0 && (
            <div className="playbook-list">
              {savedPlays.map((play) => (
                <div key={play.id} className="play-item">
                  <button
                    onClick={() => loadPlay(play)}
                    className="play-load-btn"
                  >
                    {play.name}
                  </button>
                  <button
                    onClick={(e) => deletePlay(play.id, e)}
                    className="play-del-btn flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="config-card" style={{ flex: 1 }}>
          <h2 className="tools-header">Player Config</h2>
          {selectedPlayer ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.625rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Player Name
                </label>
                <input
                  type="text"
                  value={selectedPlayer.name}
                  onChange={(e) => updatePlayer("name", e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.625rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Jersey Number
                </label>
                <input
                  type="number"
                  value={selectedPlayer.number}
                  onChange={(e) =>
                    updatePlayer("number", parseInt(e.target.value) || 1)
                  }
                  className="input-field"
                  min="1"
                  max="99"
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.625rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Playstyle Role
                </label>
                <select
                  value={selectedPlayer.role}
                  onChange={(e) => updatePlayer("role", e.target.value)}
                  className="input-field"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                opacity: 0.5,
                padding: "2rem 0",
              }}
            >
              <Users size={32} style={{ marginBottom: "0.5rem" }} />
              <p style={{ fontSize: "0.75rem", textAlign: "center" }}>
                Select a player on the board
                <br />
                to edit properties.
              </p>
            </div>
          )}
        </div>
        <button
          onClick={exportBoard}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#3b82f6",
            color: "var(--bg-darker)",
            fontWeight: "bold",
            border: "none",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            marginTop: "auto",
          }}
        >
          <Download size={18} />
          Export Tactic PNG
        </button>
      
          <div className="config-card">
            <h2 className="tools-header text-rose-500 flex items-center gap-2">
              Action Replay
              {isRecording && <span style={{ width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', animation: 'pulse-radar 1s infinite' }}></span>}
            </h2>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => {
                  if (!isRecording) setFrames([]);
                  setIsRecording(!isRecording)
                  setReplayIndex(null);
                }}
                style={{ flex: 1, padding: '0.5rem', background: isRecording ? 'var(--bg-dark)' : 'rgba(244, 63, 94, 0.1)', color: isRecording ? 'var(--text-muted)' : 'var(--accent-rose)', border: `1px solid ${isRecording ? 'var(--bg-panel)' : 'var(--accent-rose)'}`, borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
              {isRecording ? '⏹ Stop Recording' : '⏺ Record Play'}
              </button>  
            </div>

            {frames.length > 0 && !isRecording && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  Scrub Timeline ({frames.length} frames)
                </label>
                <input
                  type="range"
                  min="0"
                  max={frames.length - 1}
                  value={replayIndex === null ? frames.length - 1 : replayIndex}
                  onChange={(e) => setReplayIndex(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'ew-resize' }}
                />

                <button
                  onClick={() => setReplayIndex(null)}
                  style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '0.25rem' }}
                >
                  &larr; Return to Present
                </button>
              </div>
            )}

          </div>
      </div>
      {toastMessage && (
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--bg-panel)",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 50,
          }}
        >
          <Check size={16} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
