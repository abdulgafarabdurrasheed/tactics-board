import type { Player, Coordinates, Phase, TeamType } from "./types";
import type { BallState } from "./matchEngine/types";

function distance(p: Coordinates, v: Coordinates, w: Coordinates) {
    let l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 === 0) return Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2);
}

export interface PassVision {
    id: string;
    target: Coordinates;
    isBlocked: boolean;
    isValid: boolean;
}

export function passVisionCalc(
    ball: Coordinates,
    players: Player[],
    phase: Phase,
    attackingTeam: TeamType
): PassVision[] {
    const teammates = players.filter(p => p.team === attackingTeam);
    const opponents = players.filter(p => p.team !== attackingTeam);
    const INTERCEPTION_RADIUS = 16;

    return teammates.map(teammate => {
        const target = teammate.position[phase];
        const isBlocked = opponents.some(def => {
            const dPos = def.position[phase];
            return distance(dPos, ball, target) < INTERCEPTION_RADIUS;
        });
        const distanceToBall = Math.pow(target.x - ball.x, 2) + Math.pow(target.y - ball.y, 2);
        return { id: teammate.id, target, isBlocked, isValid: distanceToBall > 9 };
    });
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));


interface RoleProfile {
  baseY: number; laneX: number;
  ballFollowX: number; ballFollowY: number;
  attackPush: number; defensePull: number;
  speed: number; compact: number;
}

const P: Record<string, RoleProfile> = {
  "Goal Poacher":        { baseY: 18, laneX: -1, ballFollowX: 0.45, ballFollowY: 0.15, attackPush: -10, defensePull: 6,  speed: 1.4,  compact: 0.15 },
  "Fox in the Box":      { baseY: 20, laneX: 50, ballFollowX: 0.30, ballFollowY: 0.12, attackPush: -8,  defensePull: 8,  speed: 1.2,  compact: 0.15 },
  "Dummy Runner":        { baseY: 22, laneX: -1, ballFollowX: 0.20, ballFollowY: 0.18, attackPush: -14, defensePull: 6,  speed: 1.6,  compact: 0.2  },
  "Deep-Lying Forward":  { baseY: 28, laneX: 50, ballFollowX: 0.55, ballFollowY: 0.30, attackPush: -4,  defensePull: 10, speed: 1.1,  compact: 0.3  },
  "Creative Playmaker":  { baseY: 38, laneX: -1, ballFollowX: 0.60, ballFollowY: 0.35, attackPush: -6,  defensePull: 8,  speed: 1.0,  compact: 0.35 },
  "Classic No. 10":      { baseY: 40, laneX: 50, ballFollowX: 0.55, ballFollowY: 0.40, attackPush: -6,  defensePull: 8,  speed: 1.1,  compact: 0.4  },
  "Hole Player":         { baseY: 36, laneX: -1, ballFollowX: 0.50, ballFollowY: 0.45, attackPush: -10, defensePull: 6,  speed: 1.3,  compact: 0.3  },
  "Prolific Winger":     { baseY: 30, laneX: -1, ballFollowX: 0.12, ballFollowY: 0.22, attackPush: -10, defensePull: 14, speed: 1.5,  compact: 0.1  },
  "Roaming Flank":       { baseY: 32, laneX: -1, ballFollowX: 0.30, ballFollowY: 0.28, attackPush: -8,  defensePull: 10, speed: 1.3,  compact: 0.2  },
  "Cross Specialist":    { baseY: 34, laneX: -1, ballFollowX: 0.10, ballFollowY: 0.18, attackPush: -10, defensePull: 14, speed: 1.2,  compact: 0.1  },
  "Box-to-Box":          { baseY: 50, laneX: -1, ballFollowX: 0.55, ballFollowY: 0.50, attackPush: -5,  defensePull: 5,  speed: 1.4,  compact: 0.5  },
  "Orchestrator":        { baseY: 50, laneX: 50, ballFollowX: 0.45, ballFollowY: 0.25, attackPush: -2,  defensePull: 8,  speed: 0.85, compact: 0.5  },
  "Anchor Man":          { baseY: 55, laneX: 50, ballFollowX: 0.30, ballFollowY: 0.15, attackPush: -1,  defensePull: 8,  speed: 0.9,  compact: 0.55 },
  "The Destroyer":       { baseY: 52, laneX: -1, ballFollowX: 0.45, ballFollowY: 0.40, attackPush: -2,  defensePull: 5,  speed: 1.3,  compact: 0.5  },
  "Build Up":            { baseY: 72, laneX: -1, ballFollowX: 0.25, ballFollowY: 0.10, attackPush: -6,  defensePull: 5,  speed: 1.0,  compact: 0.55 },
  "Extra Frontman":      { baseY: 65, laneX: -1, ballFollowX: 0.30, ballFollowY: 0.20, attackPush: -8,  defensePull: 8,  speed: 1.1,  compact: 0.45 },
  "Offensive Fullback":  { baseY: 60, laneX: -1, ballFollowX: 0.15, ballFollowY: 0.25, attackPush: -15, defensePull: 10, speed: 1.4,  compact: 0.25 },
  "Defensive Fullback":  { baseY: 72, laneX: -1, ballFollowX: 0.12, ballFollowY: 0.10, attackPush: -3,  defensePull: 6,  speed: 1.0,  compact: 0.4  },
  "Offensive Goalkeeper": { baseY: 88, laneX: 50, ballFollowX: 0.25, ballFollowY: 0.08, attackPush: -8, defensePull: 3, speed: 1.5, compact: 0.05 },
  "Defensive Goalkeeper": { baseY: 93, laneX: 50, ballFollowX: 0.12, ballFollowY: 0.03, attackPush: -2, defensePull: 1, speed: 1.5, compact: 0.05 },
};

const FALLBACK: RoleProfile = {
  baseY: 50, laneX: -1, ballFollowX: 0.3, ballFollowY: 0.3,
  attackPush: 0, defensePull: 0, speed: 1.0, compact: 0.3,
};

interface StyleMod {
  compactMul: number;   
  vShift: number;       
  widePush: number;     
  pressLine: number;    
  ballPull: number;     
  tempoMul: number;
}

const STYLES: Record<string, StyleMod> = {
  "Possession Game":   { compactMul: 1.4, vShift: -4, widePush: 5,  pressLine: -5, ballPull: 0.12,  tempoMul: 0.85 },
  "Quick Counter":     { compactMul: 0.7, vShift: 5,  widePush: 8,  pressLine: 10, ballPull: -0.05, tempoMul: 1.5  },
  "Long Ball Counter": { compactMul: 0.6, vShift: 8,  widePush: 3,  pressLine: 12, ballPull: -0.08, tempoMul: 1.3  },
  "Out Wide":          { compactMul: 1.0, vShift: -2, widePush: 15, pressLine: -3, ballPull: 0.0,   tempoMul: 1.0  },
  "Long Ball":         { compactMul: 0.7, vShift: 10, widePush: 2,  pressLine: 15, ballPull: -0.08, tempoMul: 1.1  },
};

const DFLT_STYLE: StyleMod = { compactMul: 1, vShift: 0, widePush: 0, pressLine: 0, ballPull: 0, tempoMul: 1 };

const WIDE_ROLES = new Set([
  "Prolific Winger", "Cross Specialist", "Roaming Flank",
  "Offensive Fullback", "Defensive Fullback",
]);

const GK_ROLES = new Set(["Offensive Goalkeeper", "Defensive Goalkeeper"]);

let tick = 0;

export const nextPosition = (
  players: Player[],
  ballState: BallState,
  currentPhase: Phase,
  managerStyle: string,
): Player[] => {
  tick++;
  const style = STYLES[managerStyle] || DFLT_STYLE;

  return players.map((p, idx) => {
    const current = p.position[currentPhase];
    const prof = P[p.role] || FALLBACK;
    const isHome = p.team === "home";
    const isHoldingBall = ballState.holder === p.id;
    const possessionTeam = ballState.team === p.team;

    const bx = isHome ? ballState.position.x : 100 - ballState.position.x;
    const by = isHome ? ballState.position.y : 100 - ballState.position.y;
    const cx = isHome ? current.x : 100 - current.x;
    const cy = isHome ? current.y : 100 - current.y;

    let tx: number, ty: number;
    if (GK_ROLES.has(p.role)) {
      tx = lerp(50, bx, 0.3);
      ty = currentPhase === 'offensive'
        ? prof.baseY + (p.role === 'Offensive Goalkeeper' ? -8 : -3)
        : prof.baseY;

      if (by > 72) {
        ty = lerp(ty, by - 5, 0.3);
        tx = lerp(tx, bx, 0.5);
      }
    } else {
      let dynamicBaseY = prof.baseY;
      if (possessionTeam && !isHoldingBall) {
        dynamicBaseY -= 15;
      }
      
      ty = dynamicBaseY;
      const isWide = WIDE_ROLES.has(p.role);
      const isLeft = cx < 50;

      if (prof.laneX >= 0) {
        tx = prof.laneX;
      } else if (isWide) {
        tx = isLeft ? 18 : 82;
      } else {
        tx = cx
      }

      const fx = clamp(prof.ballFollowX + style.ballPull, 0, 0.8);
      const fy = clamp(prof.ballFollowY + style.ballPull * 0.5, 0, 0.7);

      if (!possessionTeam) {
        tx = lerp(tx, bx, fx);
        ty = lerp(ty, by, fy);
      } else if (isHoldingBall) {
        ty = lerp(cy, 0, 0.2);
      }

      tx += (bx - 50) * 0.25;

      if (currentPhase === 'offensive') {
        ty += prof.attackPush + style.vShift;
        if (isWide) tx += isLeft ? -style.widePush : style.widePush;
      } else {
        ty += prof.defensePull + style.pressLine;
        tx = lerp(tx, 50, prof.compact * style.compactMul * 0.25);
        const d = Math.sqrt((cx - bx) ** 2 + (cy - by) ** 2);

        if (d < 28 && prof.compact < 0.45 && !possessionTeam) {
          tx = lerp(tx, bx, 0.4);
          ty = lerp(ty, by, 0.3);
        }
      }
    }

    tx = clamp(tx, 3, 97);
    ty = clamp(ty, 3, 97);

    if (!isHome) { tx = 100 - tx; ty = 100 - ty; }

    const dx = tx - current.x, dy = ty - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let speed = isHoldingBall ? 0.70 : 1.0;
    const spd = clamp((0.035 * prof.speed * style.tempoMul + distance * 0.0015) * speed, 0.015, 0.10);

    const seed = idx * 137.5 + (isHome ? 0 : 500);
    const jx = Math.sin(tick * 0.05 + seed) * 0.12;
    const jy = Math.cos(tick * 0.063 + seed) * 0.12;

    return {
      ...p,
      position: {
        ...p.position,
        [currentPhase]: {
          x: clamp(lerp(current.x, tx, spd) + jx, 1, 99),
          y: clamp(lerp(current.y, ty, spd) + jy, 1, 99),
        },
      },
    };
  });
};
