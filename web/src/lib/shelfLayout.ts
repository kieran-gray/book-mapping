import type { BookData } from "../types";

// Turns a shelf's books into a lived-in arrangement: most stand upright, a few
// lean or sit backwards, a flat stack breaks the run, a plant bookends them, and
// faint blank volumes fill the rest. Everything is derived from each book's id,
// so it looks hand-arranged but never reshuffles between renders.

export type Pose = "upright" | "lean-left" | "lean-right" | "backward";
export type ObjectKind = "fern" | "succulent" | "stack";

export interface BookSlot {
  kind: "book";
  key: string;
  book: BookData;
  color: string;
  width: number;
  height: number;
  pose: Pose;
  leanDeg: number;
}

export interface BlankSlot {
  kind: "blank";
  key: string;
  index: number;
  width: number;
  height: number;
  tone: string;
}

export interface ObjectSlot {
  kind: "object";
  key: string;
  object: ObjectKind;
}

export type Slot = BookSlot | BlankSlot | ObjectSlot;

export interface ShelfBookInput {
  book: BookData;
  color: string;
  baseHeight: number;
}

const BLANK_TONES = ["#d8c7a4", "#cdbf9c", "#d2c3a0", "#c7b793", "#dccdad"];
const SPINE_WIDTHS = [42, 46, 52, 58];
const TARGET_FILL = 9;

// FNV-1a — small, stable string hash
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

function bookSlot({ book, color, baseHeight }: ShelfBookInput): BookSlot {
  const h = hash(book.slug || book.title);
  const width = SPINE_WIDTHS[h % SPINE_WIDTHS.length];
  const height = clamp(baseHeight + (((h >>> 3) % 5) - 2) * 9, 126, 268);

  let pose: Pose = "upright";
  const p = (h >>> 6) % 100;
  if (p < 12) pose = "backward";
  else if (p < 26) pose = (h & 1) === 0 ? "lean-left" : "lean-right";

  const leanDeg =
    pose === "lean-left"
      ? -(5 + (h % 4))
      : pose === "lean-right"
        ? 5 + (h % 4)
        : 0;

  return {
    kind: "book",
    key: book.slug,
    book,
    color,
    width,
    height,
    pose,
    leanDeg,
  };
}

export function composeShelf(
  inputs: ShelfBookInput[],
  shelfIndex: number,
): Slot[] {
  const bookSlots = inputs.map(bookSlot);

  // two leaners side by side would collide — straighten the second one
  for (let i = 1; i < bookSlots.length; i++) {
    if (bookSlots[i - 1].leanDeg !== 0 && bookSlots[i].leanDeg !== 0) {
      bookSlots[i].pose = "upright";
      bookSlots[i].leanDeg = 0;
    }
  }

  const slots: Slot[] = [];
  const sh = hash(`shelf-${shelfIndex}`);
  let objectCount = 0;

  // a flat stack breaks up a long run of spines
  if (bookSlots.length >= 5) {
    const at = 2 + (sh % Math.max(1, bookSlots.length - 3));
    bookSlots.forEach((slot, i) => {
      if (i === at) {
        slots.push({
          kind: "object",
          key: `stack-${shelfIndex}`,
          object: "stack",
        });
        objectCount++;
      }
      slots.push(slot);
    });
  } else {
    slots.push(...bookSlots);
  }

  // a little plant bookends your collection
  if (bookSlots.length > 0) {
    slots.push({
      kind: "object",
      key: `succ-${shelfIndex}`,
      object: "succulent",
    });
    objectCount++;
  }

  // faint blank volumes fill whatever's left, inviting the shelf to grow
  const used = bookSlots.length + objectCount;
  const blankCount = clamp(
    TARGET_FILL - used,
    bookSlots.length === 0 ? 6 : 0,
    9,
  );
  for (let i = 0; i < blankCount; i++) {
    const h = hash(`blank-${shelfIndex}-${i}`);
    slots.push({
      kind: "blank",
      key: `blank-${shelfIndex}-${i}`,
      index: i,
      width: SPINE_WIDTHS[h % 3],
      height: clamp(152 + ((h >>> 3) % 6) * 9, 152, 214),
      tone: BLANK_TONES[h % BLANK_TONES.length],
    });
  }

  // a leafy fern always anchors the end of the shelf
  slots.push({ kind: "object", key: `fern-${shelfIndex}`, object: "fern" });

  return slots;
}
