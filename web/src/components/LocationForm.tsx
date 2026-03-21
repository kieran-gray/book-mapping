import { useState } from "react";
import type { LocationConfig } from "../types";
import { useBook } from "../context/BookContext";

const LOCATION_COLORS = ["#43A047", "#2E7D32", "#689F38", "#D9D9D9", "#292A2B"];

interface LocationFormProps {
  location?: LocationConfig;
  isAdding: boolean;
  initialCoords?: { x: number; y: number };
  onClose: () => void;
}

export default function LocationForm({
  location,
  isAdding,
  initialCoords,
  onClose,
}: LocationFormProps) {
  const { addLocation, updateLocation } = useBook();

  const [formData, setFormData] = useState<LocationConfig>(
    location ?? {
      name: "",
      color: "#43A047",
      x: initialCoords?.x ?? 50,
      y: initialCoords?.y ?? 50,
    },
  );

  const handleChange = (field: keyof LocationConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isAdding) {
      addLocation(formData);
    } else if (location) {
      updateLocation(location.name, formData);
    }
    onClose();
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal__content">
        <h3>{isAdding ? "Add Location" : `Edit ${location?.name}`}</h3>

        <div className="edit-modal__field">
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="edit-modal__field">
          <label>Description:</label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Add location details..."
            rows={3}
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontFamily: "inherit", resize: "vertical" }}
          />
        </div>

        <div className="edit-modal__field">
          <label>Color:</label>
          <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
            {LOCATION_COLORS.map((color) => (
              <div
                key={color}
                onClick={() => handleChange("color", color)}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  cursor: "pointer",
                  border:
                    formData.color.toUpperCase() === color.toUpperCase()
                      ? "3px solid #007bff"
                      : "2px solid transparent",
                  boxShadow:
                    formData.color.toUpperCase() === color.toUpperCase()
                      ? "0 0 5px rgba(0,123,255,0.5)"
                      : "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="edit-modal__actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
