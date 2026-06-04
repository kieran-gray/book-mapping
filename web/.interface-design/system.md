# Interface Design System — Book Mapping

A reader's companion for fictional worlds (characters, locations, relationships, world
maps). The app presents itself **as a physical book**: a shelf of standing volumes →
open one → a two-page spread you turn through → close it.

## Direction & feel

A **cozy, sunlit vintage reading room**. Warm cream walls washed with golden
window-light, lit honey-oak shelves, jewel-tone book spines, green plants, a soft
dusty-burgundy. Nostalgic, comfortable, airy.

The shelf must feel **lived-in and personal**, never a uniform grid: uneven heights and
widths, books that lean / sit backwards, flat stacks, plants and trinkets between them.
The goal is that users make the bookshelf **their home**. Arrangement is **automatic with
light overrides** — the shelf composes itself from each book's identity; the user nudges.

**NOT** dark / medieval / gothic, and **NOT** serif — both were tried and rejected.
Reference image: `~/Downloads/test.webp`.

## Palette (tokens — `src/index.css` `:root`)

Everything traces to these; no loose hex in components (scene art excepted — see below).

| Token                                                     | Role                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `--ink` / `--ink-soft` / `--ink-faint` / `--ink-ghost`    | warm-brown text, 4 levels (primary → placeholder)                                                |
| `--parchment` / `--parchment-aged` / `--parchment-shadow` | warm cream paper surfaces (card / wall / shadowed fold)                                          |
| `--sun` / `--sun-soft` / `--sun-deep`                     | golden window-light; the primary-button fill                                                     |
| `--gilt` / `--gilt-bright` / `--gilt-deep`                | gold leaf — the **accent** (emphasis, glints, focus). On light bg use `--gilt-deep` for contrast |
| `--cream` / `--cream-dim`                                 | light text on dark/colored spines & wood                                                         |
| `--thread` / `--thread-strong` / `--thread-faint`         | soft warm borders, 3 weights                                                                     |
| `--wood` / `--wood-light` / `--wood-dark`                 | lit oak/walnut — bookcase, frames, heading color                                                 |
| `--foliage` / `--foliage-deep`                            | sage greenery — ivy, climbing vines, potted plants                                               |
| `--blood` / `--blood-bright` / `--blood-deep`             | dusty burgundy — **destructive** (never Bootstrap red)                                           |
| `--font-sans`                                             | `"IBM Plex Sans"` — the only typeface                                                            |

**Accent discipline:** gilt/honey is the single accent. Burgundy = destructive only.
Sage = greenery only. No multi-accent rainbows. (Terracotta pots & garden-glass greens
live as literals inside the scene SVGs — they're illustration, not UI tokens.)

## Type

IBM Plex Sans everywhere. Headings earn presence through **weight (600) + tracking
(-0.01em) + size**, not a display face. Body/labels 400–600. No serif.

## Depth & light

**Soft warm shadows + subtle layering** (daylight, not borders-only, not dramatic).
Shadows are warm brown, never black: `rgba(76, 46, 22, …)` at low alpha. Physical objects
(spines, boards, the case) get real cast shadows + a top gleam.

**Light comes from the window on the RIGHT.** Everything references it: the bookcase's
drop-shadow falls left, the sun pools bottom-right on the floor, light shafts fan
down-left. Keep this consistent for anything new.

Atmosphere layering uses `z-index` inside the view's `isolation: isolate` context:
`-1` = behind everything (window, beams, ivy, glow); content = default; `+2/+3` = the
faint over-content light wash + volumetric `soft-light` shafts that graze the books.

## Spacing & radius

- Base unit **4px** — scale 4 / 8 / 12 / 16 / 24 / 32.
- Radius: 4–6px inputs/buttons, 7–8px cards/panels, 10px modals, 2–5px spines.

## The scene (bookshelf view — `src/views/Home.css`, `Bookshelf.tsx`)

- **Room** `.bookshelf-view`: `position: relative; isolation: isolate; overflow: hidden`.
  Background = floor sun-pool (bottom-right) + window glow (top-right) over a wall→floor
  wash. `::before` = blurred warm halo at the window; `::after` = faint light wash over
  the right of the room.
- **Window** `.windowwall` (right wall, `z-index:-1`, hidden ≤720px): arched multi-pane
  window. Glass = sky→foliage linear gradient + warm sun radial; `::before` = blurred
  foliage outside; muntins = a CSS grid of bordered `<i>` cells; wood frame via border +
  `border-radius` arch. `.beam`×3 (inside) = blurred warm gradient bars, rotated, fanning
  into the room.
- **Light shafts** `.sunshaft`×2: direct children of the view, `z-index:3`,
  `mix-blend-mode: soft-light`, heavy blur, rotated — volumetric sun crossing in front of
  the scene without washing the books out.
- **Greenery (hand SVG, `--foliage`):** `.ivy` sprigs drape the top corners;
  `.bookcase__vine` climbs both sides of the case (wavy stem + alternating leaves,
  `preserveAspectRatio="none"`, `vector-effect: non-scaling-stroke`). One leaf path is
  reused everywhere (`IVY_LEAF`).

## The bookcase (real furniture)

`.bookcase` is a piece of furniture, lit from the right (shadow falls left via
`filter: drop-shadow`):

- `.bookcase__top` crown (overhangs), `.bookcase__base` plinth.
- `.bookcase__body` = recessed oak back (gradient + inset shadows) with side uprights
  drawn by `::before`/`::after` (right post lighter = lit, left darker).
- Shelves live inside; each `.bookshelf-plank` becomes a real board (no float, sits on the
  back panel).

## Lived-in shelf engine

- `src/lib/shelfLayout.ts` — `composeShelf(inputs, shelfIndex)` returns an ordered list of
  **slots**, derived deterministically from a stable FNV-1a hash of each book's id (looks
  hand-arranged, never reshuffles). **Always use the unsigned shift `>>>`** when deriving
  variation — signed `>>` goes negative for high-bit hashes and skews everything (this bug
  made every book render "backward"; don't reintroduce it).
  - **book** slot: pose (`upright` / `lean-left` / `lean-right` / `backward`) + width +
    height jitter + resolved color. Two adjacent leaners get straightened.
  - **object** slot: `fern` / `succulent` / `stack`.
  - **blank** slot: a faint unlabeled placeholder, carries an `index`.
  - Composition: books → a flat **stack** mid-run (if ≥5 books) → a **succulent** bookend →
    **blanks** fill to `TARGET_FILL` → a **fern** anchors the end. An empty shelf = blanks
    - fern (no "empty" message in view mode).
- `src/components/ShelfObjects.tsx` — `<ShelfObject kind>` → Fern / Succulent / BookStack
  SVGs (foliage leaves, terracotta pots). Sized via `.shelf-object__svg--*`,
  `pointer-events: none`, bottom-aligned on the board.
- **Edit mode vs view mode:** edit mode renders a **tidy upright grid** of real books with
  their catalog cards (easy managing); view mode renders the **composed arrangement**.
  Clicking a blank opens the New Book modal (the "blank turns into your book" hook).
- **Poses (CSS):** a `--lean` custom prop on the spine drives
  `transform: rotate(var(--lean))` (base and `:hover` both compose it; origin bottom).
  `--backward` swaps the gilt frame for `.bookshelf-book__pages` (page-edge lines) on a
  cream ground. `--blank` = faint, low-contrast, clickable.
- **Responsive:** blanks render with a `blank-{index}` class; media queries
  (`Home.css`, 1024/880/720/560px) progressively hide the higher-index blanks so a shelf
  row **never wraps/stacks** as it narrows. Real books and objects always stay.

## Other component patterns

- **Buttons** `.bookshelf-btn`: warm paper gradient, `--thread-strong` border, inset white
  highlight + soft warm shadow, lucide icon tinted `--gilt-deep`. `--add` (primary verb) =
  `--sun → --sun-deep` honey fill; `--edit.active` = pressed-in parchment + gilt border.
- **Spine** `.bookshelf-book`: dynamic `backgroundColor`/`width`/`height`/`--lean` via
  inline style; CSS paints a 90° sheen, a left hinge (`::before`), a tooled gilt frame
  (`::after`). Title `--cream`, `writing-mode: vertical-rl`, uppercase.
- **Range slider** `.shelf-settings input[type=range]`: fully custom gilt track + radial
  thumb (`::-webkit-slider-thumb` + `::-moz-range-thumb`). Never rely on native.
- **Modal** `.bookshelf-modal`: warm scrim, parchment card with gilt hairline ring, honey
  primary + ghost cancel. Bookshelf-scoped so the shared `.edit-modal` (5 other
  components) is untouched.

## Conventions

- **Icons: lucide-react, never emoji.** Emoji render as OS-colored glyphs that break the
  warm palette; lucide can be tinted (`--gilt-deep` / `--wood-dark` / `--ink`).
- **Custom controls** for `<select>`/`range` — style state yourself.
- Scene/decor are **hand SVG** (ivy, vines, plants), foliage-tinted, `aria-hidden`,
  `pointer-events: none`. Reuse the shared leaf path.
- BEM-ish class names; dynamic values via inline `style`, everything else via tokens.
- Icon-only buttons get `aria-label`.

## Planned (not yet built)

- **Phase 2 — light overrides:** per-book pose override in edit mode (upright / lean /
  flat / backward / auto) and an **object tray** to place plants & trinkets on a shelf.
- **Phase 3:** drag to reorder books and objects.

## Gotcha

`useBookData(seedData)` reads `seedData.slug` eagerly, so callers must never pass
`undefined` — `Home.tsx` uses an `EMPTY_BOOK` fallback so an empty library still renders
the shelf instead of crashing.
