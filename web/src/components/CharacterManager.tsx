import { useState } from "react";
import type { Character } from "../types";
import { useBook } from "../context/BookContext";
import CharacterForm from "./CharacterForm";

interface CharacterManagerProps {
  addAtLocation?: string | null;
  onClearAddAtLocation?: () => void;
}

export default function CharacterManager({
  addAtLocation,
  onClearAddAtLocation,
}: CharacterManagerProps) {
  const { book } = useBook();
  const { characters } = book;

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);

  // If addAtLocation is set from the map, open the form
  const showForm = editingCharacter || isAdding || !!addAtLocation;

  return (
    <div className="character-management">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Manage Characters</h2>
        <button
          onClick={() => setIsAdding(true)}
          style={{
            height: "fit-content",
            padding: "8px 16px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Character
        </button>
      </div>

      <div className="character-list">
        {characters.map((character) => (
          <div key={character.name} className="character-item">
            <span className="character-item__name">{character.name}</span>
            <span className="character-item__location">
              {character.location}
              {character.group ? ` · ${character.group}` : ""}
            </span>
            <button onClick={() => setEditingCharacter(character)}>Edit</button>
          </div>
        ))}
      </div>

      {showForm && (
        <CharacterForm
          character={editingCharacter ?? undefined}
          isAdding={isAdding || !!addAtLocation}
          initialLocation={addAtLocation ?? undefined}
          onClose={() => {
            setEditingCharacter(null);
            setIsAdding(false);
            onClearAddAtLocation?.();
          }}
        />
      )}
    </div>
  );
}
