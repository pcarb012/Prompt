# TabFlow

Interactive guitar tab player built with React + Vite.

## Overview

TabFlow is a browser-based guitar tablature player that renders scrolling tabs on a canvas with audio playback. It also supports uploading and viewing PDF sheet music/tabs using pdf.js.

## Tech Stack

- **React** (via Vite) for UI
- **Canvas API** for rendering the scrolling tab player
- **Web Audio API** for note playback
- **pdf.js** (`pdfjs-dist`) for PDF tab rendering

## Project Structure

- `src/TabFlow.jsx` — Main component containing the tab player, PDF viewer, song library, and all UI
- `src/App.jsx` — Wrapper that renders `<TabFlow />`
- `src/index.css` — Minimal global reset
- `src/main.jsx` — Entry point

## Features

- Scrolling canvas-based tab player with hit detection and scoring
- Multi-track support (lead, rhythm, bass) with track switching
- Adjustable playback speed (0.25x–1.5x)
- Audio playback via Web Audio API (triangle wave synthesis)
- PDF tab/sheet music upload with drag-and-drop
- PDF viewer with page navigation, zoom controls, and page thumbnails
- Demo song library with built-in examples

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server
npm run build  # Production build
```