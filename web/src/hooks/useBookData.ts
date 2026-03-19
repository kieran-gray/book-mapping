import { useState, useCallback, useEffect } from "react";
import type {
  BookData,
  Character,
  LocationConfig,
  Relationship,
} from "../types";

const STORAGE_PREFIX = "book-mapping:";

function loadFromStorage(slug: string): BookData | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    return raw ? (JSON.parse(raw) as BookData) : null;
  } catch {
    return null;
  }
}

function saveToStorage(slug: string, data: BookData) {
  localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(data));
}

export function useBookData(seedData: BookData) {
  const [book, setBook] = useState<BookData>(() => {
    const stored = loadFromStorage(seedData.slug);
    return stored ?? seedData;
  });

  // Persist on every change
  useEffect(() => {
    saveToStorage(book.slug, book);
  }, [book]);

  // --- Characters ---
  const addCharacter = useCallback((character: Character) => {
    setBook((prev) => ({
      ...prev,
      characters: [...prev.characters, character],
    }));
  }, []);

  const updateCharacter = useCallback(
    (originalName: string, updated: Character) => {
      setBook((prev) => ({
        ...prev,
        characters: prev.characters.map((c) =>
          c.name === originalName ? updated : c,
        ),
      }));
    },
    [],
  );

  // --- Locations ---
  const addLocation = useCallback((location: LocationConfig) => {
    setBook((prev) => ({
      ...prev,
      locations: [...prev.locations, location],
    }));
  }, []);

  const updateLocation = useCallback(
    (originalName: string, updated: LocationConfig) => {
      setBook((prev) => ({
        ...prev,
        locations: prev.locations.map((loc) =>
          loc.name === originalName ? updated : loc,
        ),
        // Also update characters referencing the old name
        characters:
          originalName !== updated.name
            ? prev.characters.map((c) =>
                c.location === originalName
                  ? { ...c, location: updated.name }
                  : c,
              )
            : prev.characters,
      }));
    },
    [],
  );

  const deleteLocation = useCallback((name: string) => {
    setBook((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc.name !== name),
      characters: prev.characters.map((c) =>
        c.location === name ? { ...c, location: "" } : c,
      ),
    }));
  }, []);

  const updateLocationPosition = useCallback(
    (name: string, x: number, y: number) => {
      setBook((prev) => ({
        ...prev,
        locations: prev.locations.map((loc) =>
          loc.name === name ? { ...loc, x, y } : loc,
        ),
      }));
    },
    [],
  );

  // --- Relationships ---
  const addRelationship = useCallback((relationship: Relationship) => {
    setBook((prev) => ({
      ...prev,
      relationships: [...prev.relationships, relationship],
    }));
  }, []);

  const deleteRelationship = useCallback((index: number) => {
    setBook((prev) => ({
      ...prev,
      relationships: prev.relationships.filter((_, i) => i !== index),
    }));
  }, []);

  // --- Groups ---
  const moveGroupToLocation = useCallback(
    (groupName: string, locationName: string) => {
      setBook((prev) => ({
        ...prev,
        characters: prev.characters.map((c) =>
          c.group === groupName ? { ...c, location: locationName } : c,
        ),
      }));
    },
    [],
  );

  // --- Map Image ---
  const setMapImage = useCallback((image: string | null) => {
    setBook((prev) => ({ ...prev, mapImage: image }));
  }, []);

  // --- Derived data ---
  const allGroups = Array.from(
    new Set(
      book.characters.map((c) => c.group).filter((g): g is string => !!g),
    ),
  );

  const charactersByLocation: Record<string, Character[]> = {};
  book.locations.forEach((loc) => {
    charactersByLocation[loc.name] = book.characters.filter(
      (c) => c.location === loc.name,
    );
  });

  return {
    book,
    allGroups,
    charactersByLocation,
    addCharacter,
    updateCharacter,
    addLocation,
    updateLocation,
    deleteLocation,
    updateLocationPosition,
    addRelationship,
    deleteRelationship,
    moveGroupToLocation,
    setMapImage,
  };
}

export type BookActions = ReturnType<typeof useBookData>;
