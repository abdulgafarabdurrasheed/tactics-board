# Football Tactics Board & Match Simulator

A comprehensive React-based application for creating dynamic football (soccer) tactics, managing formations, and simulating match scenarios. Built with React, TypeScript, and Vite, this web app provides a fully interactive 2D tactics board with advanced match simulation capabilities.

## Features

- **Interactive Tactics Board**: Drag-and-drop interface for moving players and the ball across the pitch.
- **Formations & Roles**: Pre-configured formations and player roles (e.g., False 9, Inverted Fullback, Sweeper Keeper).
- **Match Simulation Engine**: In-built simulation engine containing ball physics, decision-making logic, and possession systems.
- **Passing Vision**: Real-time pass option evaluation based on player positions, blocked passing lanes, and offensive/defensive phases.
- **Heatmap Generation**: Visual overlay tools to dynamically stamp and calculate positional heatmaps for players and zones.
- **Drawing & Annotation**: Integrated drawing tools to sketch plays, arrows, and off-ball movement lines.
- **Export & Share**: Save your tactics directly as an image (powered by `html2canvas`).

## Project Structure

- `src/components/`: Core UI React components like the `FootballField` and `PlayerCard`.
- `src/matchEngine/`: Logic for in-match interactions (ball physics, possession tracking, and AI decision systems).
- `src/simulationEngine.ts`: Simulation calculations, tracking player distances, pass validity, and vectors.
- `src/heatmapEngine.ts`: Calculates and visualizes positional dominance and team heat grids.
- `src/constants.ts`: Formations, playing styles, roles, and default configuration data.

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18+ recommended) and `npm` installed.

### Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   cd tactics-board
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local server (usually `http://localhost:5173`).

### Building for Production

To create an optimized production build:

```bash
npm run build
```

You can then test the production build using:

```bash
npm run preview
```

## Contributing

Contributions are welcome. Please ensure that type-safety is maintained. Use the included ESLint configuration before committing changes to avoid build failures.

## License

This project is open-source and available for usage.

