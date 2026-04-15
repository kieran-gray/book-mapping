import { useState } from "react";
import type { LocationConfig } from "../types";
import { useBook } from "../context/BookContext";
import LocationForm from "./LocationForm";

export default function LocationManager() {
  const { book, deleteLocation } = useBook();
  const { locations } = book;

  const [editingLocation, setEditingLocation] = useState<LocationConfig | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  // Regions start expanded; null key = ungrouped section
  const [collapsedRegions, setCollapsedRegions] = useState<Set<string>>(new Set());

  const showForm = editingLocation || isAdding;

  const toggleLocation = (name: string) =>
    setExpandedName((prev) => (prev === name ? null : name));

  const toggleRegion = (key: string) =>
    setCollapsedRegions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Group locations by region; ungrouped at the end
  const regions = Array.from(
    new Set(locations.map((l) => l.region).filter((r): r is string => !!r)),
  );
  const grouped: { key: string; label: string | null; locs: LocationConfig[] }[] = [
    ...regions.map((r) => ({
      key: r,
      label: r,
      locs: locations.filter((l) => l.region === r),
    })),
    {
      key: "__ungrouped__",
      label: null,
      locs: locations.filter((l) => !l.region),
    },
  ].filter((g) => g.locs.length > 0);

  const renderLocation = (location: LocationConfig) => {
    const isOpen = expandedName === location.name;
    return (
      <div
        key={location.name}
        className={`accordion-item${isOpen ? " accordion-item--open" : ""}`}
      >
        <button
          className="accordion-header"
          onClick={() => toggleLocation(location.name)}
          aria-expanded={isOpen}
        >
          <span
            style={{
              flexShrink: 0,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: location.color,
              border: "1px solid rgba(0,0,0,0.15)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          />
          <span className="accordion-name">{location.name}</span>
          {location.description && (
            <span className="accordion-location">{location.description}</span>
          )}
          <span className="accordion-chevron">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <div className="accordion-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: location.color,
                  flexShrink: 0,
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              />
              <span className="accordion-detail">
                <strong>Colour:</strong> {location.color}
              </span>
            </div>
            {location.description && (
              <p className="accordion-detail">
                <strong>Description:</strong> {location.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="accordion-edit-btn"
                onClick={() => {
                  setEditingLocation(location);
                  setExpandedName(null);
                }}
              >
                ✏️ Edit
              </button>
              <button
                className="accordion-edit-btn accordion-edit-btn--danger"
                onClick={() => {
                  if (confirm(`Delete "${location.name}"?`)) {
                    deleteLocation(location.name);
                    setExpandedName(null);
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
  };

  return (
    <div className="character-management">
      <div className="section-header">
        <h2>Manage Locations</h2>
        <button
          className="section-header__action"
          onClick={() => setIsAdding(true)}
        >
          + Add
        </button>
      </div>

      {locations.length === 0 ? (
        <p className="accordion-empty">No locations yet. Add one to get started.</p>
      ) : (
        <div className="accordion-list">
          {grouped.map(({ key, label, locs }) => {
            const isCollapsed = collapsedRegions.has(key);
            return (
              <div key={key} className="location-region-group">
                {/* Region header — only show if there is a named region */}
                {label ? (
                  <button
                    className="location-region-header location-region-header--btn"
                    onClick={() => toggleRegion(key)}
                    aria-expanded={!isCollapsed}
                  >
                    <span>{label}</span>
                    <span className="accordion-badge">{locs.length}</span>
                    <span className="location-region-chevron">
                      {isCollapsed ? "▼" : "▲"}
                    </span>
                  </button>
                ) : (
                  // Ungrouped section — show a subtle divider only if there are also regions above
                  regions.length > 0 && (
                    <button
                      className="location-region-header location-region-header--btn location-region-header--ungrouped"
                      onClick={() => toggleRegion(key)}
                      aria-expanded={!isCollapsed}
                    >
                      <span>Other Locations</span>
                      <span className="accordion-badge">{locs.length}</span>
                      <span className="location-region-chevron">
                        {isCollapsed ? "▼" : "▲"}
                      </span>
                    </button>
                  )
                )}

                {!isCollapsed && locs.map(renderLocation)}
              </div>
            );
          })}
        </div>
      )}

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
