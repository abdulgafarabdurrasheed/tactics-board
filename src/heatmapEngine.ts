const COLUMNS = 50;
const ROWS = 75;

export type HeatGrid = number[][];

export const createEmptyGrid = (): HeatGrid => {
    return Array.from({ length: ROWS }, () => new Array(COLUMNS).fill(0))
};

export const stampPositions = (
    grid: HeatGrid,
    positions: { x: number; y: number }[],
    radius: number = 2
): HeatGrid => {
    const newGrid = grid.map(row => [...row]);

    for (const position of positions) {
        const column = Math.floor((position.x / 100) * (COLUMNS - 1))
        const row = Math.floor((position.y / 100) * (ROWS - 1))

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const r = row + dy;
                const c = column + dx;

                if (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= radius) {
                        newGrid[r][c] += 1 - distance / (radius + 1);
                    }
                }
            }
        }
    }
    return newGrid;
}

export const renderHeatmap = (
    canvas: HTMLCanvasElement,
    grid: HeatGrid,
    color: "cyan" | "rose"
) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return;

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h);

    let maxHeat = 0;
    for (const row of grid) {
        for (const val of row) {
            if (val > maxHeat) maxHeat = val;
        }
    }
    if (maxHeat === 0) return

    const cellWidth = w / COLUMNS
    const cellHeight = h / ROWS

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLUMNS; c++) {
            const val = grid[r][c];
            if (val <= 0) continue;

            const intensity = Math.min(val / maxHeat, 1);
            const cx = c * cellWidth + cellWidth / 2;
            const cy = r * cellHeight + cellHeight / 2;
            const blobRadius = Math.max(cellWidth, cellHeight) * 1.8;

            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobRadius);

            if (color === "cyan") {
                gradient.addColorStop(0, `rgba(34, 211, 238, ${intensity * 0.6})`);
                gradient.addColorStop(0.4, `rgba(16, 185, 129, ${intensity * 0.35})`);
                gradient.addColorStop(1, "rgba(34, 211, 238, 0)");
            } else {
                gradient.addColorStop(0, `rgba(244, 63, 94, ${intensity * 0.6})`);
                gradient.addColorStop(0.4, `rgba(251, 146, 60, ${intensity * 0.35}`)
                gradient.addColorStop(1, `rgba(244, 63, 94, 0)`)
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(cx - blobRadius, cy - blobRadius, blobRadius * 2, blobRadius * 2);
        }
    }
};