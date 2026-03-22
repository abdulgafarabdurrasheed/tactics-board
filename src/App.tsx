import FootballField from "./components/FootballField";
import "./App.css";
import { useState, useRef, useEffect } from "react";
import { generateInitialPlayers } from "./constants";
import type { Player, Phase, ToolType, Arrow } from "./types";
import { Move, Navigation, PenTool, Trash2 } from 'lucide-react'

function App() {
  const [players, setPlayers] = useState<Player[]>(generateInitialPlayers());
  const [phase, setPhase] = useState<Phase>("offensive");
  const [tool, setTool] = useState<ToolType>("select");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [drawState, setDrawState] = useState({
    isDrawing: false, startX: 0, startY: 0, currentX: 0, currentY: 0
  });
  const clearArrows = () => setArrows([]);

  const [dragged, setDragged] = useState({
    isDragging: false,
    id: null as string | null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const fieldRef = useRef<HTMLDivElement>(null);

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

        setDragged((prev) => ({
          ...prev,
          startX: coordinates.x,
          startY: coordinates.y,
          currentX: newX,
          currentY: newY,
        }));
      } else if (drawState.isDrawing) {
        const coordinates = getCoordinates(e);
        setDrawState(prev => ({ ...prev, currentX: coordinates.x, currentY: coordinates.y }));
      }
    };

    const handlePointerUp = () => {
      if (dragged.isDragging) {
        setDragged((prev) => ({ ...prev, isDragging: false, id: null }));
      }
      if (drawState.isDrawing) {
        const dx = drawState.currentX - drawState.startX;
        const dy = drawState.currentY - drawState.startY;
        if (Math.sqrt(dx*dx + dy*dy) > 2) {
          setArrows(prev => [...prev, {
            id: Date.now(),
            start: { x: drawState.startX, y: drawState.startY },
            end: { x: drawState.currentX, y: drawState.currentY },
            type: tool as 'pass' | 'run'
          }])
        }
        setDrawState(prev => ({ ...prev, isDrawing: false }));
      }
    };
    
    if (dragged.isDragging || drawState.isDrawing) {
      window.addEventListener("pointermove", handlePointerMove as EventListener);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove as EventListener);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragged, phase, drawState, tool]);

  return (
    <div className="app-layout">
      <div className="field-section">
        <FootballField
          players={players}
          phase={phase}
          fieldRef={fieldRef}
          selectedPlayerId={selectedPlayerId}
          onPlayerPointerDown={handlePlayerPosition}
          onFieldPointerDown={handleFieldPointerDown}
          arrows={arrows}
          drawState={drawState}
          tool={tool}
        />
      </div>
      <div className="dashboard-section">
        <div>
          <h1 style={{ color: "white", textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Tactical Engine
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: '0.75rem', marginTop: '0.25rem' }}>Football Manager Dashboard controls</p>
        </div>

        <div className="tools-container">
          <h2 className="tools-header">
            Drawing Tools
          </h2>
          <div className="tools-grid">
            <button
              onClick={() => setTool('select')}
              className={`tool-button ${tool === 'select' ? 'active-select' : ''}`}
            >
              <Move size={18} />
            </button>
            <button
              onClick={() => setTool('pass')}
              className={`tool-button ${tool === 'pass' ? 'active-pass' : ''}`}
            >
              <Navigation size={18} style={{ transform: 'rotate(45deg)' }} />
            </button>
            <button
              onClick={() => setTool('run')}
              className={`tool-button ${tool === 'run' ? 'active-run' : ''}`}
            >
              <PenTool size={18} />
            </button>
            <button
              onClick={clearArrows}
              className="tool-button clear-btn"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
