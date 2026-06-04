import type { ObjectKind } from "../lib/shelfLayout";

// Decorative objects that sit between books to give the shelf character.
// Plants use the foliage tokens; pots are terracotta. Purely atmospheric.

function Fern() {
  return (
    <svg
      className="shelf-object__svg shelf-object__svg--fern"
      viewBox="0 0 72 118"
      aria-hidden="true"
    >
      <g fill="var(--foliage-deep)">
        <path d="M36 88 C 18 66 14 38 22 12 C 33 40 41 64 39 88 Z" />
        <path d="M36 88 C 54 66 58 38 50 12 C 39 40 31 64 33 88 Z" />
      </g>
      <g fill="var(--foliage)">
        <path d="M36 90 C 24 78 14 60 12 40 C 30 56 35 74 38 90 Z" />
        <path d="M36 90 C 48 78 58 60 60 40 C 42 56 37 74 34 90 Z" />
        <path d="M36 92 C 33 66 33 44 36 20 C 39 44 39 66 36 92 Z" />
      </g>
      <path d="M18 90 H54 L50 116 H22 Z" fill="#b3703c" />
      <rect x="15" y="84" width="42" height="9" rx="2.5" fill="#9a5c30" />
      <rect x="15" y="84" width="42" height="3" rx="1.5" fill="#c4824d" />
    </svg>
  );
}

function Succulent() {
  return (
    <svg
      className="shelf-object__svg shelf-object__svg--succulent"
      viewBox="0 0 52 72"
      aria-hidden="true"
    >
      <g fill="var(--foliage)">
        <path d="M26 44 C 16 36 10 28 8 18 C 20 24 26 32 26 44 Z" />
        <path d="M26 44 C 36 36 42 28 44 18 C 32 24 26 32 26 44 Z" />
        <path d="M26 45 C 14 42 6 38 2 32 C 16 38 24 40 26 45 Z" />
        <path d="M26 45 C 38 42 46 38 50 32 C 36 38 28 40 26 45 Z" />
        <path d="M26 44 C 20 30 20 20 26 12 C 32 20 32 30 26 44 Z" />
      </g>
      <g fill="var(--foliage-deep)">
        <path d="M26 44 C 22 34 22 26 26 18 C 30 26 30 34 26 44 Z" />
      </g>
      <path d="M14 46 H38 L35 68 H17 Z" fill="#b3703c" />
      <rect x="11" y="41" width="30" height="8" rx="2.5" fill="#9a5c30" />
      <rect x="11" y="41" width="30" height="3" rx="1.5" fill="#c4824d" />
    </svg>
  );
}

function BookStack() {
  return (
    <svg
      className="shelf-object__svg shelf-object__svg--stack"
      viewBox="0 -10 94 68"
      aria-hidden="true"
    >
      <rect x="6" y="42" width="82" height="13" rx="2" fill="#5a2a3a" />
      <rect
        x="80"
        y="44"
        width="6"
        height="9"
        rx="1"
        fill="rgba(244,236,217,0.45)"
      />
      <rect x="11" y="30" width="70" height="12" rx="2" fill="#2a4a3f" />
      <rect
        x="74"
        y="32"
        width="5"
        height="8"
        rx="1"
        fill="rgba(244,236,217,0.45)"
      />
      <rect x="5" y="19" width="80" height="12" rx="2" fill="#3c2415" />
      <rect
        x="79"
        y="21"
        width="5"
        height="8"
        rx="1"
        fill="rgba(244,236,217,0.45)"
      />
      {/* a tiny potted plant resting on top */}
      <path d="M58 8 H72 L70 19 H60 Z" fill="#b3703c" />
      <rect x="57" y="6" width="16" height="3" rx="1.5" fill="#9a5c30" />
      <g fill="var(--foliage)">
        <path d="M65 8 C 61 1 61 -4 65 -8 C 69 -4 69 1 65 8 Z" />
        <path d="M65 8 C 59 4 56 -1 55 -5 C 62 -1 65 3 65 8 Z" />
        <path d="M65 8 C 71 4 74 -1 75 -5 C 68 -1 65 3 65 8 Z" />
      </g>
    </svg>
  );
}

export default function ShelfObject({ kind }: { kind: ObjectKind }) {
  if (kind === "fern") return <Fern />;
  if (kind === "succulent") return <Succulent />;
  return <BookStack />;
}
