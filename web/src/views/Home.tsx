import { useState, useCallback } from "react";
import { useBookData } from "../hooks/useBookData";
import { BookProvider } from "../context/BookProvider";
import BookLayout from "../components/BookLayout";
import PageIndicator from "../components/PageIndicator";
import Bookshelf from "../components/Bookshelf";
import WorldMap from "../components/WorldMap";
import CharacterSummary from "../components/CharacterSummary";
import CharacterManager from "../components/CharacterManager";
import GroupManager from "../components/GroupManager";
import LocationManager from "../components/LocationManager";
import RelationshipManager from "../components/RelationshipManager";
import CharacteristicManager from "../components/CharacteristicManager";
import seedData from "../data/shadow-of-the-gods.json";
import type {
  BookData,
  BookDisplayConfig,
  ShelfConfig,
  ShelfObjectItem,
} from "../types";
import "./Home.css";

// --- localStorage helpers ---
const LIBRARY_KEY = "book-mapping:library";
const SHELF_CONFIG_KEY = "book-mapping:shelf-config";

function loadLibrary(): BookData[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  // First load: seed with the default book
  const initial = [seedData as BookData];
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(initial));
  return initial;
}

function saveLibrary(books: BookData[]) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(books));
}

function loadShelfConfig(): ShelfConfig {
  try {
    const raw = localStorage.getItem(SHELF_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { shelves: 1 };
}

function saveShelfConfig(config: ShelfConfig) {
  localStorage.setItem(SHELF_CONFIG_KEY, JSON.stringify(config));
}

// --- Page config ---
const PAGES = [
  { label: "Map", index: 0 },
  { label: "Characters", index: 1 },
  { label: "Relations", index: 2 },
];

// Fallback so the library page still renders when the shelf is empty
// (e.g. every book deleted) — useBookData reads seedData.slug eagerly.
const EMPTY_BOOK: BookData = {
  title: "",
  slug: "__empty__",
  mapImage: null,
  characters: [],
  locations: [],
  relationships: [],
  characteristics: [],
};

export default function BookView() {
  const [library, setLibrary] = useState<BookData[]>(loadLibrary);
  const [shelfConfig, setShelfConfig] = useState<ShelfConfig>(loadShelfConfig);
  const [openBookSlug, setOpenBookSlug] = useState<string | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [addAtLocation, setAddAtLocation] = useState<string | null>(null);

  const activeBook = library.find((b) => b.slug === openBookSlug);
  const bookActions = useBookData(activeBook ?? library[0] ?? EMPTY_BOOK);

  // --- Library management ---
  const handleCreateBook = useCallback((title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "");
    const generatedSlug = `${slug}-${Date.now()}`;

    setLibrary((prev) => {
      const lastBook = prev.length > 0 ? prev[prev.length - 1] : null;

      const newBook: BookData = {
        title,
        slug: generatedSlug,
        mapImage: null,
        characters: [],
        locations: [],
        relationships: [],
        characteristics: lastBook ? [...lastBook.characteristics] : [],
      };

      const next = [...prev, newBook];
      saveLibrary(next);
      return next;
    });

    setOpenBookSlug(generatedSlug);
    setCurrentSpread(0);
  }, []);

  const handleUpdateBookDisplay = useCallback(
    (slug: string, config: BookDisplayConfig) => {
      setLibrary((prev) => {
        const next = prev.map((b) =>
          b.slug === slug ? { ...b, displayConfig: config } : b,
        );
        saveLibrary(next);
        return next;
      });
    },
    [],
  );

  const handleDeleteBook = useCallback((slug: string) => {
    setLibrary((prev) => {
      const next = prev.filter((b) => b.slug !== slug);
      saveLibrary(next);
      return next;
    });
  }, []);

  const handleUpdateShelfConfig = useCallback((config: ShelfConfig) => {
    setShelfConfig(config);
    saveShelfConfig(config);
  }, []);

  const handleUpdateShelfObjects = useCallback((objects: ShelfObjectItem[]) => {
    setShelfConfig((prev) => {
      const next = { ...prev, objects };
      saveShelfConfig(next);
      return next;
    });
  }, []);

  const handleOpenBook = (slug: string) => {
    setOpenBookSlug(slug);
    setCurrentSpread(0);
  };

  const handleCloseBook = () => {
    setOpenBookSlug(null);
    setCurrentSpread(0);
  };

  const handleAddCharacterAtLocation = (locationName: string) => {
    setAddAtLocation(locationName);
    setCurrentSpread(1);
  };

  // --- Bookshelf view ---
  if (!openBookSlug) {
    return (
      <div className="home book-theme book-theme--shelf">
        <Bookshelf
          books={library}
          shelfConfig={shelfConfig}
          onOpenBook={handleOpenBook}
          onCreateBook={handleCreateBook}
          onUpdateBookDisplay={handleUpdateBookDisplay}
          onUpdateShelfConfig={handleUpdateShelfConfig}
          onUpdateShelfObjects={handleUpdateShelfObjects}
          onDeleteBook={handleDeleteBook}
        />
      </div>
    );
  }

  // --- Book view ---
  const maxSpread = 2;

  const leftPages: Record<number, React.ReactNode> = {
    0: <WorldMap onAddCharacterAtLocation={handleAddCharacterAtLocation} />,
    1: (
      <CharacterManager
        addAtLocation={addAtLocation}
        onClearAddAtLocation={() => setAddAtLocation(null)}
      />
    ),
    2: (
      <>
        <GroupManager />
        <RelationshipManager />
      </>
    ),
  };

  const rightPages: Record<number, React.ReactNode> = {
    0: <CharacterSummary />,
    1: <CharacteristicManager />,
    2: (
      <>
        <LocationManager />
      </>
    ),
  };

  return (
    <BookProvider value={bookActions}>
      <div className="home book-theme">
        <BookLayout
          title={bookActions.book.title}
          currentSpread={currentSpread}
          maxSpread={maxSpread}
          onPrev={() => setCurrentSpread((s) => s - 1)}
          onNext={() => setCurrentSpread((s) => s + 1)}
          leftPage={leftPages[currentSpread]}
          rightPage={rightPages[currentSpread]}
        />
        <div className="book-footer-actions">
          <PageIndicator
            currentSpread={currentSpread}
            onNavigate={setCurrentSpread}
            pages={PAGES}
          />
          <button
            className="book-footer-close-btn"
            onClick={handleCloseBook}
            title="Close Book"
            aria-label="Close Book"
          >
            <svg className="close-book-icon" viewBox="0 0 24 24">
              <path
                d="M12 21.5l-8.5-4V3.5l8.5 3 8.5-3v14l-8.5 4z"
                fill="#782922"
                stroke="#481814"
                strokeWidth="0.8"
              />
              <path
                d="M12 20.3L4.2 16.6v-12L12 7.7l7.8-3.1v12L12 20.3z"
                fill="#d4af37"
              />
              <path d="M12 19L5 15.3v-11L12 7.5V19z" fill="#fcf6eb" />
              <path d="M12 19l7-3.7v-11L12 7.5V19z" fill="#f3ebd9" />
              <line
                x1="12"
                y1="7.5"
                x2="12"
                y2="19"
                stroke="#b28c31"
                strokeWidth="1"
              />
              <path d="M3.5 3.5l1.5.5v1L3.5 3.5z" fill="#d4af37" />
              <path d="M20.5 3.5l-1.5.5v1L20.5 3.5z" fill="#d4af37" />
            </svg>
            <span>Close</span>
          </button>
        </div>
      </div>
    </BookProvider>
  );
}
