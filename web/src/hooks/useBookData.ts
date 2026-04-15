import { useState, useCallback, useEffect } from "react";
import type {
  BookData,
  Character,
  Characteristic,
  LocationConfig,
  Relationship,
} from "../types";

const STORAGE_PREFIX = "book-mapping:";

function loadFromStorage(slug: string): BookData | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (!raw) return null;
    return migrateBookData(JSON.parse(raw) as BookData);
  } catch {
    return null;
  }
}

function migrateBookData(data: BookData): BookData {
  if (!data?.characters) return data;
  let needsMigration = false;
  for (const c of data.characters) {
    if (!c.id) needsMigration = true;
  }
  if (!needsMigration) return data;

  const nameToId = new Map<string, string>();
  const migratedCharacters = data.characters.map((c) => {
    if (c.id) {
      nameToId.set(c.name, c.id);
      return c;
    }
    const newId = crypto.randomUUID();
    nameToId.set(c.name, newId);
    return { ...c, id: newId };
  });

  const migratedRelationships = (data.relationships || []).map((r) => {
    let updatedSource = r.source;
    let updatedTarget = r.target;
    if (nameToId.has(r.source)) updatedSource = nameToId.get(r.source)!;
    if (nameToId.has(r.target)) updatedTarget = nameToId.get(r.target)!;
    return { ...r, source: updatedSource, target: updatedTarget };
  });

  return {
    ...data,
    characters: migratedCharacters,
    relationships: migratedRelationships,
  };
}

function saveToStorage(slug: string, data: BookData) {
  localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(data));
}

export function useBookData(seedData: BookData) {
  const [book, setBook] = useState<BookData>(() => {
    const stored = loadFromStorage(seedData.slug);
    return stored ?? migrateBookData(seedData);
  });

  // Handle switching between books
  useEffect(() => {
    setBook((current) => {
      if (current.slug !== seedData.slug) {
        const stored = loadFromStorage(seedData.slug);
        return stored ?? migrateBookData(seedData);
      }
      return current;
    });
  }, [seedData, seedData.slug]);

  // Persist on every change
  useEffect(() => {
    saveToStorage(book.slug, book);
  }, [book]);

  // --- Characters ---
  const addCharacter = useCallback((character: Omit<Character, "id">) => {
    setBook((prev) => ({
      ...prev,
      characters: [
        ...prev.characters,
        { ...character, id: crypto.randomUUID() } as Character,
      ],
    }));
  }, []);

  const updateCharacter = useCallback((id: string, updated: Character) => {
    setBook((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => (c.id === id ? updated : c)),
    }));
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setBook((prev) => ({
      ...prev,
      characters: prev.characters.filter((c) => c.id !== id),
      relationships: prev.relationships.filter(
        (r) => r.source !== id && r.target !== id,
      ),
    }));
  }, []);

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
            ? prev.characters.map((c) => {
                let patched = c;
                if (patched.location === originalName)
                  patched = { ...patched, location: updated.name };
                if (patched.travelTo === originalName)
                  patched = { ...patched, travelTo: updated.name };
                return patched;
              })
            : prev.characters,
      }));
    },
    [],
  );

  const deleteLocation = useCallback((name: string) => {
    setBook((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc.name !== name),
      characters: prev.characters.map((c) => {
        let patched = c;
        if (patched.location === name) patched = { ...patched, location: "" };
        if (patched.travelTo === name)
          patched = {
            ...patched,
            travelTo: undefined,
            travelProgress: undefined,
          };
        return patched;
      }),
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

  // --- Characteristics ---
  const addCharacteristic = useCallback((characteristic: Characteristic) => {
    setBook((prev) => ({
      ...prev,
      characteristics: [...(prev.characteristics || []), characteristic],
    }));
  }, []);

  const updateCharacteristic = useCallback(
    (originalTitle: string, updated: Characteristic) => {
      setBook((prev) => ({
        ...prev,
        characteristics: (prev.characteristics || []).map((ch) =>
          ch.title === originalTitle ? updated : ch,
        ),
        // Update references in characters if title changed
        characters:
          originalTitle !== updated.title
            ? prev.characters.map((c) => ({
                ...c,
                characteristics: c.characteristics?.map((t) =>
                  t === originalTitle ? updated.title : t,
                ),
              }))
            : prev.characters,
      }));
    },
    [],
  );

  const deleteCharacteristic = useCallback((title: string) => {
    setBook((prev) => ({
      ...prev,
      characteristics: (prev.characteristics || []).filter(
        (ch) => ch.title !== title,
      ),
      // Remove from all characters
      characters: prev.characters.map((c) => ({
        ...c,
        characteristics: c.characteristics?.filter((t) => t !== title),
      })),
    }));
  }, []);

  // --- Groups ---
  const moveGroupToLocation = useCallback(
    (groupName: string, locationName: string) => {
      setBook((prev) => ({
        ...prev,
        characters: prev.characters.map((c) =>
          c.group === groupName
            ? {
                ...c,
                location: locationName,
                travelTo: undefined,
                travelProgress: undefined,
              }
            : c,
        ),
      }));
    },
    [],
  );

  const setGroupTravel = useCallback(
    (
      groupName: string,
      fromLocation: string,
      toLocation: string | undefined,
      progress: number,
    ) => {
      setBook((prev) => ({
        ...prev,
        characters: prev.characters.map((c) =>
          c.group === groupName
            ? {
                ...c,
                location: fromLocation,
                travelTo: toLocation || undefined,
                travelProgress: toLocation
                  ? Math.max(0, Math.min(1, progress))
                  : undefined,
              }
            : c,
        ),
      }));
    },
    [],
  );

  const updateGroupTravelProgress = useCallback(
    (groupName: string, progress: number) => {
      setBook((prev) => ({
        ...prev,
        characters: prev.characters.map((c) =>
          c.group === groupName
            ? { ...c, travelProgress: Math.max(0, Math.min(1, progress)) }
            : c,
        ),
      }));
    },
    [],
  );

  // --- Character Travel ---
  const updateCharacterTravel = useCallback((id: string, progress: number) => {
    setBook((prev) => ({
      ...prev,
      characters: prev.characters.map((c) =>
        c.id === id
          ? { ...c, travelProgress: Math.max(0, Math.min(1, progress)) }
          : c,
      ),
    }));
  }, []);

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

  const allRegions = Array.from(
    new Set(
      book.locations.map((l) => l.region).filter((r): r is string => !!r),
    ),
  );

  // Only stationary characters appear at pins
  const charactersByLocation: Record<string, Character[]> = {};
  book.locations.forEach((loc) => {
    charactersByLocation[loc.name] = book.characters.filter(
      (c) => c.location === loc.name && !c.travelTo,
    );
  });

  // Ungrouped characters currently traveling
  const travelingCharacters = book.characters.filter(
    (c) => c.travelTo && !c.group,
  );

  // Groups currently traveling
  const travelingGroups = allGroups
    .map((name) => {
      const members = book.characters.filter((c) => c.group === name);
      const first = members[0];
      if (!first?.travelTo) return null;
      return {
        name,
        members,
        location: first.location,
        travelTo: first.travelTo,
        travelProgress: first.travelProgress ?? 0,
      };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  return {
    book,
    allGroups,
    allRegions,
    charactersByLocation,
    travelingCharacters,
    travelingGroups,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    updateCharacterTravel,
    addLocation,
    updateLocation,
    deleteLocation,
    updateLocationPosition,
    addRelationship,
    deleteRelationship,
    addCharacteristic,
    updateCharacteristic,
    deleteCharacteristic,
    moveGroupToLocation,
    setGroupTravel,
    updateGroupTravelProgress,
    setMapImage,
  };
}

export type BookActions = ReturnType<typeof useBookData>;
