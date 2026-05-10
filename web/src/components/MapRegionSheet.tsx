import { useState } from "react";
import type { MapRegion } from "../types";
import { useBook } from "../context/BookContext";

const REGION_COLORS = [
  "rgba(194, 178, 128, 0.4)",
  "rgba(217, 217, 217, 0.4)",
  "rgba(100, 149, 237, 0.4)",
  "rgba(143, 188, 143, 0.4)",
];

interface Props {
  region: MapRegion;
  onClose: () => void;
}

type DetailField = "name" | "dimensions" | "colour";
const DETAIL_FIELDS: { key: DetailField; label: string }[] = [
  { key: "name",       label: "Name" },
  { key: "dimensions", label: "Dimensions" },
  { key: "colour",     label: "Colour" },
];

export default function MapRegionSheet({ region, onClose }: Props) {
  const { updateMapRegion, deleteMapRegion } = useBook();

  const [name, setName] = useState(region.name);
  const [color, setColor] = useState(region.color);
  const [width, setWidth] = useState(region.width.toString());
  const [height, setHeight] = useState(region.height.toString());

  // Active detail field (one visible at a time)
  const [fieldIdx, setFieldIdx] = useState(0);
  const field = DETAIL_FIELDS[fieldIdx];

  const handleSave = () => {
    updateMapRegion(region.id, {
      ...region,
      name: name.trim() || region.name,
      color,
      width: Math.max(10, parseInt(width) || region.width),
      height: Math.max(10, parseInt(height) || region.height),
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Delete region "${region.name}"?`)) {
      deleteMapRegion(region.id);
      onClose();
    }
  };

  return (
    <div className="map-sheet">
      <div className="map-sheet__header">
        <div className="map-sheet__drag-handle" />
        <span className="map-sheet__title">Edit Region</span>
        <button className="map-sheet__close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Outer tab bar */}
      <div className="map-sheet__tabs">
        <button className="map-sheet__tab map-sheet__tab--active">
          Details
        </button>
      </div>

      <div className="map-sheet__body">
        {/* Field pill nav */}
        <div className="map-sheet__field-nav">
          {DETAIL_FIELDS.map((f, i) => (
            <button
              key={f.key}
              className={`map-sheet__field-pill${fieldIdx === i ? " map-sheet__field-pill--active" : ""}`}
              onClick={() => setFieldIdx(i)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* One active field */}
        <div className="map-sheet__active-field">
          {field.key === "name" && (
            <input
              type="text"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="Region name…"
            />
          )}

          {field.key === "dimensions" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: "0.85em", color: "#666" }}>Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: "0.85em", color: "#666" }}>Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>
          )}

          {field.key === "colour" && (
            <div className="map-sheet__colors">
              {REGION_COLORS.map((c) => (
                <button
                  key={c}
                  className={`map-sheet__color-swatch${color === c ? " map-sheet__color-swatch--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>

        <div className="map-sheet__actions">
          <button className="map-sheet__btn map-sheet__btn--save" onClick={handleSave}>Save</button>
          <button className="map-sheet__btn map-sheet__btn--danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
