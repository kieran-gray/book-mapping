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
      <div className="section-header">
        <h2>Manage Locations</h2>
        <button
          className="section-header__action"
          onClick={() => setIsAdding(true)}
        >
          Add Location
        </button>
      </div>

      <div className="character-list">
        {locations.map((location) => (
          <div key={location.name} className="character-item">
            <span className="character-item__name">{location.name}</span>
            <div className="location-color-swatch">
              <div
                className="location-color-swatch__dot"
                style={{ backgroundColor: location.color }}
              />
              <span className="character-item__location">{location.color}</span>
            </div>
            <div className="character-item__actions">
              <button onClick={() => setEditingLocation(location)}>Edit</button>
              <button
                className="section-header__action--danger"
                onClick={() => deleteLocation(location.name)}
                style={{ background: "#dc3545" }}
              >
                Delete
              </button>
            </div>
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
