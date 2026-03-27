import type { Coordinates, TeamType } from "../types"

export interface BallState {
    holder: string | null;
    team: TeamType | null;
    position: Coordinates;
    velocity: Coordinates;
    isLoose: boolean;
}

export interface MatchEvent {
    id: string;
    time: number;
    type: 'pass' | 'shot' | 'goal' | 'interception' | 'tackle' | 'foul' | 'half-time' | 'kick-off';
    team: TeamType;
    playerId?: string;
    targetId?: string;
    position: Coordinates;
    success: boolean; 
}

export interface MatchState {
    clock: number;
    half: 1 | 2;
    score: { home: number; away: number };
    possession: BallState;
    events: MatchEvent[];
    isPlaying: boolean;
    isPaused: boolean;
}