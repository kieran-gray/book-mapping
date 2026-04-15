import { useState } from "react";
import type { Character } from "../types";
import { useBook } from "../context/BookContext";
import CharacterForm from "./CharacterForm";
import CharacterAvatar from "./CharacterAvatar";

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

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showForm = editingCharacter || isAdding || !!addAtLocation;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="character-management">
      <div className="section-header">
        <h2>Manage Characters</h2>
        <button
          className="section-header__action"
          onClick={() => setIsAdding(true)}
        >
          + Add
        </button>
      </div>

      <div className="accordion-list">
        {characters.map((character) => {
          const isOpen = expandedId === character.id;
          return (
            <div
              key={character.id}
              className={`accordion-item${isOpen ? " accordion-item--open" : ""}`}
            >
              <button
                className="accordion-header"
                onClick={() => toggleExpand(character.id)}
                aria-expanded={isOpen}
              >
                <span className="accordion-avatar">
                  <span style={{ display: "block", width: 22, height: 28, overflow: "hidden", transform: "scale(0.275)", transformOrigin: "top left" }}>
                    <CharacterAvatar
                      gender={character.gender ?? "Male"}
                      hairColor={character.hairColor ?? "#FFA012"}
                      beardColor={character.beardColor ?? "#FFA012"}
                    />
                  </span>
                </span>
                <span className="accordion-name">{character.name}</span>
                {character.group && (
                  <span className="accordion-badge">{character.group}</span>
                )}
                <span className="accordion-location">
                  {character.location || "No location"}
                </span>
                <span className="accordion-chevron">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="accordion-body">
                  {character.specialSkills && (
                    <p className="accordion-detail">
                      <strong>Skills:</strong> {character.specialSkills}
                    </p>
                  )}
                  {character.travelTo && (
                    <p className="accordion-detail">
                      <strong>Traveling to:</strong> {character.travelTo}{" "}
                      ({Math.round((character.travelProgress ?? 0) * 100)}%)
                    </p>
                  )}
                  {character.characteristics && character.characteristics.length > 0 && (
                    <p className="accordion-detail">
                      <strong>Traits:</strong> {character.characteristics.join(", ")}
                    </p>
                  )}
                  <button
                    className="accordion-edit-btn"
                    onClick={() => setEditingCharacter(character)}
                  >
                    ✏️ Edit Character
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
