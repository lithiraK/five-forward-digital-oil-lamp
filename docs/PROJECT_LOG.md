# Five Forward — Project Log

## 2026-09-11 — Project initialized

### Objective

Create an interactive digital replacement for the traditional oil lamp lighting at the Code Terriers 5th Anniversary.

### Source concept

The supplied concept brief describes:

- An interactive experience on the main LED screen
- A Code Terriers logo initially shown in darkness
- Digital elements representing the organisation's values and journey
- Guests dragging each element toward the logo using a touchscreen
- Progressive illumination of the logo
- Final transformation into an AI-inspired light animation
- Five Forward reveal
- Backup operator-controlled mode

### Initial technical decision

Primary application: React + TypeScript + Vite.

The tablet will use a browser-based controller rather than a native app for the first implementation.

The laptop will act as the local application host and event display controller.

Communication will use a local WebSocket server.

The architecture is deliberately offline-first.

### Asset provenance

`public/assets/code-terriers-logo-original.jpg`
- Original user-supplied JPEG.

`public/assets/code-terriers-logo-transparent.png`
- Prototype derivative with near-white background removed and content cropped.
- This is NOT a reconstructed SVG or an official vector logo.

### GitHub / portfolio intent

This project is intended to be documented professionally for later inclusion in a portfolio and LinkedIn project entry.

Keep commits meaningful and focused.
Avoid committing secrets.
Document major architectural and creative milestones as they are completed.

## Next checkpoint

Verify the initial project runs locally before adding production animation work.
