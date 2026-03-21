import { useState } from "react";
import { useBook } from "../context/BookContext";
import RelationshipForm from "./RelationshipForm";

export default function RelationshipManager() {
  const { book, deleteRelationship } = useBook();
  const { relationships } = book;

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="character-management">
      <div className="section-header">
        <h2>Manage Relationships</h2>
        <button
          className="section-header__action"
          onClick={() => setIsAdding(true)}
        >
          Add Relationship
        </button>
      </div>

      <div className="character-list">
        {relationships.map((rel, index) => (
          <div key={index} className="character-item">
            <span className="character-item__name">
              {rel.source} ↔ {rel.target} ({rel.type})
            </span>
            <button
              onClick={() => deleteRelationship(index)}
              style={{ background: "#dc3545" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {isAdding && <RelationshipForm onClose={() => setIsAdding(false)} />}
    </div>
  );
}
