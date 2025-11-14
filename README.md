# [Untitled] Clone

A lightweight React + Vite starter that lets you experiment with project and track organisation right in the browser.  
There is no backend and no third‑party SDKs — everything lives in local state so newcomers can explore the code without distractions.

## Project Structure

- `src/App.jsx` – the entire UI and state management in one file
- `src/App.css` – a single stylesheet with approachable, plain CSS
- `src/index.css` – minimal global resets

## Requirements

- Node.js 18 or newer
- npm (bundled with Node)

## Getting Started

```bash
npm install
npm run dev
```

Open the printed URL (typically http://localhost:5173) to start adding projects and tracks.  
Data is stored in `localStorage`, so it survives page refreshes in the same browser.

## Build For Production

```bash
npm run build
```

The optimised output is placed in `dist/`.

## Ideas To Extend

1. Persist projects to your own API instead of `localStorage`.
2. Add waveform or spectrum visualisers for uploaded tracks.
3. Export all project data as JSON for sharing with collaborators.
