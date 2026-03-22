import type { Player, Phase } from '../types';
import PlayerCard from './PlayerCard';
import './FootballField.css'

interface FootballFieldProps {
    players: Player[];
    phase: Phase;
    fieldRef: React.RefObject<HTMLDivElement | null>;
    selectedPlayerId: string | null;
    onPlayerPointerDown: (e: React.PointerEvent, player: Player) => void;
}

export default function FootballField({ players, phase, fieldRef, selectedPlayerId, onPlayerPointerDown }: FootballFieldProps) {
    return (
        <div id="field-export-area" className="field-container" ref={fieldRef}>
            <svg className="field-background" xmlns="http://www.w3.org/2000/svg">
                <rect x="2%" y="2%" width="96%" height="96%" fill="none" stroke="white" strokeWidth="2" />
                <line x1="2%" y1="50%" x2="98%" y2="50%" stroke="white" strokeWidth="2" />
                
                <circle cx="50%" cy="50%" r="15%" fill="none" stroke="white" strokeWidth="2" />
                <circle cx="50%" cy="50%" r="1%" fill="white" />
                
                <rect x="25%" y="2%" width="50%" height="16%" fill="none" stroke="white" strokeWidth="2" />
                <rect x="38%" y="2%" width="24%" height="6%" fill="none" stroke="white" strokeWidth="2" />

                <rect x="25%" y="82%" width="50%" height="16%" fill="none" stroke="white" strokeWidth="2" />
                <rect x="38%" y="92%" width="24%" height="6%" fill="none" stroke="white" strokeWidth="2" />
            </svg>

            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {players.map(player => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        phase={phase}
                        isSelected={selectedPlayerId === player.id}
                        onPointerDown={onPlayerPointerDown}
                    />
                ))}
            </div>
    </div>
    )
}