# Sagrada Counter — Copilot Instructions

> This file is the single source of truth for any AI-assisted implementation session.
> Read it fully before writing any code.

---

## 1. Project Context

- **Repo**: `sagrada-counter`
- **Stack**: React 19 · TypeScript · Vite · Tailwind CSS v4
- **Linting**: ESLint with `typescript-eslint` and `eslint-plugin-react-hooks`
- **Formatting**: Prettier (must be added: `prettier` + `.prettierrc`)
- **i18n**: i18next + react-i18next · locales: `en`, `es`
- **Vision AI**: Google Gemini 2.0 Flash via REST (`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`)
- **API key env var**: `VITE_GEMINI_API_KEY` in `.env` (gitignored)

---

## 2. Code Style Rules (enforce with Prettier + ESLint)

1. **All React components** must use the pattern:
   ```tsx
   interface MyComponentProps { ... }
   const MyComponent: React.FC<MyComponentProps> = ({ ... }) => { ... };
   export default MyComponent;
   ```
2. **All shared types/interfaces** live in `src/types/game.ts` — never inline in component files.
3. **Named exports** for types; **default exports** for components.
4. **No `any`** — use `unknown` and narrow, or define a proper interface.
5. **Hooks** in `src/hooks/`, each in its own file, named `use<Name>.ts`.
6. **Data files** in `src/data/`, always `*.json`, imported with `import data from './file.json' assert { type: 'json' }`.
7. **All user-visible strings** must use the `useTranslation` hook — **no hard-coded text in JSX**.
   ```tsx
   const { t } = useTranslation();
   // ...
   <h1>{t('header.title')}</h1>
   ```
8. **Tailwind** utility classes only — no inline `style=` except for truly dynamic CSS custom properties.
9. **Prettier config** (`.prettierrc`):
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "all",
     "printWidth": 100,
     "tabWidth": 2
   }
   ```

---

## 3. Commit Convention

- One-liner, imperative present tense, max 72 chars.
- Scope to a single concern (one component, one hook, one data file, etc.).
- Examples:
  - `add Prettier config and format all existing files`
  - `add i18next setup and en/es translation files`
  - `add src/types/game.ts with all shared interfaces`
  - `add publicObjectives.json with 10 objective definitions`
  - `add BoardCell component with restriction and die rendering`
  - `add useBoardState reducer hook`
  - `add useValidation hook for placement rule checks`

---

## 4. Game Rules Summary

### The Board (Window)
- **4 rows × 5 columns = 20 cells**.
- Each cell has a **restriction**: color (red/yellow/green/blue/purple), value (1–6), or none (white).
- Cell restrictions are defined by the chosen **Window Pattern Card**.

### Dice
- Colors: `red`, `yellow`, `green`, `blue`, `purple`.
- Values: `1` through `6`.

### Placement Rules (all must be satisfied)
| # | Rule |
|---|---|
| P1 | The **first** die placed must be on an **edge or corner** cell. |
| P2 | Every subsequent die must be placed **adjacent** (orthogonal or diagonal) to an already-placed die. |
| P3 | A die placed on a **color-restricted** cell must match that color. |
| P4 | A die placed on a **value-restricted** cell must match that value. |
| P5 | No two **orthogonally adjacent** dice may share the **same color**. |
| P6 | No two **orthogonally adjacent** dice may share the **same value**. |

White cells have no restriction (P3/P4 don't apply).

---

## 5. Scoring Rules

### End of Game Scoring (in order)
1. **Public Objective Cards** — 3 are active per game; each can score multiple times.
2. **Private Objective Card** — 1 per player; sum of **all dice values** of the specified color.
3. **Favor Tokens** — 1 VP for each remaining unspent token.
4. **Open spaces** — **−1 VP** for each empty cell.

### Public Objectives (all 10 must be in JSON)

| id | name | description | scoring |
|---|---|---|---|
| `row-color-variety` | Row Color Variety | 6 VP per complete row with no color repeated | 6 × (qualifying rows) |
| `col-color-variety` | Column Color Variety | 5 VP per complete column with no color repeated | 5 × (qualifying cols) |
| `row-shade-variety` | Row Shade Variety | 5 VP per complete row with no value repeated | 5 × (qualifying rows) |
| `col-shade-variety` | Column Shade Variety | 4 VP per complete column with no value repeated | 4 × (qualifying cols) |
| `light-shades` | Light Shades | 2 VP per pair of 1-value and 2-value dice (across entire board) | 2 × min(count(1), count(2)) |
| `medium-shades` | Medium Shades | 2 VP per pair of 3-value and 4-value dice | 2 × min(count(3), count(4)) |
| `deep-shades` | Deep Shades | 2 VP per pair of 5-value and 6-value dice | 2 × min(count(5), count(6)) |
| `shade-variety` | Shade Variety | 5 VP per complete set (one die of each value 1-6) | 5 × min(count(1)…count(6)) |
| `color-variety` | Color Variety | 4 VP per complete set (one die of each color) | 4 × min(count(R)…count(P)) |
| `color-diagonals` | Color Diagonals | 1 VP per die that has at least one diagonally adjacent die of the same color | 1 × (qualifying dice) |

### Private Objectives (5 — one per color)

| id | name | color |
|---|---|---|
| `private-red` | Shades of Red | red |
| `private-yellow` | Shades of Yellow | yellow |
| `private-green` | Shades of Green | green |
| `private-blue` | Shades of Blue | blue |
| `private-purple` | Shades of Purple | purple |

---

## 6. JSON Data File Schemas

### `src/data/publicObjectives.json`
```json
[
  {
    "id": "row-color-variety",
    "nameKey": "objectives.rowColorVariety.name",
    "descriptionKey": "objectives.rowColorVariety.description",
    "vpPerUnit": 6,
    "scoringType": "rowColorVariety"
  }
]
```
`scoringType` is a discriminated key consumed by `useScoring`. `nameKey` and `descriptionKey` are i18n translation keys.

### `src/data/privateObjectives.json`
```json
[
  { "id": "private-red",    "nameKey": "objectives.privateRed.name",    "color": "red"    },
  { "id": "private-yellow", "nameKey": "objectives.privateYellow.name", "color": "yellow" },
  { "id": "private-green",  "nameKey": "objectives.privateGreen.name",  "color": "green"  },
  { "id": "private-blue",   "nameKey": "objectives.privateBlue.name",   "color": "blue"   },
  { "id": "private-purple", "nameKey": "objectives.privatePurple.name", "color": "purple" }
]
```

### `src/data/windowPatterns.json`
```json
[
  {
    "id": "fulgor-del-cielo",
    "name": "Fulgor del Cielo",
    "difficulty": 6,
    "grid": [
      [{"type":"none"},{"type":"color","value":"yellow"},{"type":"value","value":5},{"type":"none"},{"type":"none"}],
      ...
    ]
  }
]
```
Each entry in `grid` is a `CellRestriction` object (see types).

---

## 7. TypeScript Types (`src/types/game.ts`)

```ts
export type DiceColor = 'red' | 'yellow' | 'green' | 'blue' | 'purple';
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface Die {
  color: DiceColor;
  value: DiceValue;
}

export type CellRestriction =
  | { type: 'color'; value: DiceColor }
  | { type: 'value'; value: DiceValue }
  | { type: 'none' };

export interface Cell {
  restriction: CellRestriction;
  die: Die | null;
}

export type BoardState = Cell[][]; // [4 rows][5 cols]

export type PublicScoringType =
  | 'rowColorVariety'
  | 'colColorVariety'
  | 'rowShadeVariety'
  | 'colShadeVariety'
  | 'lightShades'
  | 'mediumShades'
  | 'deepShades'
  | 'shadeVariety'
  | 'colorVariety'
  | 'colorDiagonals';

export interface PublicObjective {
  id: string;
  nameKey: string;
  descriptionKey: string;
  vpPerUnit: number;
  scoringType: PublicScoringType;
}

export interface PrivateObjective {
  id: string;
  nameKey: string;
  color: DiceColor;
}

export interface WindowPattern {
  id: string;
  name: string;
  difficulty: number;
  grid: CellRestriction[][];
}

export interface ObjectiveScore {
  objective: PublicObjective;
  vp: number;
}

export interface ScoreBreakdown {
  publicObjectives: ObjectiveScore[];
  privateObjective: { objective: PrivateObjective; vp: number };
  favorTokens: number;
  openSpacePenalty: number;
  total: number;
}

export interface ValidationError {
  row: number;
  col: number;
  rule: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
  message: string;
}
```

---

## 8. Hook Contracts

### `useBoardState`
```ts
interface UseBoardStateReturn {
  board: BoardState;
  setDie: (row: number, col: number, die: Die | null) => void;
  loadPattern: (pattern: WindowPattern) => void;
  prefillFromAnalysis: (placements: AnalysisPlacement[]) => void;
  reset: () => void;
}
interface AnalysisPlacement { row: number; col: number; color: DiceColor; value: DiceValue; }
```

### `usePhotoAnalysis`
```ts
interface UsePhotoAnalysisReturn {
  analyse: (dataUrl: string) => Promise<AnalysisPlacement[]>;
  loading: boolean;
  error: string | null;
}
```
- Converts dataUrl to base64, POSTs to Gemini REST endpoint.
- Parses the model's JSON response into `AnalysisPlacement[]`.
- Throws/returns error string on failure.
- **Does not store the image.**

### `useScoring`
```ts
type UseScoring = (
  board: BoardState,
  selectedPublic: PublicObjective[],
  selectedPrivate: PrivateObjective | null,
  favorTokens: number
) => ScoreBreakdown | null;
```

### `useValidation`
```ts
type UseValidation = (board: BoardState) => ValidationError[];
```
Returns an array (empty = no errors). Each error contains `row`, `col`, violated rule ID, and human-readable message.

---

## 9. Component Responsibilities

### `BoardGrid`
- Renders 4 × 5 grid of `BoardCell`.
- Receives `board: BoardState`, `errors: ValidationError[]`, `onCellClick: (row, col) => void`.

### `BoardCell`
- Renders a single cell: restriction indicator (color swatch or value number) + placed die (colored circle with value) or empty.
- Highlights red border when `errors` contains an entry for that cell.
- Tapping calls `onCellClick`.

### `DiePicker`
- Modal/sheet for selecting color + value (or clearing).
- Colors rendered as colored buttons; values 1-6 rendered as buttons.

### `ObjectiveSelector`
- Receives `objectives`, `selected`, `onToggle`, `max` (1 or 3), `label`.
- Renders list of `ObjectiveCard` items; enforces `max` selection limit.

### `ObjectiveCard`
- Displays objective name, VP info, description (all via i18n keys).
- Highlighted when selected.

### `ScoreDisplay`
- Shows total VP prominently.
- Below shows `ScoreBreakdown` table.

### `ValidationBanner`
- Shows if any `ValidationError[]` exist; lists each error with cell reference.

### `StepWizard`
- Controls linear 3-step flow: **Board → Objectives → Score**.
- Shows step indicator; prev/next buttons.

### `TokenCounter`
- Increment/decrement counter for remaining favor tokens (0–∞).

### `WindowPatternSelector`
- Dropdown/modal listing all patterns from JSON.
- On select: calls `loadPattern` from `useBoardState`.

### `LanguageSwitcher`
- Toggle button in the `Header` that switches between `en` and `es`.
- Persists choice to `localStorage` via i18next `LanguageDetector`.

---

## 10. Gemini API Integration

### Endpoint
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=VITE_GEMINI_API_KEY
```

### Request body
```json
{
  "contents": [
    {
      "parts": [
        {
          "inlineData": {
            "mimeType": "image/jpeg",
            "data": "<base64>"
          }
        },
        {
          "text": "This is a Sagrada board game window (4 rows × 5 columns grid). Identify each die placed on the board. Return ONLY a valid JSON array, no markdown fences, with objects: { \"row\": 0-3, \"col\": 0-4, \"color\": \"red|yellow|green|blue|purple\", \"value\": 1-6 }. Use 0-based row/col indices. Omit empty cells."
        }
      ]
    }
  ]
}
```

### Response parsing
- Extract `candidates[0].content.parts[0].text`.
- `JSON.parse()` it as `AnalysisPlacement[]`.
- Validate that each entry has valid `row` (0-3), `col` (0-4), `color`, and `value` before applying to board.

---

## 11. Photo Handling Policy

- Photos are **never stored** (no `useState` persisting a dataUrl beyond the analysis call).
- `usePhotoAnalysis.analyse()` receives the dataUrl, calls Gemini, then lets it go out of scope.
- The existing `PhotoGallery` component (which stored photos) must be **removed** and replaced with the analysis flow.

---

## 12. Dependency Additions Required

```bash
# Formatting
npm install -D prettier

# Prettier ESLint integration
npm install -D eslint-config-prettier

# Internationalisation
npm install i18next react-i18next i18next-browser-languagedetector

# Nothing else — Gemini is called via native fetch(), no SDK needed
```

---

## 13. Internationalisation Setup

### `src/i18n.ts`
```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    interpolation: { escapeValue: false },
  });

export default i18n;
```

Import `src/i18n.ts` once at the top of `src/main.tsx` (side-effect import).

### Translation key structure (`src/locales/en/translation.json`)
```json
{
  "header": { "title": "Sagrada Counter" },
  "steps": { "board": "Board", "objectives": "Objectives", "score": "Score" },
  "board": {
    "selectPattern": "Select Window Pattern",
    "analysePhoto": "Analyse Photo",
    "clearCell": "Clear cell",
    "empty": "Empty"
  },
  "diePicker": { "title": "Place a die", "color": "Color", "value": "Value", "clear": "Clear", "confirm": "Confirm" },
  "objectives": { "publicLabel": "Public Objectives (choose 3)", "privateLabel": "Private Objective" },
  "score": {
    "total": "Total VP",
    "publicObjectives": "Public Objectives",
    "privateObjective": "Private Objective",
    "favorTokens": "Favor Tokens",
    "openSpaces": "Open Spaces"
  },
  "validation": {
    "P1": "First die must be on an edge or corner.",
    "P2": "Die must be adjacent to an existing die.",
    "P3": "Die color does not match cell restriction.",
    "P4": "Die value does not match cell restriction.",
    "P5": "Two orthogonally adjacent dice share the same color.",
    "P6": "Two orthogonally adjacent dice share the same value."
  },
  "photo": {
    "capture": "Take Photo",
    "upload": "Upload Photo",
    "analysing": "Analysing…",
    "error": "Could not analyse photo. Please try again or fill in manually."
  },
  "tokens": { "label": "Favor Tokens remaining" },
  "language": { "en": "English", "es": "Español" },
  "common": { "next": "Next", "back": "Back", "reset": "Reset" },
  "objectives": {
    "rowColorVariety": { "name": "Row Color Variety", "description": "6 VP for each row with no repeated colors" },
    "colColorVariety": { "name": "Column Color Variety", "description": "5 VP for each column with no repeated colors" },
    "rowShadeVariety": { "name": "Row Shade Variety", "description": "5 VP for each row with no repeated values" },
    "colShadeVariety": { "name": "Column Shade Variety", "description": "4 VP for each column with no repeated values" },
    "lightShades": { "name": "Light Shades", "description": "2 VP per pair of 1 and 2 value dice" },
    "mediumShades": { "name": "Medium Shades", "description": "2 VP per pair of 3 and 4 value dice" },
    "deepShades": { "name": "Deep Shades", "description": "2 VP per pair of 5 and 6 value dice" },
    "shadeVariety": { "name": "Shade Variety", "description": "5 VP per set of one die of each value (1–6)" },
    "colorVariety": { "name": "Color Variety", "description": "4 VP per set of one die of each color" },
    "colorDiagonals": { "name": "Color Diagonals", "description": "1 VP per die diagonally adjacent to a die of the same color" },
    "privateRed": { "name": "Shades of Red" },
    "privateYellow": { "name": "Shades of Yellow" },
    "privateGreen": { "name": "Shades of Green" },
    "privateBlue": { "name": "Shades of Blue" },
    "privatePurple": { "name": "Shades of Purple" },
    "publicLabel": "Public Objectives (choose 3)",
    "privateLabel": "Private Objective"
  }
}
```

`src/locales/es/translation.json` must mirror all keys with Spanish translations.

### `LanguageSwitcher` component
```tsx
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const toggle = () => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  return (
    <button onClick={toggle} aria-label="Switch language">
      {i18n.language === 'en' ? t('language.es') : t('language.en')}
    </button>
  );
};
```

---

## 14. Environment Variables

`.env` (gitignored):
```
VITE_GEMINI_API_KEY=your_key_here
```

`.env.example` (committed):
```
VITE_GEMINI_API_KEY=
```

---

## 15. Existing Files to Refactor/Delete

| File | Action |
|---|---|
| `src/App.tsx` | Full rewrite — new step-wizard layout |
| `src/components/PhotoCapture.tsx` | Refactor to `React.FC<>` + move to `components/photo/` |
| `src/components/PhotoUpload.tsx` | Refactor to `React.FC<>` + move to `components/photo/` |
| `src/components/PhotoGallery.tsx` | **Delete** — no persistence |

---

## 16. Phase Checklist (for tracking progress)

- [ ] **Phase 0** — Add Prettier, add i18next + locale files, refactor existing components, create `types/game.ts`, add JSON data files
- [ ] **Phase 1** — `BoardGrid`, `BoardCell`, `DiePicker`, `useBoardState`, `WindowPatternSelector`
- [ ] **Phase 2** — `usePhotoAnalysis`, integrate with board prefill, refactor photo components
- [ ] **Phase 3** — `ObjectiveSelector`, `ObjectiveCard`, `TokenCounter`
- [ ] **Phase 4** — `useScoring`, `ScoreDisplay`, `ScoreBreakdown`
- [ ] **Phase 5** — `useValidation`, `ValidationBanner`, board cell error highlights
- [ ] **Phase 6** — `StepWizard`, `Header` + `LanguageSwitcher`, UX polish, accessibility, verify all strings translated
