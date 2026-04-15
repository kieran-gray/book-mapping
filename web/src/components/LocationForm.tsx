import { useState } from "react";
import type { Character, LocationConfig } from "../types";
import { useBook } from "../context/BookContext";

const LOCATION_COLORS = ["#C2B280", "#D9D9D9", "#292A2B"];

interface LocationFormProps {
  location?: LocationConfig;
  isAdding: boolean;
  initialCoords?: { x: number; y: number };
  isMapOverlay?: boolean;
  onClose: () => void;
  onAddCharacterHere?: () => void;
}

export default function LocationForm({
  location,
  isAdding,
  initialCoords,
  isMapOverlay,
  onClose,
  onAddCharacterHere,
}: LocationFormProps) {
  const {
    addLocation,
    updateLocation,
    deleteLocation,
    charactersByLocation,
    allGroups,
    allRegions,
    moveGroupToLocation,
  } = useBook();
  const [activeTab, setActiveTab] = useState<"details" | "characters">(
    "details",
  );

  const chars = location ? charactersByLocation[location.name] ?? [] : [];

  const [formData, setFormData] = useState<LocationConfig>(
    location ?? {
      name: "",
      color: "#C2B280",
      x: initialCoords?.x ?? 50,
      y: initialCoords?.y ?? 50,
    },
  );

  // Separate state for typing a new region name (same pattern as new group in CharacterForm)
  const [showNewRegion, setShowNewRegion] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");

  const handleChange = (field: keyof LocationConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** Resolve which region to save */
  const resolvedRegion = (): string | undefined => {
    if (showNewRegion) return newRegionName.trim() || undefined;
    return formData.region || undefined;
  };

  const handleSave = () => {
    const dataToSave = { ...formData, region: resolvedRegion() };
    if (isAdding) {
      addLocation(dataToSave);
    } else if (location) {
      updateLocation(location.name, {
        ...dataToSave,
        x: location.x,
        y: location.y,
      });
    }
    onClose();
  };

  return (
    <div
      className="edit-modal"
      style={
        isMapOverlay
          ? {
              pointerEvents: "none",
              background: "transparent",
              alignItems: "flex-end",
            }
          : {}
      }
    >
      <div
        className="edit-modal__content"
        style={
          isMapOverlay
            ? { pointerEvents: "auto", boxShadow: "0 0 15px rgba(0,0,0,0.3)" }
            : {}
        }
      >
        <h3>{isAdding ? "Add Location" : `Edit ${location?.name}`}</h3>

        {!isAdding && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
              borderBottom: "1px solid #ddd",
              paddingBottom: "8px",
            }}
          >
            <button
              onClick={() => setActiveTab("details")}
              style={{
                background: activeTab === "details" ? "#007bff" : "transparent",
                color: activeTab === "details" ? "white" : "#333",
                border: "1px solid #007bff",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("characters")}
              style={{
                background:
                  activeTab === "characters" ? "#007bff" : "transparent",
                color: activeTab === "characters" ? "white" : "#333",
                border: "1px solid #007bff",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            >
              Characters & Groups
            </button>
          </div>
        )}

        {isMapOverlay && activeTab === "details" && !isAdding && (
          <div
            style={{
              background: "#e9f5ff",
              padding: "8px",
              borderRadius: "4px",
              marginBottom: "12px",
              fontSize: "12px",
              color: "#0056b3",
            }}
          >
            💡 You can drag the pin on the map to reposition it.
          </div>
        )}

        {activeTab === "details" && (
          <>
            <input
              id={`hidden-color-picker-${location?.name || "new"}`}
              type="color"
              value={formData.color}
              onChange={(e) => handleChange("color", e.target.value)}
              style={{
                position: "fixed",
                top: "20%",
                left: "20%",
                opacity: 0,
                width: "1px",
                height: "1px",
                border: "none",
                padding: 0,
                pointerEvents: "none",
              }}
            />

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
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div className="edit-modal__field">
              <label>Region:</label>
              <select
                value={showNewRegion ? "__new__" : formData.region || ""}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setShowNewRegion(true);
                    setNewRegionName("");
                  } else {
                    setShowNewRegion(false);
                    setNewRegionName("");
                    handleChange("region", e.target.value);
                  }
                }}
              >
                <option value="">None</option>
                {allRegions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="__new__">+ Add new region…</option>
              </select>

              {showNewRegion && (
                <input
                  type="text"
                  className="new-group-input"
                  placeholder="Type region name…"
                  value={newRegionName}
                  autoFocus
                  onChange={(e) => setNewRegionName(e.target.value)}
                />
              )}
            </div>

            <div
              style={{
                position: "sticky",
                bottom: "-24px",
                background: "white",
                margin: "20px -24px -24px -24px",
                padding: "15px 24px 24px 24px",
                borderTop: "1px solid #eee",
                zIndex: 10,
                boxShadow: "0 -4px 10px rgba(0,0,0,0.03)",
              }}
            >
              <div
                className="edit-modal__field"
                style={{ marginBottom: "15px" }}
              >
                <label>Color:</label>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "5px",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    htmlFor={`hidden-color-picker-${location?.name || "new"}`}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                      background: !LOCATION_COLORS.map((c) =>
                        c.toUpperCase(),
                      ).includes(formData.color.toUpperCase())
                        ? formData.color
                        : "#fff",
                      border: !LOCATION_COLORS.map((c) =>
                        c.toUpperCase(),
                      ).includes(formData.color.toUpperCase())
                        ? "3px solid #007bff"
                        : "1px dashed #ccc",
                      boxShadow: !LOCATION_COLORS.map((c) =>
                        c.toUpperCase(),
                      ).includes(formData.color.toUpperCase())
                        ? "0 0 5px rgba(0,123,255,0.5)"
                        : "0 2px 4px rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Choose custom colour"
                  >
                    {!LOCATION_COLORS.map((c) => c.toUpperCase()).includes(
                      formData.color.toUpperCase(),
                    ) ? null : (
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#8a7b6b",
                          lineHeight: 1,
                        }}
                      >
                        +
                      </span>
                    )}
                  </label>
                  {LOCATION_COLORS.map((colorOption) => (
                    <div
                      key={colorOption}
                      onClick={() => handleChange("color", colorOption)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: colorOption,
                        cursor: "pointer",
                        flexShrink: 0,
                        border:
                          formData.color.toUpperCase() ===
                          colorOption.toUpperCase()
                            ? "3px solid #007bff"
                            : "2px solid transparent",
                        boxShadow:
                          formData.color.toUpperCase() ===
                          colorOption.toUpperCase()
                            ? "0 0 5px rgba(0,123,255,0.5)"
                            : "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="edit-modal__actions" style={{ marginTop: 0 }}>
                <button onClick={handleSave}>Save</button>
                {!isAdding && location && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete this location?",
                        )
                      ) {
                        deleteLocation(location.name);
                        onClose();
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
          </>
        )}

        {activeTab === "characters" && (
          <>
            <div
              className="character-list"
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #eee",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              {chars.length > 0 ? (
                chars.map((c: Character) => (
                  <div
                    key={c.id}
                    className="character-item"
                    style={{ padding: "6px", marginBottom: "4px" }}
                  >
                    <span
                      className="character-item__name"
                      style={{ fontSize: "12px" }}
                    >
                      {c.name}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "12px", color: "#666" }}>
                  No characters here.
                </p>
              )}
            </div>
            {allGroups.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
                  Move Group Here
                </h4>
                <div className="pin-popup-groups">
                  {allGroups.map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        location && moveGroupToLocation(g, location.name)
                      }
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontFamily: "inherit",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="edit-modal__actions" style={{ marginTop: "16px" }}>
              {onAddCharacterHere && (
                <button
                  onClick={onAddCharacterHere}
                  style={{ background: "#17a2b8", fontFamily: "inherit" }}
                >
                  Add Character Here
                </button>
              )}
              <button onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
