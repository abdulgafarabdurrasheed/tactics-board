import type React from "react";
import type { Player, Phase } from "../types";
import "./PlayerCard.css";

interface PlayerCardProps {
  player: Player;
  phase: Phase;
  isSelected?: boolean;
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent, player: Player) => void;
}

export default function PlayerCard({
  player,
  phase,
  isSelected = false,
  isDragging = false,
  onPointerDown,
}: PlayerCardProps) {
  const pos = player.position[phase];
  const isHome = player.team === "home";
  const themeClass = isHome ? "player-home" : "player-away";
  const selectedClass = isSelected ? "player-selected" : "";

  return (
    <div
      className={`player-card ${themeClass} ${selectedClass}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transition: isDragging
          ? "none"
          : "left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s",
      }}
      onPointerDown={(e) => onPointerDown?.(e, player)}
    >
      {player.number}

      {isSelected && <div className="player-role">{player.role}</div>}
    </div>
  );
}
