export type Phase = 'offensive' | 'defensive';
export type ToolType = 'select' | 'pass' | 'run';
export type TeamType = 'home' | 'away';

export interface Coordinates {
    x: number;
    y: number;
}

export interface PlayerPosition {
    offensive: Coordinates;
    defensive: Coordinates;
}

export interface Player {
    id: string;
    team: TeamType;
    number: number;
    name: string;
    role: string;
    position: PlayerPosition
}

export interface Arrow {
    id: number;
    start: Coordinates;
    end: Coordinates;
    type: ToolType;
}

export interface FormationPosition {
    n: number;
    r: string;
    x: number;
    y: number;
}