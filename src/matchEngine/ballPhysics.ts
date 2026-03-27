import { position } from "html2canvas/dist/types/css/property-descriptors/position";
import type { Coordinates } from "../types";
import type { BallState } from "./types";

export const executePass = (
    currentBall: BallState,
    targetPosition: Coordinates,
    passerTeam: "home" | 'away'
): BallState => {
    const uiTargetX = passerTeam === 'home' ? targetPosition.x : 100 - targetPosition.x;
    const uiTargetY = passerTeam === 'home' ? targetPosition.y : 100 - targetPosition.y;

    const speed = 2.5;

    const dx = uiTargetX - currentBall.position.x;
    const dy = uiTargetY - currentBall.position.y;


    const length = Math.sqrt(dx * dx + dy * dy);

    return {
        ...currentBall,
        holder: null,
        isLoose: true,
        velocity: {
            x: (dx / length) * speed,
            y: (dy / length) * speed,
        }
    }
};

export const updateLooseBall = (currentBall: BallState): BallState => {
    const newPos = {
        x: currentBall.position.x + currentBall.velocity.x,
        y: currentBall.position.y + currentBall.velocity.y,
    };

    const newVel = {
        x: currentBall.velocity.x * 0.97,
        y: currentBall.velocity.y * 0.97,
    };

    const speed = Math.sqrt(newVel.x * newVel.x + newVel.y * newVel.y);
    const isStillLoose = speed > 0.4;

    return {
        ...currentBall,
        position: newPos,
        velocity: newVel,
        isLoose: isStillLoose,
    };
};