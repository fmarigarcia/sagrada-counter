# Sagrada Counter — Implementation Plan

## Overview

A mobile-first React/TypeScript web app that scores a game of Sagrada. Players take or upload a photo of their window board, select objectives and remaining favor tokens, and the app computes their VP total. The photo is analysed by a vision model to pre-fill the board; no image is ever persisted. Players can also enter or correct dice manually.

---

## Tech Stack (existing + additions)

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Linting | ESLint (typescript-eslint) |
| Formatting | **Prettier** (to be added) |
| i18n | **i18next** + **react-i18next** (EN + ES) |
| Vision | **Google Gemini 2.0 Flash** (via REST, free tier) |
| State | React `useState` / `useReducer` + Context |
| Data | Static JSON files for objectives |

---

## Feature Breakdown

### F1 — Board Entry
- 4 × 5 grid of cells, each cell can hold a die (color + value 1-6) or be empty.
- Cells have an optional restriction: color-restricted, value-restricted, or unrestricted (white).
- Window Pattern (the card) is selectable from a list loaded from JSON; selecting it pre-fills all cell restrictions.
- Manually tap a cell to open a die-picker (color + value).

### F2 — Photo Analysis
- Capture (camera) or upload a photo.
- Send image as base64 to Gemini Vision API.
- Receive structured JSON describing each cell's dice color and value.
- Pre-fill the board state from the response.
- Photo data-URL is discarded immediately after the API call.

### F3 — Objective Selection
- 10 Public Objectives loaded from `/src/data/publicObjectives.json`.
- 5 Private Objectives loaded from `/src/data/privateObjectives.json`.
- Player selects up to 3 Public Objectives (as per game setup: 3 are revealed).
- Player selects exactly 1 Private Objective.

### F4 — Scoring Engine
Computes VP from:
1. Public Objectives (formulas evaluated against the board state).
2. Private Objective (sum of dice values of the chosen color).
3. Remaining Favor Tokens (1 VP each).
4. Open spaces (−1 VP each).
Displays a ranked breakdown per category.

### F5 — Placement Validation
Highlights cells that violate placement rules:
- First die not on edge/corner.
- Die not adjacent (orthogonal or diagonal) to any other placed die.
- Die color/value doesn't match cell restriction.
- Two orthogonally adjacent dice share the same color or value.

### F6 — Internationalisation (i18n)
- All UI strings externalised — zero hard-coded text in JSX.
- Two supported locales: **English (`en`)** and **Spanish (`es`)**.
- Translation files at `src/locales/en/translation.json` and `src/locales/es/translation.json`.
- Language switcher in the `Header` (EN / ES toggle).
- Locale persisted to `localStorage` so the choice survives a page refresh.
- Objective names and descriptions in the JSON data files are keyed and translated via i18n (not duplicated inside the JSON).

### F7 — Multi-player Support *(v2 stretch goal)*
Score multiple players and rank them.

---

## Data Models

```ts
type DiceColor = 'red' | 'yellow' | 'green' | 'blue' | 'purple';
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

interface Die {
  color: DiceColor;
  value: DiceValue;
}

type CellRestriction =
  | { type: 'color'; value: DiceColor }
  | { type: 'value'; value: DiceValue }
  | { type: 'none' };

interface Cell {
  restriction: CellRestriction;
  die: Die | null;
}

type BoardState = Cell[][]; // [4 rows][5 cols]

interface PublicObjective {
  id: string;
  name: string;
  description: string;
  vpPerSet: number;
  scoringType: PublicScoringType; // enum, drives the scoring engine
}

interface PrivateObjective {
  id: string;
  name: string;
  color: DiceColor;
}

interface WindowPattern {
  id: string;
  name: string;
  difficulty: number; // 3–6 (favor tokens granted)
  grid: CellRestriction[][]; // [4][5]
}

interface ScoreBreakdown {
  publicObjectives: { objective: PublicObjective; vp: number }[];
  privateObjective: { objective: PrivateObjective; vp: number };
  favorTokens: number;
  openSpacePenalty: number;
  total: number;
}
```

---

## Component Tree

```
App
├── Header
├── StepWizard                    ← controls the 3-step flow
│   ├── Step1_PhotoAndBoard
│   │   ├── PhotoCapture          ← existing, to be refactored
│   │   ├── PhotoUpload           ← existing, to be refactored
│   │   ├── WindowPatternSelector
│   │   └── BoardGrid
│   │       └── BoardCell
│   │           └── DiePicker
│   ├── Step2_Objectives
│   │   ├── ObjectiveSelector (public, multi-select 3)
│   │   └── ObjectiveSelector (private, single-select)
│   └── Step3_FavorTokens
│       └── TokenCounter
├── ScoreDisplay
│   └── ScoreBreakdown
└── ValidationBanner
    └── ValidationItem
```

---

## File Structure (target)

```
src/
  components/
    board/
      BoardGrid.tsx
      BoardCell.tsx
      DiePicker.tsx
    objectives/
      ObjectiveSelector.tsx
      ObjectiveCard.tsx
    photo/
      PhotoCapture.tsx         ← refactor existing
      PhotoUpload.tsx          ← refactor existing
    score/
      ScoreDisplay.tsx
      ScoreBreakdown.tsx
    validation/
      ValidationBanner.tsx
      ValidationItem.tsx
    common/
      StepWizard.tsx
      TokenCounter.tsx
      Header.tsx
      LanguageSwitcher.tsx
  locales/
    en/
      translation.json
    es/
      translation.json
  i18n.ts                          ← i18next initialisation
  data/
    publicObjectives.json
    privateObjectives.json
    windowPatterns.json
  hooks/
    usePhotoAnalysis.ts        ← Gemini API call
    useScoring.ts              ← scoring engine
    useValidation.ts           ← placement rule checks
    useBoardState.ts           ← board state reducer
  types/
    game.ts                    ← all shared TypeScript interfaces
  App.tsx
  main.tsx
  index.css
```

---

## Scoring Engine Detail

### Public Objectives

| ID | Name | Rule | VP |
|---|---|---|---|
| `row-color-variety` | Row Color Variety | Each row with no repeated colors | 6 VP/row |
| `col-color-variety` | Column Color Variety | Each column with no repeated colors | 5 VP/col |
| `row-shade-variety` | Row Shade Variety | Each row with no repeated values | 5 VP/row |
| `col-shade-variety` | Column Shade Variety | Each column with no repeated values | 4 VP/col |
| `light-shades` | Light Shades | Sets of 1 & 2 value dice | 2 VP/set |
| `medium-shades` | Medium Shades | Sets of 3 & 4 value dice | 2 VP/set |
| `deep-shades` | Deep Shades | Sets of 5 & 6 value dice | 2 VP/set |
| `shade-variety` | Shade Variety | Sets of one die of each value (1-6) | 5 VP/set |
| `color-variety` | Color Variety | Sets of one die of each color | 4 VP/set |
| `color-diagonals` | Color Diagonals | Each die with a diagonally adjacent die of same color | 1 VP/die |

### Private Objectives

| ID | Name | Color |
|---|---|---|
| `private-red` | Shades of Red | red |
| `private-yellow` | Shades of Yellow | yellow |
| `private-green` | Shades of Green | green |
| `private-blue` | Shades of Blue | blue |
| `private-purple` | Shades of Purple | purple |

---

## Placement Validation Rules

1. **First die** must be on an edge or corner cell.
2. **Every other die** must be orthogonally or diagonally adjacent to at least one existing die.
3. **Color restriction**: if the cell has a color restriction the die color must match.
4. **Value restriction**: if the cell has a value restriction the die value must match.
5. **No orthogonal same color**: no two orthogonally adjacent dice may share the same color.
6. **No orthogonal same value**: no two orthogonally adjacent dice may share the same value.

---

## Video / AI Analysis Flow

```
User photo
  → base64 encode
  → POST Gemini 2.0 Flash (vision)
      prompt: "Analyse this Sagrada window board (4 rows × 5 columns). 
               For each occupied cell return JSON: 
               { row, col, color (red|yellow|green|blue|purple), value (1-6) }"
  → parse response JSON
  → populate BoardState (die fields only; restrictions come from chosen WindowPattern)
  → discard photo data-URL
```

The API key is stored in a `.env` file as `VITE_GEMINI_API_KEY` (never committed).

---

## Implementation Phases

### Phase 0 — Housekeeping
- Add Prettier + config.
- Add i18next + react-i18next; create `src/i18n.ts` and locale files.
- Refactor existing components to `React.FC<Interface>` pattern.
- Create `src/types/game.ts`.
- Create data JSON files for objectives.

### Phase 1 — Board
- `BoardGrid` + `BoardCell` with restriction rendering.
- `DiePicker` modal.
- `useBoardState` reducer.
- `WindowPatternSelector` with JSON data.

### Phase 2 — Photo Analysis
- Refactor `PhotoCapture` / `PhotoUpload`.
- `usePhotoAnalysis` hook (Gemini API).
- Integrate with board pre-fill.

### Phase 3 — Objectives & Tokens
- `ObjectiveSelector` for public (multi, capped at 3) and private (single).
- `TokenCounter`.

### Phase 4 — Scoring
- `useScoring` hook implementing all 10 public objective formulas + private.
- `ScoreDisplay` + `ScoreBreakdown` components.

### Phase 5 — Validation
- `useValidation` hook checking all 6 placement rules.
- `ValidationBanner` + per-cell highlights on `BoardCell`.

### Phase 6 — UX Polish
- `StepWizard` (3-step flow).
- `Header` component + `LanguageSwitcher` (EN/ES toggle).
- Responsive / mobile-first fine-tuning.
- Accessibility (aria labels, focus management).
- Verify all strings are translated in both locales.

---

## Commit Convention

- One-liner, imperative present tense.
- Small scoped commits per component or concern.
- Example: `add BoardCell component with die restriction rendering`

---

## Out of Scope (v1)

- Multi-player scoring in a single session.
- Additional locales beyond EN and ES.
- Window Pattern card image scanning.
- Tool Card tracking.
- Offline PWA / service worker.
- Backend / persistent storage of any kind.
