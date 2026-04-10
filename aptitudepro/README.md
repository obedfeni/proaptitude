# AptitudePro

A comprehensive Next.js web application for practicing graduate aptitude and psychometric tests. Features 200+ questions across 12 categories with adaptive learning algorithms.

## Features

- **12 Test Categories**: Numerical, Verbal, Logical, Mechanical, Spatial, Abstract, Situational Judgment, Watson-Glaser, IQ, Error Checking, Critical Thinking, and Electrical Engineering
- **200+ Questions**: Including data tables, diagrams, and passages
- **Adaptive Learning**: Questions weighted based on your performance
- **Progress Persistence**: Local storage saves your results and streaks
- **Analytics Dashboard**: Track performance by category over time
- **SVG Diagrams**: Visual questions for mechanical and electrical concepts
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Extract the zip file
2. Navigate to the project directory:
   ```bash
   cd aptitudepro
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The static files will be generated in the `dist` folder.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Framework preset: Next.js
4. Deploy

### Other Platforms

The `dist` folder contains static files that can be deployed to any static hosting service (Netlify, Cloudflare Pages, etc.).

## Question Categories

| Category | Questions | Description |
|----------|-----------|-------------|
| Numerical Reasoning | 25 | Data interpretation, percentages, ratios |
| Verbal Reasoning | 20 | Comprehension, vocabulary, grammar |
| Logical Reasoning | 20 | Syllogisms, patterns, sequences |
| Mechanical | 15 | Gears, levers, hydraulics |
| Spatial | 15 | Cube nets, 3D visualization |
| Abstract | 15 | Pattern recognition |
| Situational Judgment | 15 | Workplace scenarios |
| Watson-Glaser | 15 | Critical thinking assessment |
| IQ | 10 | Pattern detection, analogies |
| Error Checking | 10 | Data verification |
| Critical Thinking | 15 | Argument analysis |
| Electrical Engineering | 30 | Circuits, power systems, electronics |

## Data Persistence

All progress is stored in the browser's localStorage. To reset progress, clear site data in your browser settings.

## License

MIT
