import { useState } from "react";
import { useBook } from "../context/BookContext";
import RelationshipForm from "./RelationshipForm";

const REL_COLORS: Record<string, string> = {
  Friendly: "#28a745",
  Enemies: "#dc3545",
  Neutral: "#6c757d",
};

export default function RelationshipManager() {
  const { book, deleteRelationship } = useBook();
  const { relationships } = book;

  const [isAdding, setIsAdding] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (i: number) =>
    setExpandedIndex((prev) => (prev === i ? null : i));

  return (
    <div className="character-management">
      <div className="section-header">
        <h2>Manage Relationships</h2>
        <button
          className="section-header__action"
          onClick={() => setIsAdding(true)}
        >
          + Add
        </button>
      </div>

      <div className="accordion-list">
        {relationships.map((rel, index) => {
          const sourceName =
            book.characters.find((c) => c.id === rel.source)?.name ||
            rel.source;
          const targetName =
            book.characters.find((c) => c.id === rel.target)?.name ||
            rel.target;
          const isOpen = expandedIndex === index;
          const color = REL_COLORS[rel.type] ?? "#6c757d";

          return (
            <div
              key={index}
              className={`accordion-item${
                isOpen ? " accordion-item--open" : ""
              }`}
            >
              <button
                className="accordion-header"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
              >
                <span
                  className="accordion-rel-dot"
                  style={{ background: color }}
                />
                <span className="accordion-name">
                  {sourceName} ↔ {targetName}
                </span>
                <span
                  className="accordion-badge"
                  style={{ background: color + "22", color }}
                >
                  {rel.type}
                </span>
                <span className="accordion-chevron">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="accordion-body">
                  <button
                    className="accordion-edit-btn accordion-edit-btn--danger"
                    onClick={() => {
                      if (confirm("Delete this relationship?")) {
                        deleteRelationship(index);
                        setExpandedIndex(null);
                      }
                    }}
                  >
                    🗑 Delete Relationship
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {relationships.length === 0 && (
          <p className="accordion-empty">No relationships yet.</p>
        )}
      </div>

      {isAdding && <RelationshipForm onClose={() => setIsAdding(false)} />}
    </div>
  );
}
