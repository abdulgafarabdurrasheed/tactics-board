import FootballField from "./components/FootballField";
import "./App.css";
import { useState, useRef, useEffect } from "react";
import { generateInitialPlayers } from "./constants";
import type { Player, Phase, ToolType } from "./types";

function App() {
  const [players, setPlayers] = useState<Player[]>(generateInitialPlayers());
  const [phase, setPhase] = useState<Phase>("offensive");
  const [tool, setTool] = useState<ToolType>("select");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!dragged.isDragging || !dragged.id) return;

      const coordinates = getCoordinates(e);
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
    };

    const handlePointerUp = () => {
      if (dragged.isDragging) {
        setDragged((prev) => ({ ...prev, isDragging: false, id: null }));
      }
    };

    if (dragged.isDragging) {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("touchmove", handlePointerMove, {
        passive: false,
      });
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchend", handlePointerUp);
    }

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [dragged, phase]);

  return (
    <div className="app-layout">
      <div className="field-section">
        <FootballField
          players={players}
          phase={phase}
          fieldRef={fieldRef}
          selectedPlayerId={selectedPlayerId}
          onPlayerPointerDown={handlePlayerPosition}
        />
      </div>
      <div className="dashboard-section">
        <h1 style={{ color: "white" }}>Tactical Engine</h1>
        <p style={{ color: "var(--text-muted)" }}>Dashboard controls</p>
      </div>
    </div>
  );
}

export default App;
