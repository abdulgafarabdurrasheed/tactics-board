import type { Player, FormationPosition } from './types';

export const RATIO = 2/3

export const ROLES = [
    "Goal Poacher", "Fox in the Box", "Dummy Runner", "Deep-Lying Forward",
    "Creative Playmaker", "Prolific Winger", "Roaming Flank", "Cross Specialist",
    "Classic No. 10", "Hole Player", "Box-to-Box", "Orchestrator", "Anchor Man",
    "The Destroyer", "Build Up", "Extra Frontman", "Offensive Fullback",
    "Defensive Fullback", "Offensive Goalkeeper", "Defensive Goalkeeper"
];

export const PASSING_RANGES: Record<string, string> = {
    "Cross Specialist": "26rem",
    "Orchestrator": "24rem",
    "Creative Playmaker": "22rem",
    "Classic No. 10": "20rem",
    "Offensive Fullback": "18rem",
    "Deep-Lying Forward": "16rem",
    "Box-to-Box": "14rem",
    "Offensive Goalkeeper": "14rem",
    "Prolific Winger": "12rem",
    "Roaming Flank": "12rem",
    "Anchor Man": "11rem",
    "Defensive Fullback": "10rem",
    "Hole Player": "10rem",
    "Defensive Goalkeeper": "9rem",
    "The Destroyer": "8rem",
    "Build up": "8rem",
    "Extra Frontman": "6rem",
    "Dummy Runner": "5rem",
    "Goal Poacher": "4rem",
    "Fox in the Box": "4rem",
};

export const FORMATIONS: Record<string, FormationPosition[]> = {
    "4-3-3": [
        { n: 1, r: "Offensive Goalkeeper", x: 50, y: 90 },
        { n: 3, r: "Offensive Fullback", x: 10, y: 75 },
        { n: 4, r: "Build Up", x: 40, y: 80 },
        { n: 5, r: "The Destroyer", x: 60, y: 80 },
        { n: 2, r: "Defensive Fullback", x: 90, y: 75 },
        { n: 8, r: "Box-to-Box", x: 30, y: 60 },
        { n: 6, r: "Anchor Man", x: 70, y: 60 },
        { n: 10, r: "Classic No. 10", x: 50, y: 50 },
        { n: 7, r: "Prolific Winger", x: 20, y: 40 },
        { n: 9, r: "Goal Poacher", x: 50, y: 30 },
        { n: 11, r: "Roaming Flank", x: 80, y: 40 }
    ],
    "4-2-1-3": [
        { n: 1, r: "Offensive Goalkeeper", x: 50, y: 90 },
        { n: 3, r: "Offensive Fullback", x: 12, y: 72 },
        { n: 4, r: "Build Up", x: 38, y: 80 },
        { n: 5, r: "The Destroyer", x: 62, y: 80 },
        { n: 2, r: "Defensive Fullback", x: 88, y: 72 },
        { n: 8, r: "Box-to-Box", x: 35, y: 62 },
        { n: 6, r: "Anchor Man", x: 65, y: 62 },
        { n: 10, r: "Classic No. 10", x: 50, y: 45 },
        { n: 7, r: "Prolific Winger", x: 25, y: 32 },
        { n: 9, r: "Goal Poacher", x: 50, y: 22 },
        { n: 11, r: "Roaming Flank", x: 75, y: 32 }
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
        { n: 11, r: "Deep-Lying Forward", x: 65, y: 25 }
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

export const PLAYING_STYLES = [
    "Possession Game",
    "Quick Counter",
    "Long Ball Counter",
    "Out Wide",
    "Long Ball",
];