import { useEffect, useState } from "react";
import type { ShelfObjectKind } from "../types";

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

function Candle() {
  return (
    <svg
      className="shelf-object__svg shelf-object__svg--candle"
      viewBox="0 0 34 72"
      aria-hidden="true"
    >
      <ellipse
        className="candle-glow"
        cx="17"
        cy="15"
        rx="9"
        ry="13"
        fill="rgba(246,213,150,0.45)"
      />
      <g className="candle-flame">
        <path
          d="M17 6 C 21 12 21 18 17 22 C 13 18 13 12 17 6 Z"
          fill="#f0a93a"
        />
        <path
          d="M17 10 C 19 14 19 18 17 21 C 15 18 15 14 17 10 Z"
          fill="#fff3c4"
        />
      </g>
      <rect x="10" y="22" width="14" height="38" rx="3" fill="#efe6d0" />
      <rect x="10" y="22" width="5" height="38" rx="3" fill="#f7f0df" />
      <path d="M7 59 H27 L24 67 H10 Z" fill="#b08a3a" />
      <ellipse cx="17" cy="59" rx="10" ry="3" fill="#caa24e" />
    </svg>
  );
}

// The little carriage clock keeps real time — its hands track the wall clock and
// the slim hand sweeps the seconds, so the shelf always feels a touch alive.
function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const cx = 25;
  const cy = 24;
  // a hand pointing `turns` of the way around the dial (0 = 12 o'clock), length in user units
  const hand = (turns: number, length: number) => {
    const a = turns * 2 * Math.PI;
    return {
      x: (cx + length * Math.sin(a)).toFixed(2),
      y: (cy - length * Math.cos(a)).toFixed(2),
    };
  };
  const secTurn = now.getSeconds() / 60;
  const minTurn = (now.getMinutes() + secTurn) / 60;
  const hourTurn = ((now.getHours() % 12) + minTurn) / 12;
  const h = hand(hourTurn, 7.5);
  const m = hand(minTurn, 11);
  const s = hand(secTurn, 12);

  return (
    <svg
      className="shelf-object__svg shelf-object__svg--clock"
      viewBox="0 0 50 56"
      aria-hidden="true"
    >
      <rect x="11" y="43" width="6" height="7" rx="1.5" fill="#6c4427" />
      <rect x="33" y="43" width="6" height="7" rx="1.5" fill="#6c4427" />
      <circle cx="25" cy="24" r="20" fill="#8a5a32" />
      <circle cx="25" cy="24" r="15" fill="#f4ecd9" />
      <circle
        cx="25"
        cy="24"
        r="15"
        fill="none"
        stroke="#caa24e"
        strokeWidth="1.5"
      />
      <line
        x1={cx}
        y1={cy}
        x2={h.x}
        y2={h.y}
        stroke="#3c2f20"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={m.x}
        y2={m.y}
        stroke="#3c2f20"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={s.x}
        y2={s.y}
        stroke="#9e4b46"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <circle cx="25" cy="24" r="1.6" fill="#3c2f20" />
    </svg>
  );
}

function Teacup() {
  return (
    <svg
      className="shelf-object__svg shelf-object__svg--teacup"
      viewBox="0 0 54 40"
      aria-hidden="true"
    >
      <path
        className="steam steam--1"
        d="M22 5 C 19 9 25 11 22 15"
        stroke="rgba(140,140,140,0.45)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        className="steam steam--2"
        d="M31 4 C 28 9 34 11 31 15"
        stroke="rgba(140,140,140,0.45)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 21 C 47 20 47 29 39 29"
        stroke="#e7d7b8"
        strokeWidth="3"
        fill="none"
      />
      <path d="M14 18 H40 L36 32 H18 Z" fill="#f4ecd9" />
      <ellipse cx="27" cy="18" rx="13" ry="3" fill="#9e4b46" />
      <ellipse cx="27" cy="34" rx="20" ry="4" fill="#efe6d0" />
      <ellipse cx="27" cy="33" rx="20" ry="3.5" fill="#f7f0df" />
    </svg>
  );
}

const OBJECTS: Record<ShelfObjectKind, () => React.JSX.Element> = {
  fern: Fern,
  succulent: Succulent,
  stack: BookStack,
  candle: Candle,
  clock: Clock,
  teacup: Teacup,
};

export default function ShelfObject({ kind }: { kind: ShelfObjectKind }) {
  const Component = OBJECTS[kind];
  return <Component />;
}
