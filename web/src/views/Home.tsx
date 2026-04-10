import { useState, useCallback } from "react";
import { useBookData } from "../hooks/useBookData";
import { BookProvider } from "../context/BookContext";
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
import type { BookData, BookDisplayConfig, ShelfConfig } from "../types";
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

export default function BookView() {
  const [library, setLibrary] = useState<BookData[]>(loadLibrary);
  const [shelfConfig, setShelfConfig] = useState<ShelfConfig>(loadShelfConfig);
  const [openBookSlug, setOpenBookSlug] = useState<string | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [addAtLocation, setAddAtLocation] = useState<string | null>(null);

  const activeBook = library.find((b) => b.slug === openBookSlug);
  const bookActions = useBookData(activeBook ?? library[0]);

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
      <div className="home book-theme">
        <Bookshelf
          books={library}
          shelfConfig={shelfConfig}
          onOpenBook={handleOpenBook}
          onCreateBook={handleCreateBook}
          onUpdateBookDisplay={handleUpdateBookDisplay}
          onUpdateShelfConfig={handleUpdateShelfConfig}
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
        {currentSpread === maxSpread && (
          <div className="close-book-container">
            <button className="close-book-button" onClick={handleCloseBook}>
              📕 Close Book
            </button>
          </div>
        )}
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
        <PageIndicator
          currentSpread={currentSpread}
          onNavigate={setCurrentSpread}
          pages={PAGES}
        />
      </div>
    </BookProvider>
  );
}
