# FIVE FORWARD — Digital Oil Lamp Lighting

Initial technical prototype for the Code Terriers 5th Anniversary interactive ceremony.

## Concept

The ceremony reimagines a traditional oil lamp lighting as an interactive digital experience:

**Tablet → Local Network → Laptop Application → LED Screen**

Guests will eventually drag digital intelligence/data objects toward the Code Terriers logo. Each successful interaction will progressively illuminate the logo and build toward the final Five Forward reveal.

## Current phase

This repository is intentionally an **initial prototype**.

Implemented now:

- React + TypeScript + Vite foundation
- `/display` prototype
- `/controller` prototype
- `/operator` prototype
- Basic ceremony state model for 8 values
- Local WebSocket server skeleton
- Supplied Code Terriers logo converted to a transparent PNG for prototyping
- Simple placeholder interactions and animations

Not implemented yet:

- Production WebSocket state synchronization
- Final animation system
- Advanced particles / neural network visuals
- Partial logo illumination
- Final Five Forward reveal
- Event-ready operator backup
- Production packaging

## Run locally

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Start the local WebSocket server in another terminal:

```bash
npm run dev:server
```

Vite normally starts on:

```text
http://localhost:5173
```

Modes:

```text
http://localhost:5173/display
http://localhost:5173/controller
http://localhost:5173/operator
```

## Important asset note

The current logo asset is derived from the JPEG supplied for this project. It is useful for prototyping, but the final ceremony should use the original official SVG/vector asset from Code Terriers when available.

## GitHub

Recommended repository name:

`five-forward-digital-oil-lamp`

Recommended first commit:

`chore: initialize Five Forward interactive ceremony prototype`

Recommended public description:

`Interactive digital oil lamp lighting experience for the Code Terriers Five Forward 5th Anniversary.`

## Development approach

Build incrementally:

1. Technical foundation
2. Local tablet ↔ laptop communication
3. Ceremony state machine
4. Logo illumination
5. Individual object interactions
6. Final AI-inspired reveal
7. Sound effects
8. Operator backup
9. Event-day hardening

Do not treat the current prototype visuals as final creative direction.
