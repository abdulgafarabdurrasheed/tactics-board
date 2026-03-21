import type { Player, Phase } from '../types';
import './PlayerCard.css'

interface PlayerCardProps {
    player: Player;
    phase: Phase;
    isSelected?: boolean
}

export default function PlayerCard({ player, phase, isSelected = false }: PlayerCardProps) {
    const pos = player.position[phase];
    const isHome = player.team === 'home';
    const themeClass = isHome ? 'player-home' : 'player-away';
    const selectedClass = isSelected ? 'player-selected' : '';

    return (
        <div
            className={`player-card ${themeClass} ${selectedClass}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
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