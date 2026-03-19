import { useState } from "react";
import type { LocationConfig } from "../types";
import { useBook } from "../context/BookContext";
import LocationForm from "./LocationForm";

export default function LocationManager() {
  const { book, deleteLocation } = useBook();
  const { locations } = book;

  const [editingLocation, setEditingLocation] = useState<LocationConfig | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);

  const showForm = editingLocation || isAdding;

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
        <h2 style={{ margin: 0 }}>Manage Locations</h2>
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
          Add Location
        </button>
      </div>

      <div className="character-list">
        {locations.map((location) => (
          <div key={location.name} className="character-item">
            <span className="character-item__name">{location.name}</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "120px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: location.color,
                }}
              />
              <span
                className="character-item__location"
                style={{ minWidth: "auto" }}
              >
                {location.color}
              </span>
            </div>
            <button onClick={() => setEditingLocation(location)}>Edit</button>
            <button
              onClick={() => deleteLocation(location.name)}
              style={{ background: "#dc3545" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <LocationForm
          location={editingLocation ?? undefined}
          isAdding={isAdding}
          onClose={() => {
            setEditingLocation(null);
            setIsAdding(false);
          }}
        />
      )}
    </div>
  );
}
