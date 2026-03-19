import { useState } from "react";
import { useBook } from "../context/BookContext";
import RelationshipForm from "./RelationshipForm";

export default function RelationshipManager() {
  const { book, deleteRelationship } = useBook();
  const { relationships } = book;

  const [isAdding, setIsAdding] = useState(false);

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
        <h2 style={{ margin: 0 }}>Manage Relationships</h2>
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
