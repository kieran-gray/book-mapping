import { useState } from "react";
import type { Characteristic } from "../types";
import { useBook } from "../context/BookContext";

export default function CharacteristicManager() {
  const { book, addCharacteristic, updateCharacteristic, deleteCharacteristic } =
    useBook();
  const characteristics = book.characteristics || [];

  const [editing, setEditing] = useState<Characteristic | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="character-management">
      <div className="section-header">
        <h2>Manage Characteristics</h2>
        <button
          className="section-header__action"
          onClick={() => {
            setEditing({ title: "", meaning: "" });
            setIsAdding(true);
          }}
        >
          + Add
        </button>
      </div>

      {characteristics.length === 0 ? (
        <p style={{ color: "#8a7b6b", fontStyle: "italic" }}>
          No characteristics defined yet. Add one to get started.
        </p>
      ) : (
        <div className="character-list">
          {characteristics.map((ch) => (
            <div key={ch.title} className="character-item">
              <span className="character-item__name">{ch.title}</span>
              <span className="character-item__location">{ch.meaning}</span>
              <div className="character-item__actions">
                <button
                  onClick={() => {
                    setEditing({ ...ch });
                    setIsAdding(false);
                  }}
                >
                  Edit
                </button>
                <button
                  style={{ background: "#dc3545" }}
                  onClick={() => deleteCharacteristic(ch.title)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CharacteristicFormModal
          characteristic={editing}
          isAdding={isAdding}
          onSave={(original, updated) => {
            if (isAdding) {
              addCharacteristic(updated);
            } else {
              updateCharacteristic(original.title, updated);
            }
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CharacteristicFormModal({
  characteristic,
  isAdding,
  onSave,
  onClose,
}: {
  characteristic: Characteristic;
  isAdding: boolean;
  onSave: (original: Characteristic, updated: Characteristic) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(characteristic.title);
  const [meaning, setMeaning] = useState(characteristic.meaning);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(characteristic, { title: title.trim(), meaning: meaning.trim() });
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal__content">
        <h3>{isAdding ? "Add Characteristic" : `Edit ${characteristic.title}`}</h3>

        <div className="edit-modal__field">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isAdding}
            placeholder="e.g. Bloodsworn"
          />
        </div>

        <div className="edit-modal__field">
          <label>Meaning:</label>
          <input
            type="text"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="e.g. Bound by blood oath to serve"
          />
        </div>

        <div className="edit-modal__actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
