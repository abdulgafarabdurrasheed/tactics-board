import type { Player, Coordinates, Phase } from "../types";
import type { BallState } from "./types";

const POSSESSION_RADIUS = 3;

const getDistanceSq = (p1: Coordinates, p2: Coordinates) => {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
};

export const updatePossession = (
    players: Player[],
    currentBall: BallState,
    phase: Phase
): BallState => {
    if (currentBall.isLoose) {
        return currentBall;
    }

    let closestPlayer: Player | null = null;
    let minDistanceSq = Infinity;
    
    players.forEach(player => {
        const pos = player.position[phase];
        const targetX = player.team === 'home' ? pos.x : 100 - pos.x;
        const targetY = player.team === 'home' ? pos.y : 100 - pos.y;

        const distSq = getDistanceSq({ x: targetX, y: targetY }, currentBall.position);

        if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closestPlayer = player;
        }
    });

    if (closestPlayer && minDistanceSq <= POSSESSION_RADIUS * POSSESSION_RADIUS) {
        return {
            ...currentBall,
            holder: closestPlayer.id,
            team: closestPlayer.team,
        };
    }

    return {
        ...currentBall,
        holder: null,
    };
};
