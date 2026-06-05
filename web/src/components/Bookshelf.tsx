import { useState, type CSSProperties, type DragEvent } from "react";
import {
  Pencil,
  Check,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  BookPlus,
  GripVertical,
  X,
} from "lucide-react";
import type {
  BookData,
  BookDisplayConfig,
  BookPose,
  ShelfConfig,
  ShelfObjectItem,
  ShelfObjectKind,
} from "../types";
import { composeShelf, type Slot } from "../lib/shelfLayout";
import ShelfObject from "./ShelfObjects";

const OBJECT_KINDS: ShelfObjectKind[] = [
  "fern",
  "succulent",
  "stack",
  "candle",
  "clock",
  "teacup",
];

const POSE_OPTIONS: { value: BookPose; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "upright", label: "Upright" },
  { value: "lean", label: "Lean" },
  { value: "flat", label: "Flat" },
  { value: "backward", label: "Backward" },
];

const SPINE_COLORS = [
  "#3c2415",
  "#2a4a3f",
  "#4a2a2a",
  "#2a2a4a",
  "#4a3a2a",
  "#2a3a4a",
  "#5a2a3a",
  "#3a4a2a",
];

const COLOR_SWATCHES = [
  "#3c2415",
  "#2a4a3f",
  "#4a2a2a",
  "#2a2a4a",
  "#4a3a2a",
  "#2a3a4a",
  "#5a2a3a",
  "#3a4a2a",
  "#6b3a1f",
  "#1f3a4a",
  "#4a1f3a",
  "#2a5a3f",
];

const DEFAULT_DISPLAY: BookDisplayConfig = {
  height: 180,
  color: "#3c2415",
  shelf: 0,
};

// Decorative ivy draping from a top corner of the room (purely atmospheric)
const IVY_LEAF = "M0 0 C 6 -9 17 -8 20 1 C 16 7 7 8 0 0 Z";
const IVY_LEAVES = [
  "translate(20 6) rotate(20) scale(0.9)",
  "translate(40 20) rotate(60) scale(1.05)",
  "translate(54 40) rotate(110) scale(0.85)",
  "translate(60 64) rotate(40) scale(1.1)",
  "translate(66 86) rotate(120) scale(0.9)",
  "translate(80 104) rotate(70)",
  "translate(92 116) rotate(30) scale(0.8)",
];

// The window on the right wall: arched panes onto a sunlit garden, with
// soft shafts of light spilling into the room. Purely atmospheric.
function WindowScene() {
  return (
    <div className="windowwall" aria-hidden="true">
      <div className="window">
        <div className="window__grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <span className="beam beam--1" />
      <span className="beam beam--2" />
      <span className="beam beam--3" />
    </div>
  );
}

// A vine climbing up one side of the bookcase, leaves alternating off a wavy stem.
const VINE_STEM =
  "M34 474 C 18 432 50 402 34 360 C 18 320 50 292 34 250 C 18 210 50 182 34 140 C 18 100 50 72 36 22";
const VINE_LEAVES = [
  "translate(34 450) rotate(-32) scale(1.05)",
  "translate(46 422) rotate(38) scale(1.2)",
  "translate(22 392) rotate(150) scale(1)",
  "translate(47 356) rotate(28) scale(1.15)",
  "translate(22 330) rotate(165) scale(0.95)",
  "translate(47 292) rotate(34) scale(1.2)",
  "translate(22 264) rotate(158) scale(1)",
  "translate(46 226) rotate(30) scale(1.15)",
  "translate(23 198) rotate(166) scale(0.95)",
  "translate(47 160) rotate(30) scale(1.1)",
  "translate(23 132) rotate(162) scale(0.95)",
  "translate(45 96) rotate(34) scale(1.05)",
  "translate(27 66) rotate(150) scale(0.9)",
  "translate(40 34) rotate(22) scale(0.85)",
  "translate(33 14) rotate(120) scale(0.7)",
];

function ClimbingVine({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={`bookcase__vine bookcase__vine--${side}`}
      viewBox="0 0 76 484"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="vine-stem"
        d={VINE_STEM}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <g fill="currentColor">
        {VINE_LEAVES.map((t, i) => (
          <path key={i} d={IVY_LEAF} transform={t} />
        ))}
      </g>
    </svg>
  );
}

function IvySprig({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={`ivy ivy--${side}`}
      viewBox="0 0 120 130"
      aria-hidden="true"
    >
      <path
        className="ivy-stem"
        d="M6 -6 C 34 6 52 28 58 58 C 63 82 72 100 92 116"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        {IVY_LEAVES.map((t, i) => (
          <path key={i} d={IVY_LEAF} transform={t} />
        ))}
      </g>
    </svg>
  );
}

interface BookshelfProps {
  books: BookData[];
  shelfConfig: ShelfConfig;
  onOpenBook: (slug: string) => void;
  onCreateBook: (title: string) => void;
  onUpdateBookDisplay: (slug: string, config: BookDisplayConfig) => void;
  onUpdateShelfConfig: (config: ShelfConfig) => void;
  onUpdateShelfObjects: (objects: ShelfObjectItem[]) => void;
  onDeleteBook: (slug: string) => void;
}

export default function Bookshelf({
  books,
  shelfConfig,
  onOpenBook,
  onCreateBook,
  onUpdateBookDisplay,
  onUpdateShelfConfig,
  onUpdateShelfObjects,
  onDeleteBook,
}: BookshelfProps) {
  const [editMode, setEditMode] = useState(false);
  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [dragKey, setDragKey] = useState<string | null>(null);

  const allObjects = shelfConfig.objects ?? [];

  const shelves = Array.from({ length: shelfConfig.shelves }, (_, i) => i);

  const getBookDisplay = (book: BookData, index: number): BookDisplayConfig => {
    return (
      book.displayConfig ?? {
        ...DEFAULT_DISPLAY,
        color: SPINE_COLORS[index % SPINE_COLORS.length],
      }
    );
  };

  const handleCreateBook = () => {
    if (!newBookTitle.trim()) return;
    onCreateBook(newBookTitle.trim());
    setNewBookTitle("");
    setShowNewBookModal(false);
  };

  // --- Edit-mode item model (books + placed objects, ordered within a shelf) ---
  type EditItem =
    | { type: "book"; book: BookData; originalIndex: number; order: number }
    | { type: "object"; obj: ShelfObjectItem; order: number };

  const keyOf = (item: EditItem) =>
    item.type === "book" ? `book:${item.book.slug}` : `object:${item.obj.id}`;

  const booksOnShelf = (shelfIndex: number) =>
    books
      .map((book, originalIndex) => ({ book, originalIndex }))
      .filter(
        ({ book, originalIndex }) =>
          getBookDisplay(book, originalIndex).shelf === shelfIndex,
      );

  const editItemsFor = (shelfIndex: number): EditItem[] => {
    const bookItems: EditItem[] = booksOnShelf(shelfIndex).map(
      ({ book, originalIndex }) => ({
        type: "book",
        book,
        originalIndex,
        order: getBookDisplay(book, originalIndex).order ?? originalIndex,
      }),
    );
    const objItems: EditItem[] = allObjects
      .filter((o) => o.shelf === shelfIndex)
      .map((obj) => ({ type: "object", obj, order: obj.order }));
    return [...bookItems, ...objItems].sort((a, b) => a.order - b.order);
  };

  const writeBookOrders = (items: EditItem[]) => {
    items.forEach((item, idx) => {
      if (item.type === "book") {
        const d = getBookDisplay(item.book, item.originalIndex);
        if (d.order !== idx)
          onUpdateBookDisplay(item.book.slug, { ...d, order: idx });
      }
    });
  };

  const objectsReordered = (shelfIndex: number, items: EditItem[]) =>
    allObjects.map((o) => {
      if (o.shelf !== shelfIndex) return o;
      const pos = items.findIndex(
        (it) => it.type === "object" && it.obj.id === o.id,
      );
      return pos >= 0 ? { ...o, order: pos } : o;
    });

  const handleReorder = (shelfIndex: number, targetKey: string) => {
    if (!dragKey || dragKey === targetKey) return;
    const items = editItemsFor(shelfIndex);
    const from = items.findIndex((it) => keyOf(it) === dragKey);
    const to = items.findIndex((it) => keyOf(it) === targetKey);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    writeBookOrders(next);
    onUpdateShelfObjects(objectsReordered(shelfIndex, next));
    setDragKey(null);
  };

  const handleAddObject = (shelfIndex: number, kind: ShelfObjectKind) => {
    const items = editItemsFor(shelfIndex);
    writeBookOrders(items);
    const newObj: ShelfObjectItem = {
      id: crypto.randomUUID(),
      kind,
      shelf: shelfIndex,
      order: items.length,
    };
    onUpdateShelfObjects([...objectsReordered(shelfIndex, items), newObj]);
  };

  const handleRemoveObject = (id: string) =>
    onUpdateShelfObjects(allObjects.filter((o) => o.id !== id));

  const handleMoveObject = (id: string, shelf: number) =>
    onUpdateShelfObjects(
      allObjects.map((o) => (o.id === id ? { ...o, shelf, order: 9999 } : o)),
    );

  const dragHandlers = (shelfIndex: number, key: string) => ({
    draggable: true,
    onDragStart: () => setDragKey(key),
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDrop: () => handleReorder(shelfIndex, key),
    onDragEnd: () => setDragKey(null),
  });

  // Edit-mode rendering of one item: a book tile (with controls) or an object tile
  const renderEditItem = (item: EditItem, shelfIndex: number) => {
    const key = keyOf(item);
    const dragging = dragKey === key ? "is-dragging" : "";

    if (item.type === "object") {
      return (
        <div
          className={`edit-tile edit-tile--object ${dragging}`}
          key={key}
          {...dragHandlers(shelfIndex, key)}
        >
          <span className="edit-tile__grip">
            <GripVertical />
          </span>
          <div className="edit-tile__obj">
            <ShelfObject kind={item.obj.kind} />
          </div>
          <div className="book-edit-field">
            <select
              aria-label="Move object to shelf"
              value={item.obj.shelf}
              onChange={(e) =>
                handleMoveObject(item.obj.id, Number(e.target.value))
              }
            >
              {shelves.map((s) => (
                <option key={s} value={s}>
                  Shelf {s + 1}
                </option>
              ))}
            </select>
          </div>
          <button
            className="book-delete-btn"
            aria-label="Remove object"
            onClick={() => handleRemoveObject(item.obj.id)}
          >
            <X />
            Remove
          </button>
        </div>
      );
    }

    const display = getBookDisplay(item.book, item.originalIndex);
    return (
      <div
        className={`edit-tile ${dragging}`}
        key={key}
        {...dragHandlers(shelfIndex, key)}
      >
        <span className="edit-tile__grip">
          <GripVertical />
        </span>
        <div
          className="edit-tile__spine"
          style={{ backgroundColor: display.color }}
        >
          <span className="bookshelf-book__title">{item.book.title}</span>
        </div>
        <div className="book-edit-controls">
          <div className="book-edit-height">
            <button
              aria-label="Taller"
              onClick={() =>
                onUpdateBookDisplay(item.book.slug, {
                  ...display,
                  height: Math.min(280, display.height + 20),
                })
              }
            >
              <ChevronUp />
            </button>
            <span>{display.height}px</span>
            <button
              aria-label="Shorter"
              onClick={() =>
                onUpdateBookDisplay(item.book.slug, {
                  ...display,
                  height: Math.max(100, display.height - 20),
                })
              }
            >
              <ChevronDown />
            </button>
          </div>

          <div className="book-edit-colors">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                aria-label={`Binding colour ${c}`}
                className={`color-dot ${display.color === c ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() =>
                  onUpdateBookDisplay(item.book.slug, { ...display, color: c })
                }
              />
            ))}
          </div>

          <div className="book-edit-field">
            <label>
              Pose
              <select
                value={display.pose ?? "auto"}
                onChange={(e) =>
                  onUpdateBookDisplay(item.book.slug, {
                    ...display,
                    pose: e.target.value as BookPose,
                  })
                }
              >
                {POSE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="book-edit-field">
            <label>
              Shelf
              <select
                value={display.shelf}
                onChange={(e) =>
                  onUpdateBookDisplay(item.book.slug, {
                    ...display,
                    shelf: Number(e.target.value),
                  })
                }
              >
                {shelves.map((s) => (
                  <option key={s} value={s}>
                    {s + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="book-delete-btn"
            onClick={() => {
              if (confirm(`Delete "${item.book.title}"?`))
                onDeleteBook(item.book.slug);
            }}
          >
            <Trash2 />
            Remove
          </button>
        </div>
      </div>
    );
  };

  // View-mode rendering of one composed slot: a posed book, a blank, or an object
  const renderSlot = (slot: Slot) => {
    if (slot.kind === "object") {
      return (
        <span className="shelf-object" key={slot.key}>
          <ShelfObject kind={slot.object} />
        </span>
      );
    }
    if (slot.kind === "blank") {
      return (
        <button
          key={slot.key}
          className={`bookshelf-book bookshelf-book--blank blank-${slot.index}`}
          style={{
            width: `${slot.width}px`,
            height: `${slot.height}px`,
            backgroundColor: slot.tone,
          }}
          onClick={() => setShowNewBookModal(true)}
          title="Add a book to your shelf"
          aria-label="Add a book to your shelf"
        />
      );
    }
    const isBackward = slot.pose === "backward";
    const isFlat = slot.pose === "flat";
    return (
      <div className="bookshelf-book-wrapper" key={slot.key}>
        <button
          className={`bookshelf-book bookshelf-book--${slot.pose}`}
          style={
            {
              width: `${slot.width}px`,
              height: `${slot.height}px`,
              backgroundColor: isBackward ? "#efe6d0" : slot.color,
              "--lean": `${slot.leanDeg}deg`,
            } as CSSProperties
          }
          onClick={() => onOpenBook(slot.book.slug)}
          title={`Open ${slot.book.title}`}
        >
          {isBackward ? (
            <span className="bookshelf-book__pages" />
          ) : (
            <span
              className={`bookshelf-book__title ${
                isFlat ? "bookshelf-book__title--flat" : ""
              }`}
            >
              {slot.book.title}
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="bookshelf-view">
      <WindowScene />
      <span className="sunshaft sunshaft--1" aria-hidden="true" />
      <span className="sunshaft sunshaft--2" aria-hidden="true" />
      <IvySprig side="left" />
      <IvySprig side="right" />
      <div className="bookshelf-header">
        <div className="bookshelf-titles">
          <h1 className="bookshelf-heading">My Bookshelf</h1>
          <span className="bookshelf-subtitle">
            {books.length} {books.length === 1 ? "volume" : "volumes"}
          </span>
        </div>
        <div className="bookshelf-header-actions">
          <button
            className={`bookshelf-btn bookshelf-btn--edit ${
              editMode ? "active" : ""
            }`}
            onClick={() => setEditMode(!editMode)}
            title={editMode ? "Done editing" : "Edit bookshelf"}
          >
            {editMode ? <Check /> : <Pencil />}
            {editMode ? "Done" : "Edit"}
          </button>
          <button
            className="bookshelf-btn bookshelf-btn--add"
            onClick={() => setShowNewBookModal(true)}
            title="Add a new book"
          >
            <Plus />
            New Book
          </button>
        </div>
      </div>

      {editMode && (
        <div className="shelf-settings">
          <label>
            Shelves
            <input
              type="range"
              min={1}
              max={4}
              value={shelfConfig.shelves}
              onChange={(e) =>
                onUpdateShelfConfig({
                  ...shelfConfig,
                  shelves: Number(e.target.value),
                })
              }
            />
            <span>{shelfConfig.shelves}</span>
          </label>
        </div>
      )}

      <div className="bookcase">
        <ClimbingVine side="left" />
        <ClimbingVine side="right" />
        <div className="bookcase__top" />
        <div className="bookcase__body">
          <div className="bookshelf-shelves">
            {shelves.map((shelfIndex) => {
              const shelfObjects = allObjects
                .filter((o) => o.shelf === shelfIndex)
                .map((o) => ({ id: o.id, kind: o.kind, order: o.order }));
              const editItems = editMode ? editItemsFor(shelfIndex) : [];

              return (
                <div key={shelfIndex} className="bookshelf">
                  <div
                    className={`bookshelf-books ${
                      editMode ? "bookshelf-books--edit" : ""
                    }`}
                  >
                    {editMode ? (
                      editItems.length === 0 ? (
                        <div className="shelf-empty">
                          This shelf awaits its first volume
                        </div>
                      ) : (
                        editItems.map((item) =>
                          renderEditItem(item, shelfIndex),
                        )
                      )
                    ) : (
                      composeShelf(
                        booksOnShelf(shelfIndex).map(
                          ({ book, originalIndex }) => {
                            const d = getBookDisplay(book, originalIndex);
                            return {
                              book,
                              color: d.color,
                              baseHeight: d.height,
                              pose: d.pose,
                              order: d.order,
                            };
                          },
                        ),
                        shelfObjects,
                        shelfIndex,
                      ).map(renderSlot)
                    )}
                  </div>
                  {editMode && (
                    <div className="shelf-tray">
                      <span className="shelf-tray__label">Add</span>
                      {OBJECT_KINDS.map((kind) => (
                        <button
                          key={kind}
                          className="shelf-tray__btn"
                          title={`Add ${kind}`}
                          aria-label={`Add ${kind}`}
                          onClick={() => handleAddObject(shelfIndex, kind)}
                        >
                          <ShelfObject kind={kind} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="bookshelf-plank" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="bookcase__base" />
      </div>

      {showNewBookModal && (
        <div className="bookshelf-modal">
          <div className="bookshelf-modal__card">
            <h3 className="bookshelf-modal__title">
              <BookPlus />
              Add a Volume
            </h3>
            <p className="bookshelf-modal__hint">
              Give your new book a title — you can dress its spine afterwards.
            </p>
            <div className="bookshelf-modal__field">
              <label htmlFor="new-book-title">Book Title</label>
              <input
                id="new-book-title"
                type="text"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="e.g. The Hunger of the Gods"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateBook()}
              />
            </div>
            <div className="bookshelf-modal__actions">
              <button
                className="bookshelf-modal__btn bookshelf-modal__btn--cancel"
                onClick={() => setShowNewBookModal(false)}
              >
                Cancel
              </button>
              <button
                className="bookshelf-modal__btn bookshelf-modal__btn--create"
                onClick={handleCreateBook}
              >
                <Plus />
                Add to Shelf
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
