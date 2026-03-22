import type React from 'react';
import type { Player, Phase } from '../types';
import './PlayerCard.css'

interface PlayerCardProps {
    player: Player;
    phase: Phase;
    isSelected?: boolean
    onPointerDown?: (e: React.PointerEvent, player: Player) => void;
}

export default function PlayerCard({ player, phase, isSelected = false, onPointerDown }: PlayerCardProps) {
    const pos = player.position[phase];
    const isHome = player.team === 'home';
    const themeClass = isHome ? 'player-home' : 'player-away';
    const selectedClass = isSelected ? 'player-selected' : '';

    return (
        <div
            className={`player-card ${themeClass} ${selectedClass}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onPointerDown={(e) => onPointerDown?.(e, player)}
        >
            {player.number}

            {isSelected && (
                <div className="player-role">
                    {player.role}
                </div>
            )}

        </div>
    )
}