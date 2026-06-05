import type { BookData, BookPose, ShelfObjectKind } from "../types";

// Turns a shelf's books (+ any placed objects) into a lived-in arrangement: most
// stand upright, a few lean / sit backwards / lie flat, a stack breaks the run, a
// plant bookends them, and faint blanks fill the rest. Auto-variation is derived
// from each book's id, so it looks hand-arranged but never reshuffles.

export type Pose = "upright" | "lean-left" | "lean-right" | "backward" | "flat";

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
  object: ShelfObjectKind;
}

export type Slot = BookSlot | BlankSlot | ObjectSlot;

export interface ShelfBookInput {
  book: BookData;
  color: string;
  baseHeight: number;
  pose?: BookPose;
  order?: number;
}

export interface ShelfObjectInput {
  id: string;
  kind: ShelfObjectKind;
  order: number;
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

function bookSlot(input: ShelfBookInput): BookSlot {
  const { book, color, baseHeight } = input;
  const h = hash(book.slug || book.title);
  const width = SPINE_WIDTHS[h % SPINE_WIDTHS.length];

  // NOTE: always the *unsigned* shift `>>>` — signed `>>` goes negative for
  // high-bit hashes and skews the distribution (once made everything backward).
  const override = input.pose && input.pose !== "auto" ? input.pose : null;
  let pose: Pose;
  if (override === "upright") pose = "upright";
  else if (override === "backward") pose = "backward";
  else if (override === "flat") pose = "flat";
  else if (override === "lean")
    pose = (h & 1) === 0 ? "lean-left" : "lean-right";
  else {
    const p = (h >>> 6) % 100;
    if (p < 12) pose = "backward";
    else if (p < 26) pose = (h & 1) === 0 ? "lean-left" : "lean-right";
    else pose = "upright";
  }

  const leanDeg =
    pose === "lean-left"
      ? -(5 + (h % 4))
      : pose === "lean-right"
        ? 5 + (h % 4)
        : 0;

  // a flat book lies down: wide and short, regardless of its standing height
  const height =
    pose === "flat"
      ? 26 + (h % 3) * 3
      : clamp(baseHeight + (((h >>> 3) % 5) - 2) * 9, 126, 268);
  const finalWidth = pose === "flat" ? 80 + (h % 3) * 6 : width;

  return {
    kind: "book",
    key: book.slug,
    book,
    color,
    width: finalWidth,
    height,
    pose,
    leanDeg,
  };
}

function blankSlot(shelfIndex: number, index: number): BlankSlot {
  const h = hash(`blank-${shelfIndex}-${index}`);
  return {
    kind: "blank",
    key: `blank-${shelfIndex}-${index}`,
    index,
    width: SPINE_WIDTHS[h % 3],
    height: clamp(152 + ((h >>> 3) % 6) * 9, 152, 214),
    tone: BLANK_TONES[h % BLANK_TONES.length],
  };
}

// When the user hasn't placed any objects, the shelf decorates itself.
function composeAuto(books: ShelfBookInput[], shelfIndex: number): Slot[] {
  const bookSlots = books.map(bookSlot);

  // two leaners side by side would collide — straighten the second
  for (let i = 1; i < bookSlots.length; i++) {
    if (bookSlots[i - 1].leanDeg !== 0 && bookSlots[i].leanDeg !== 0) {
      bookSlots[i].pose = "upright";
      bookSlots[i].leanDeg = 0;
    }
  }

  const slots: Slot[] = [];
  const sh = hash(`shelf-${shelfIndex}`);
  let objectCount = 0;

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

  if (bookSlots.length > 0) {
    slots.push({
      kind: "object",
      key: `succ-${shelfIndex}`,
      object: "succulent",
    });
    objectCount++;
  }

  const used = bookSlots.length + objectCount;
  const blankCount = clamp(
    TARGET_FILL - used,
    bookSlots.length === 0 ? 6 : 0,
    9,
  );
  for (let i = 0; i < blankCount; i++) slots.push(blankSlot(shelfIndex, i));

  slots.push({ kind: "object", key: `fern-${shelfIndex}`, object: "fern" });
  return slots;
}

export function composeShelf(
  books: ShelfBookInput[],
  objects: ShelfObjectInput[],
  shelfIndex: number,
): Slot[] {
  // No placed objects → the shelf arranges (and decorates) itself.
  if (objects.length === 0) return composeAuto(books, shelfIndex);

  // Otherwise books and objects are placed by their explicit order.
  const ordered = [
    ...books.map((b) => ({
      order: b.order ?? 9999,
      slot: bookSlot(b),
    })),
    ...objects.map((o) => ({
      order: o.order,
      slot: {
        kind: "object" as const,
        key: `obj-${o.id}`,
        object: o.kind,
      },
    })),
  ].sort((a, b) => a.order - b.order);

  const slots: Slot[] = ordered.map((o) => o.slot);

  const blankCount = clamp(TARGET_FILL - ordered.length, 0, 9);
  for (let i = 0; i < blankCount; i++) slots.push(blankSlot(shelfIndex, i));

  return slots;
}
