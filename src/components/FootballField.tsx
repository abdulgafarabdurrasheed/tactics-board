import type { Player, Phase, ToolType, Arrow, Coordinates } from "../types";
import PlayerCard from "./PlayerCard";
import "./FootballField.css";
import { PASSING_RANGES } from "../constants";

interface FootballFieldProps {
  players: Player[];
  phase: Phase;
  fieldRef: React.RefObject<HTMLDivElement | null>;
  selectedPlayerId: string | null;
  onPlayerPointerDown: (e: React.PointerEvent, player: Player) => void;
  onFieldPointerDown: (e: React.PointerEvent) => void;
  arrows: Arrow[];
  drawState: {
    isDrawing: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  };
  tool: ToolType;
  ballPosition: Coordinates;
  onBallPointerDown: (e: React.PointerEvent) => void;
  draggedId: string | null;
}

export default function FootballField({
  players,
  phase,
  fieldRef,
  selectedPlayerId,
  onPlayerPointerDown,
  onFieldPointerDown,
  arrows,
  drawState,
  tool,
  ballPosition,
  onBallPointerDown,
  draggedId,
}: FootballFieldProps) {

  const activePlayer = players.find(p => p.id === selectedPlayerId);
  const passingRange = activePlayer ? (PASSING_RANGES[activePlayer.role] || "12rem") : "0";

  return (
    <div
      id="field-export-area"
      className="field-container"
      ref={fieldRef}
      onPointerDown={onFieldPointerDown}
    >
      <svg className="field-background" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="2%"
          y="2%"
          width="96%"
          height="96%"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <line
          x1="2%"
          y1="50%"
          x2="98%"
          y2="50%"
          stroke="white"
          strokeWidth="2"
        />

        <circle
          cx="50%"
          cy="50%"
          r="15%"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <circle cx="50%" cy="50%" r="1%" fill="white" />

        <rect
          x="25%"
          y="2%"
          width="50%"
          height="16%"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <rect
          x="38%"
          y="2%"
          width="24%"
          height="6%"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        <rect
          x="25%"
          y="82%"
          width="50%"
          height="16%"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <rect
          x="38%"
          y="92%"
          width="24%"
          height="6%"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
      </svg>

      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <defs>
          <marker
            id="arrowhead-pass"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#facc15" />
          </marker>
          <marker
            id="arrowhead-run"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
          </marker>
        </defs>

        {arrows.map((arr) => (
          <line
            key={arr.id}
            x1={`${arr.start.x}%`}
            y1={`${arr.start.y}%`}
            x2={`${arr.end.x}%`}
            y2={`${arr.end.y}%`}
            stroke={arr.type === "pass" ? "#facc15" : "#f97316"}
            strokeWidth="3"
            strokeDasharray={arr.type === "run" ? "6,4" : "none"}
            markerEnd={`url(#arrowhead-${arr.type})`}
            opacity="0.8"
          />
        ))}

        {drawState.isDrawing && (
          <line
            x1={`${drawState.startX}%`}
            y1={`${drawState.startY}%`}
            x2={`${drawState.currentX}%`}
            y2={`${drawState.currentY}%`}
            stroke={tool === "pass" ? "#facc15" : "#f97316"}
            strokeWidth="3"
            strokeDasharray={tool === "run" ? "6,4" : "none"}
            markerEnd={`url(#arrowhead-${tool})`}
            opacity="0.8"
          />
        )}
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >

        {activePlayer && (
          <div
            className={`threat-zone ${activePlayer.team === "home" ? "threat-home" : "threat-away"}`}
            style={{
              width: passingRange,
              height: passingRange,
              left: `${activePlayer.position[phase].x}%`,
              top: `${activePlayer.position[phase].y}%`,
              transition: draggedId === activePlayer.id ? "none" : undefined,
            }}
          >

          </div>
        )}
        <div
          className="match-ball"
          style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
          onPointerDown={onBallPointerDown}
        >

        </div>

        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            phase={phase}
            isSelected={selectedPlayerId === player.id}
            isDragging={draggedId === player.id}
            onPointerDown={onPlayerPointerDown}
          />
        ))}
      </div>
    </div>
  );
}
