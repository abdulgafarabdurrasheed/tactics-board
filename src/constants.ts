import { Player, FormationPosition } from './types';

export const RATIO = 2/3

export const ROLES = [
    "Goal Poacher", "Fox in the Box", "Dummy Runner", "Deep-Lying Forward",
    "Creative Playmaker", "Prolific Winger", "Roaming Flank", "Cross Specialist",
    "Classic No. 10", "Hole Player", "Box-to-Box", "Orchestrator", "Anchor Man",
    "The Destroyer", "Build up", "Extra Frontman", "Offensive Fullback",
    "Defensive Fullback", "Offensive Goalkeeper", "Defensive Goalkeeper"
];

export const FORMATIONS: Record<string, FormationPosition[]> = {
    "4-3-3": [
        { n: 1, r: "Offensive Goalkeeper", x: 50, y: 90 },
        { n: 4, r: "Offensive Fullback", x: 20, y: 75 },
        { n: 4, r: "Build Up", x: 40, y: 80 },
        { n: 5, r: "The Destroyer", x: 60, y: 80 },
        { n: 2, r: "Defensive Fullback", x: 80, y: 75 },
        { n: 8, r: "Box-to-Box", x: 30, y: 60 },
        { n: 6, r: "Anchor Man", x: 40, y: 60 },
        { n: 10, r: "Classic No. 10", x: 50, y: 60 },
        { n: 7, r: "Prolific Winger", x: 20, y: 40 },
        { n: 9, r: "Goal Poacher", x: 50, y: 30 },
        { n: 11, r: "Roaming Flank", x: 80, y: 40 }
    ],
    "4-2-1-3": [
        { n: 1, r: "Defensive Goalkeeper", x: 50, y: 90 },
        { n: 3, r: "Defensive Fullback", x: 20, y: 75 },
        { n: 4, r: "Build Up", x: 40, y: 80 },
        { n: 5, r: "Build up", x: 60, y: 80 },
        { n: 2, r: "Defensive Fullback", x: 80, y: 75 },
        { n: 6, r: "Anchhor Man", x: 30, y: 60 },
        { n: 8, r: "Orchestrator", x: 40, y: 60 },
        { n: 10, r: "Classic No. 10", x: 50, y: 60 },
        { n: 7, r: "Prolific Winger", x: 20, y: 40 },
        { n: 9, r: "Goal Poacher", x: 50, y: 30 },
        { n: 11, r: "Roaming Flank", x: 80, y: 40 }
    ],
    "3-5-2": [
        { n: 1, r: "Offensive Goalkeeper", x: 50, y: 92 },
        { n: 4, r: "Build Up", x: 25, y: 80 },
        { n: 5, r: "The Destroyer", x: 50, y: 82 },
        { n: 3, r: "Build Up", x: 75, y: 80 },
        { n: 11, r: "Cross Specialist", x: 15, y: 55 },
        { n: 6, r: "Anchor Man", x: 35, y: 65 },
        { n: 8, r: "Box-to-Box", x: 65, y: 65 },
        { n: 7, r: "Roaming Flank", x: 85, y: 55 },
        { n: 10, r: "Classic No. 10", x: 50, y: 45 },
        { n: 9, r: "Goal Poacher", x: 35, y: 25 },
        { n: 10, r: "Deep-Lying Forward", x: 65, y: 25 }
    ]
}

export const generateInitialPlayers = (): Player[] => {
    const players: Player[] = [];

    FORMATIONS["4-2-1-3"].forEach((p, i) => {
        players.push({
            id: `h-${i}`, team: 'home', number: p.n, name: `Player ${p.n}`, role: p.r,
            position: { offensive: { x: p.x, y: p.y }, defensive: { x: p.x, y: Math.min(100, p.y + 10) } }
        });
    });

    FORMATIONS["4-3-3"].forEach((p, i) => {
        players.push({
        id: `a-${i}`, team: 'away', number: p.n, name: `Away ${p.n}`, role: p.r,
        position: { offensive: { x: 100 - p.x, y: 100 - p.y }, defensive: { x: 100 - p.x, y: Math.max(0, 100 - p.y - 10) } }
    });
  });
  return players;
};