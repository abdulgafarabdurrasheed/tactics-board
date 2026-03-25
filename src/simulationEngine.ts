import type { Player, Coordinates } from "./types";

const lerp = (start: number, end: number, speed: number) => {
  return start + (end - start) * speed;
};

export const nextPosition = (
  players: Player[],
  ballPosition: Coordinates,
  currentPhase: "offensive" | "defensive",
  managerStyle: string,
): Player[] => {
  return players.map((p) => {
    const currentPosition = p.position[currentPhase];
    let targetX = currentPosition.x;
    let targetY = currentPosition.y;
    let speed = 0.02;

    const isHome = p.team === "home";
    const attackingY = isHome ? 0 : 100;
    const defendingY = isHome ? 100 : 0;
    const ballDistance = Math.sqrt(
      Math.pow(ballPosition.x - currentPosition.x, 2) +
        Math.pow(ballPosition.y - currentPosition.y, 2),
    );

    switch (p.role) {
      case "Goal Poacher":
      case "Fox in the Box":
        targetY = attackingY + (isHome ? 15 : -15);
        targetX = lerp(currentPosition.x, ballPosition.x, 0.4);
        speed = 0.04;
        break;

      case "Prolific Winger":
      case "Roaming Flank":
      case "Cross Specialist":
        const isLeft = currentPosition.x < 50;
        targetX = isLeft ? 15 : 85;
        targetY = lerp(currentPosition.y, ballPosition.y + (isHome ? -10 : 10), 0.5);
        speed = 0.05;
        break;

      case "Box-to-Box":
      case "Hole Player":
        targetX = lerp(currentPosition.x, ballPosition.x, 0.6);
        targetY = ballPosition.y + (isHome ? 15 : -15);
        speed = 0.06;
        break;

      case "Anchor Man":
      case "The Destroyer":
      case "Build Up":
        targetX = lerp(currentPosition.x, ballPosition.x, 0.3);
        targetY = defendingY + (isHome ? -35 : 35);
        speed = 0.03;
        break;
      case "Offensive Goalkeeper":
      case "Defensive Goalkeeper":
        targetX = 50;
        targetY = defendingY + (isHome ? -5 : 5);
        if (Math.abs(ballPosition.y - defendingY) < 35) {
          targetY = defendingY + (isHome ? -15 : 15);
          targetX = lerp(50, ballPosition.x, 0.4);
        }
        speed = 0.08;
        break;

      default:
        targetX = currentPosition.x;
        targetY = currentPosition.y;
        speed = 0;
    }

    if (isHome && currentPhase === "offensive") {
      if (managerStyle === "Possession Game") {
        if (ballDistance > 15 && p.role !== "Offensive Goalkeeper") {
          targetX = lerp(targetX, ballPosition.x, 0.3);
          targetY = lerp(targetY, ballPosition.y, 0.3);
        }
      } else if (managerStyle === "Quick Counter") {
        if (
          [
            "Goal Poacher",
            "Fox in the Box",
            "Prolific Winger",
            "Hole Player",
          ].includes(p.role)
        ) {
          targetY = 5;
          speed *= 1.8;
        }
      } else if (managerStyle === "Out Wide") {
        if (
          [
            "Prolific Winger",
            "Cross Specialist",
            "Offensive Fullback",
          ].includes(p.role)
        ) {
          const isLeftSide = currentPosition.x < 50;
          targetX = isLeftSide ? 2 : 98;
        }
      } else if (managerStyle === "Long Ball") {
        if (
          !["Goal Poacher", "Fox in the Box"].includes(p.role) &&
          p.role !== "Offensive Goalkeeper"
        ) {
          targetY = lerp(targetY, defendingY - 40, 0.5);
        }
      }
    }

    return {
      ...p,
      position: {
        ...p.position,
        [currentPhase]: {
          x: lerp(currentPosition.x, targetX, Math.min(speed, 1)),
          y: lerp(currentPosition.y, targetY, Math.min(speed, 1)),
        },
      },
    };
  });
};
