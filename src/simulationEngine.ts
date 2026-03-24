import type { Player, Coordinates } from './types';

const lerp = (start: number, end: number, speed: number) => {
    return start + (end - start) * speed;
};

export const nextPosition = (players: Player[], ballPosition: Coordinates, currentPhase: 'offensive' | 'defensive'): Player[] => {
    return players.map(p => {
        const currentPosition = p.position[currentPhase];
        let targetX = currentPosition.x;
        let targetY = currentPosition.y;
        let speed = 0.02;

        const isHome = p.team === 'home';
        const attackingY = isHome ? 0 : 100;
        const defendingY = isHome ? 100 : 0;

        switch (p.role) {
            case 'Goal Poacher':
            case 'Fox in the Box':
                targetY = attackingY + (isHome ? 20 : -20);
                targetX = ballPosition.x;
                speed = 0.04;
                break;
            
            case 'Prolific Winger':
            case 'Roaming Flank':
            case 'Cross Specialist':
                const isLeft = currentPosition.x < 50;
                targetX = isLeft ? 15 : 85;
                targetY = lerp(currentPosition.y, ballPosition.y + (isHome ? -20 : 20), 0.5);
                speed = 0.05;
                break;

            case 'Box-to-Box':
            case 'The Destroyer':
            case 'Hole Player':
                targetX = ballPosition.x;
                targetY = ballPosition.y + (isHome ? 10 : -10);
                speed = 0.06;
                break;

            case 'Anchor Man':
            case 'Build Up':
            case 'Defensive Fullback':
                targetX = ballPosition.x;
                targetY = defendingY + (isHome ? -30 : 30);
                speed = 0.03;
                break;

            case 'Offensive Goalkeeper':
            case 'Defensive Goalkeeper':
                targetX = 50; 
                targetY = defendingY + (isHome ? -5 : 5);
                if (Math.abs(ballPosition.y - defendingY) < 30) {
                    targetY = defendingY + (isHome ? -15 : 15);
                    targetX = lerp(50, ballPosition.x, 0.3);
                }
                speed = 0.08;
                break;
            
            default: 
                targetX = currentPosition.x;
                targetY = currentPosition.y;
                speed = 0;
        }

        return {
            ...p,
            position: {
                ...p.position,
                [currentPhase]: {
                    x: lerp(currentPosition.x, targetX, speed),
                    y: lerp(currentPosition.y, targetY, speed),
                }
            }
        }
    });
};