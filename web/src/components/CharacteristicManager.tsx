import { useState } from "react";
import type { Characteristic } from "../types";
import { useBook } from "../context/BookContext";

export default function CharacteristicManager() {
  const {
    book,
    addCharacteristic,
    updateCharacteristic,
    deleteCharacteristic,
  } = useBook();
  const characteristics = book.characteristics || [];

  const [editing, setEditing] = useState<Characteristic | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);

  const toggle = (title: string) =>
    setExpandedTitle((prev) => (prev === title ? null : title));

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
        <p className="accordion-empty">
          No characteristics defined yet. Add one to get started.
        </p>
      ) : (
        <div className="accordion-list">
          {characteristics.map((ch) => {
            const isOpen = expandedTitle === ch.title;
            return (
              <div
                key={ch.title}
                className={`accordion-item${
                  isOpen ? " accordion-item--open" : ""
                }`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggle(ch.title)}
                  aria-expanded={isOpen}
                >
                  <span className="accordion-name">{ch.title}</span>
                  <span className="accordion-location">{ch.meaning}</span>
                  <span className="accordion-chevron">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="accordion-body">
                    <p className="accordion-detail">
                      <strong>Meaning:</strong> {ch.meaning || <em>None</em>}
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="accordion-edit-btn"
                        onClick={() => {
                          setEditing({ ...ch });
                          setIsAdding(false);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="accordion-edit-btn accordion-edit-btn--danger"
                        onClick={() => {
                          if (confirm(`Delete "${ch.title}"?`)) {
                            deleteCharacteristic(ch.title);
                            setExpandedTitle(null);
                          }
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
          onDelete={(title) => {
            deleteCharacteristic(title);
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
  onDelete,
  onClose,
}: {
  characteristic: Characteristic;
  isAdding: boolean;
  onSave: (original: Characteristic, updated: Characteristic) => void;
  onDelete: (title: string) => void;
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
        <h3>
          {isAdding ? "Add Characteristic" : `Edit ${characteristic.title}`}
        </h3>

        <div className="edit-modal__field">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          {!isAdding && (
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this characteristic?",
                  )
                ) {
                  onDelete(characteristic.title);
                }
              }}
              style={{ background: "#dc3545", color: "white" }}
            >
              Delete
            </button>
          )}
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
