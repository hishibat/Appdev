# CLAUDE.md - AI Assistant Guidelines for Appdev

## Project Overview

**Appdev** is a repository containing web-based applications. Currently, it features a **Retro Block Breaker** game - an Arkanoid-like arcade game built entirely with vanilla HTML, CSS, and JavaScript in a single file.

### Key Characteristics
- **Single-file architecture**: Each application is self-contained in one HTML file
- **No external dependencies**: No npm, no build tools, no external assets
- **Browser-native technologies**: HTML5 Canvas, Web Audio API, vanilla JS
- **Progressive complexity**: 10 game stages with increasing difficulty

## Codebase Structure

```
/home/user/Appdev/
├── README.md           # Project description
├── CLAUDE.md           # AI assistant guidelines (this file)
├── index.html          # Retro Block Breaker game (main application)
└── .git/               # Git repository
```

### index.html Architecture

The main game file (`index.html:1-818`) follows this structure:

| Section | Lines | Description |
|---------|-------|-------------|
| HTML Head | 1-53 | Meta tags, CSS variables, and styling |
| HTML Body | 54-76 | Canvas, UI buttons, overlays |
| JavaScript | 77-816 | Game logic (IIFE pattern) |

#### JavaScript Organization (inside `index.html`)

- **Config & Constants** (`index.html:84-108`): Game parameters, states, power-ups, brick types
- **Canvas & Sizing** (`index.html:116-132`): Responsive canvas handling with DPR support
- **Input Handling** (`index.html:137-170`): Keyboard, mouse, and touch controls
- **Audio System** (`index.html:175-251`): Web Audio API with echo effects
- **Game Entities** (`index.html:255-271`): Ball, Paddle, Brick, Power, LaserShot classes
- **Collision & Utils** (`index.html:276-288`): Geometry helpers
- **Game State** (`index.html:292-300`): Runtime variables, localStorage integration
- **Overlays** (`index.html:304-375`): Title, stage select, clear, game over screens
- **Stage Setup** (`index.html:380-415`): Level building and initialization
- **Game Loop** (`index.html:420-588`): Update and render cycle
- **Rendering** (`index.html:630-768`): Drawing functions for all game elements
- **Level Generation** (`index.html:774-808`): Algorithmic level patterns

## Development Conventions

### Code Style
- **JavaScript**: ES6+ features, `'use strict'` mode, IIFE pattern for encapsulation
- **CSS**: CSS custom properties (variables) in `:root`
- **Naming**: camelCase for variables/functions, UPPER_CASE for constants
- **Comments**: Japanese comments are used for UI text and some code annotations

### Game Configuration
All tunable parameters are centralized in the `CONFIG` object at `index.html:84-94`:

```javascript
const CONFIG = {
  BASE_W: 1600,       // Internal logical resolution
  BASE_H: 900,
  PADDLE: { W: 150, H: 18, SPEED: 820, MIN_W: 80, MAX_W: 220 },
  BALL: { R: 8, SPEED: 520, MIN_SPEED: 350, MAX_SPEED: 980, SPEED_INC: 1.005 },
  BRICK: { ROWS: 10, COLS: 14, W: 96, H: 28, GAP: 4, TOP: 140 },
  // ...
};
```

### State Machine
Game states are defined in `STATE` enum at `index.html:97`:
- `TITLE` → `STAGE_SELECT` → `INTRO` → `PLAY` ↔ `PAUSE` → `CLEAR` or `GAMEOVER`

### Power-up System
Power-up types defined at `index.html:100`:
- `MULTI`: Adds extra balls
- `LASER`: Paddle shoots lasers
- `EXPAND`/`SHRINK`: Paddle size changes
- `SLOW`: Ball speed reduction
- `GLUE`: Ball sticks to paddle
- `LIFE`: Extra life

### Brick Types
Defined at `index.html:103`:
- `EMPTY (0)`: No brick
- `NORMAL (1)`: Single hit to destroy
- `DURABLE (2)`: Multiple hits required
- `STEEL (3)`: Indestructible

## Development Workflows

### Running the Application
Simply open `index.html` in a modern web browser. No build step required.

```bash
# Using a simple HTTP server (optional, for local development)
python3 -m http.server 8000
# Then open http://localhost:8000/index.html
```

### Adding New Features

1. **New Power-ups**: Add to `PU` enum, implement in `applyPower()` function (`index.html:609-627`)
2. **New Levels**: Modify `generateLevels()` function (`index.html:774-808`)
3. **New Brick Types**: Add to `BK` enum, update `hitBrick()` and `drawBrick()` functions
4. **UI Changes**: Modify overlay functions (`showTitle()`, `showClear()`, etc.)

### Testing
- Manual testing in browser
- Test keyboard controls: Arrow keys, Space, P, M, R
- Test touch/mouse controls
- Test all 10 stages
- Verify localStorage persistence (high scores, unlocked stages)

## AI Assistant Guidelines

### When Modifying Code

1. **Preserve single-file structure**: Keep all code in `index.html` unless explicitly asked to separate
2. **Maintain Japanese text**: UI strings are in Japanese - preserve language consistency
3. **Test audio carefully**: Web Audio API requires user interaction to initialize
4. **Respect responsive design**: Canvas scales with DPR and container size
5. **Keep collision detection intact**: `rectCircleCollide()` is used throughout

### Common Tasks

| Task | Location | Key Functions |
|------|----------|---------------|
| Adjust difficulty | `index.html:84-94` | Modify CONFIG values |
| Add new stage | `index.html:774-808` | Add pattern in `generateLevels()` |
| Change colors | `index.html:8-16` | CSS variables in `:root` |
| Modify controls | `index.html:137-163` | Event listeners |
| Adjust sounds | `index.html:239-248` | SFX object |

### Performance Considerations
- Game uses `requestAnimationFrame` for smooth 60fps rendering
- DPR is capped at 2 to prevent excessive canvas resolution
- Delta time (`dt`) is clamped to prevent physics issues on tab switch

### Browser Compatibility
- Requires: ES6+, Canvas 2D, Web Audio API, ResizeObserver
- Tested: Modern Chrome, Firefox, Safari, Edge
- Mobile: Touch controls supported

## Git Workflow

- **Main branch**: Production-ready code
- **Feature branches**: Use `claude/` prefix for AI-assisted development
- **Commits**: Use clear, descriptive messages in English

```bash
git add .
git commit -m "Add new power-up feature"
git push -u origin <branch-name>
```

## Quick Reference

### File Locations
- Game configuration: `index.html:84-94`
- Sound effects: `index.html:239-248`
- Level patterns: `index.html:774-808`
- CSS theming: `index.html:8-16`
- Input handling: `index.html:137-170`

### Key Variables
- `state`: Current game state (STATE enum)
- `level`: Current level index (0-9)
- `score`, `lives`: Player stats
- `balls[]`, `grid[]`, `powers[]`: Game entities
- `paddle`: Player paddle object

### localStorage Keys
- `rbb_unlocked`: Highest unlocked stage
- `rbb_hiscore`: High score
