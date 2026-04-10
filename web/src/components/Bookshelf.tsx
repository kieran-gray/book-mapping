import { useState } from "react";
import type { BookData, BookDisplayConfig, ShelfConfig } from "../types";

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

interface BookshelfProps {
  books: BookData[];
  shelfConfig: ShelfConfig;
  onOpenBook: (slug: string) => void;
  onCreateBook: (title: string) => void;
  onUpdateBookDisplay: (slug: string, config: BookDisplayConfig) => void;
  onUpdateShelfConfig: (config: ShelfConfig) => void;
  onDeleteBook: (slug: string) => void;
}

export default function Bookshelf({
  books,
  shelfConfig,
  onOpenBook,
  onCreateBook,
  onUpdateBookDisplay,
  onUpdateShelfConfig,
  onDeleteBook,
}: BookshelfProps) {
  const [editMode, setEditMode] = useState(false);
  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");

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

  return (
    <div className="bookshelf-view">
      <div className="bookshelf-header">
        <h1 className="bookshelf-heading">My Bookshelf</h1>
        <div className="bookshelf-header-actions">
          <button
            className={`bookshelf-edit-btn ${editMode ? "active" : ""}`}
            onClick={() => setEditMode(!editMode)}
            title={editMode ? "Done editing" : "Edit bookshelf"}
          >
            {editMode ? "✓ Done" : "✏️ Edit"}
          </button>
          <button
            className="bookshelf-add-btn"
            onClick={() => setShowNewBookModal(true)}
            title="Add a new book"
          >
            + New Book
          </button>
        </div>
      </div>

      {editMode && (
        <div className="shelf-settings">
          <label>
            Shelves:
            <input
              type="range"
              min={1}
              max={4}
              value={shelfConfig.shelves}
              onChange={(e) =>
                onUpdateShelfConfig({ shelves: Number(e.target.value) })
              }
            />
            <span>{shelfConfig.shelves}</span>
          </label>
        </div>
      )}

      <div className="bookshelf-shelves">
        {shelves.map((shelfIndex) => {
          const shelfBooks = books
            .map((book, i) => ({ book, originalIndex: i }))
            .filter(({ book, originalIndex }) => {
              const display = getBookDisplay(book, originalIndex);
              return display.shelf === shelfIndex;
            });

          return (
            <div key={shelfIndex} className="bookshelf">
              <div className="bookshelf-books">
                {shelfBooks.map(({ book, originalIndex }) => {
                  const display = getBookDisplay(book, originalIndex);
                  return (
                    <div key={book.slug} className="bookshelf-book-wrapper">
                      <button
                        className="bookshelf-book"
                        style={{
                          backgroundColor: display.color,
                          height: `${display.height}px`,
                        }}
                        onClick={() => !editMode && onOpenBook(book.slug)}
                        title={editMode ? book.title : `Open ${book.title}`}
                      >
                        <span className="bookshelf-book__title">
                          {book.title}
                        </span>
                      </button>

                      {editMode && (
                        <div className="book-edit-controls">
                          <div className="book-edit-height">
                            <button
                              onClick={() =>
                                onUpdateBookDisplay(book.slug, {
                                  ...display,
                                  height: Math.min(280, display.height + 20),
                                })
                              }
                            >
                              ▲
                            </button>
                            <span>{display.height}px</span>
                            <button
                              onClick={() =>
                                onUpdateBookDisplay(book.slug, {
                                  ...display,
                                  height: Math.max(100, display.height - 20),
                                })
                              }
                            >
                              ▼
                            </button>
                          </div>

                          <div className="book-edit-colors">
                            {COLOR_SWATCHES.map((c) => (
                              <button
                                key={c}
                                className={`color-dot ${
                                  display.color === c ? "active" : ""
                                }`}
                                style={{ backgroundColor: c }}
                                onClick={() =>
                                  onUpdateBookDisplay(book.slug, {
                                    ...display,
                                    color: c,
                                  })
                                }
                              />
                            ))}
                          </div>

                          <div className="book-edit-shelf">
                            <label>
                              Shelf:
                              <select
                                value={display.shelf}
                                onChange={(e) =>
                                  onUpdateBookDisplay(book.slug, {
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
                              if (confirm(`Delete "${book.title}"?`))
                                onDeleteBook(book.slug);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {shelfBooks.length === 0 && (
                  <div className="shelf-empty">Shelf {shelfIndex + 1}</div>
                )}
              </div>
              <div className="bookshelf-plank" />
            </div>
          );
        })}
      </div>

      {showNewBookModal && (
        <div className="edit-modal">
          <div className="edit-modal__content">
            <h3>Create New Book</h3>
            <div className="edit-modal__field">
              <label>Book Title:</label>
              <input
                type="text"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="e.g. The Hunger of the Gods"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateBook()}
              />
            </div>
            <div className="edit-modal__actions">
              <button onClick={handleCreateBook}>Create</button>
              <button onClick={() => setShowNewBookModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
