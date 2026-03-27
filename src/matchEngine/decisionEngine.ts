import type { Player, Coordinates, Phase } from '../types';
import { passVisionCalc } from '../simulationEngine';

const lastDecisionTime: Record<string, number> = {};

export interface PassDecision {
    action: 'pass' | 'dribble';
    targetId?: string;
    targetPosition?: Coordinates;
}

export const evaluateDecisions = (
    holder: Player,
    players: Player,
    ballPosition: Coordinates,
    phase: Phase
): PassDecision => {
    const now = Date.now();

    if (lastDecisionTime[holder.id] < 1500) {
        return { action: 'dribble' };
    }

    const passingOptions = passVisionCalc(ballPosition, players, phase, holder.team);
    const validTargets = passingOptions.filter(opt => !opt.isBlocked && opt.isValid && opt.id !== holder.id);

    if (validTargets.length > 0) {
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];

        lastDecisionTime[holder.id] = now;
        return {
            action: 'pass',
            targetId: target.id,
            targetPosition: target.target
        };
    }

    return { action: 'dribble' };
};