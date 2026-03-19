import { useState } from "react";
import type { Relationship } from "../types";
import { useBook } from "../context/BookContext";

interface RelationshipFormProps {
  onClose: () => void;
}

export default function RelationshipForm({ onClose }: RelationshipFormProps) {
  const { book, addRelationship } = useBook();
  const { characters } = book;

  const [formData, setFormData] = useState<Relationship>({
    source: "",
    target: "",
    type: "Neutral",
  });

  const handleChange = (field: keyof Relationship, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (
      formData.source &&
      formData.target &&
      formData.source !== formData.target
    ) {
      addRelationship(formData);
      onClose();
    }
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal__content">
        <h3>Add Relationship</h3>

        <div className="edit-modal__field">
          <label>Source Character:</label>
          <select
            value={formData.source}
            onChange={(e) => handleChange("source", e.target.value)}
          >
            <option value="">Select...</option>
            {characters.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="edit-modal__field">
          <label>Target Character:</label>
          <select
            value={formData.target}
            onChange={(e) => handleChange("target", e.target.value)}
          >
            <option value="">Select...</option>
            {characters.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="edit-modal__field">
          <label>Relationship Type:</label>
          <select
            value={formData.type}
            onChange={(e) =>
              handleChange("type", e.target.value as Relationship["type"])
            }
          >
            <option value="Friendly">Friendly</option>
            <option value="Enemies">Enemies</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>

        <div className="edit-modal__actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
