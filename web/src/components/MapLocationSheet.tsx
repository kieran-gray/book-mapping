import { useState } from "react";
import type { LocationConfig } from "../types";
import { useBook } from "../context/BookContext";

const LOCATION_COLORS = ["#C2B280", "#D9D9D9", "#292A2B"];

interface Props {
  location: LocationConfig;
  onClose: () => void;
  onAddCharacterHere: () => void;
}

type DetailField = "name" | "description" | "region" | "colour";
const DETAIL_FIELDS: { key: DetailField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "region", label: "Region" },
  { key: "colour", label: "Colour" },
];

export default function MapLocationSheet({
  location,
  onClose,
  onAddCharacterHere,
}: Props) {
  const {
    updateLocation,
    deleteLocation,
    allGroups,
    allRegions,
    charactersByLocation,
    moveGroupToLocation,
  } = useBook();

  const chars = charactersByLocation[location.name] ?? [];

  // Editable values
  const [name, setName] = useState(location.name);
  const [description, setDescription] = useState(location.description ?? "");
  const [color, setColor] = useState(location.color);
  const [region, setRegion] = useState(location.region ?? "");
  const [newRegion, setNewRegion] = useState("");
  const [showNewReg, setShowNewReg] = useState(false);

  // Active outer tab
  const [tab, setTab] = useState<"details" | "chars">("details");

  // Active detail field (one visible at a time)
  const [fieldIdx, setFieldIdx] = useState(0);
  const field = DETAIL_FIELDS[fieldIdx];

  const handleSave = () => {
    updateLocation(location.name, {
      ...location,
      name: name.trim() || location.name,
      description: description.trim() || undefined,
      color,
      region: showNewReg ? newRegion.trim() || undefined : region || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Delete "${location.name}"?`)) {
      deleteLocation(location.name);
      onClose();
    }
  };

  return (
    <div className="map-sheet">
      {/* Drag handle + close */}
      <div className="map-sheet__header">
        <div className="map-sheet__drag-handle" />
        <span className="map-sheet__title">{location.name}</span>
        <button
          className="map-sheet__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Outer tab bar */}
      <div className="map-sheet__tabs">
        <button
          className={`map-sheet__tab${
            tab === "details" ? " map-sheet__tab--active" : ""
          }`}
          onClick={() => setTab("details")}
        >
          Details
        </button>
        <button
          className={`map-sheet__tab${
            tab === "chars" ? " map-sheet__tab--active" : ""
          }`}
          onClick={() => setTab("chars")}
        >
          Characters{chars.length > 0 ? ` (${chars.length})` : ""}
        </button>
      </div>

      {/* ── DETAILS TAB ── */}
      {tab === "details" && (
        <div className="map-sheet__body">
          {/* Field pill nav */}
          <div className="map-sheet__field-nav">
            {DETAIL_FIELDS.map((f, i) => (
              <button
                key={f.key}
                className={`map-sheet__field-pill${
                  fieldIdx === i ? " map-sheet__field-pill--active" : ""
                }`}
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
                placeholder="Location name…"
              />
            )}

            {field.key === "description" && (
              <input
                type="text"
                value={description}
                autoFocus
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description…"
              />
            )}

            {field.key === "region" && (
              <>
                <select
                  value={showNewReg ? "__new__" : region}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setShowNewReg(true);
                      setNewRegion("");
                    } else {
                      setShowNewReg(false);
                      setRegion(e.target.value);
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
                {showNewReg && (
                  <input
                    type="text"
                    className="new-group-input"
                    placeholder="Region name…"
                    value={newRegion}
                    autoFocus
                    onChange={(e) => setNewRegion(e.target.value)}
                    style={{ marginTop: 6 }}
                  />
                )}
              </>
            )}

            {field.key === "colour" && (
              <>
                <input
                  id={`hidden-map-color-picker-${location.name}`}
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    position: "fixed",
                    top: "20%",
                    left: "50%",
                    opacity: 0,
                    width: "1px",
                    height: "1px",
                    border: "none",
                    padding: 0,
                    pointerEvents: "none",
                  }}
                />
                <div className="map-sheet__colors">
                  <label
                    htmlFor={`hidden-map-color-picker-${location.name}`}
                    className={`map-sheet__color-swatch${
                      !LOCATION_COLORS.map((c) => c.toUpperCase()).includes(
                        color.toUpperCase(),
                      )
                        ? " map-sheet__color-swatch--active"
                        : ""
                    }`}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      background: !LOCATION_COLORS.map((c) =>
                        c.toUpperCase(),
                      ).includes(color.toUpperCase())
                        ? color
                        : "#fff",
                      border: "1px dashed #c2b280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    title="Choose custom colour"
                  >
                    {!LOCATION_COLORS.map((c) => c.toUpperCase()).includes(
                      color.toUpperCase(),
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
                  {LOCATION_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`map-sheet__color-swatch${
                        color.toUpperCase() === c.toUpperCase()
                          ? " map-sheet__color-swatch--active"
                          : ""
                      }`}
                      style={{ background: c }}
                      onClick={() => setColor(c)}
                      aria-label={c}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Save + Delete */}
          <div className="map-sheet__actions">
            <button
              className="map-sheet__btn map-sheet__btn--save"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="map-sheet__btn map-sheet__btn--danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>

          <p className="map-sheet__hint">💡 Drag the pin to reposition</p>
        </div>
      )}

      {/* ── CHARACTERS TAB ── */}
      {tab === "chars" && (
        <div className="map-sheet__body">
          {chars.length === 0 ? (
            <p className="map-sheet__empty">No characters at this location.</p>
          ) : (
            <div className="map-sheet__char-list">
              {chars.map((c) => (
                <span key={c.id} className="group-member-tag">
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {allGroups.length > 0 && (
            <div className="map-sheet__field" style={{ marginTop: 10 }}>
              <label>Move group here</label>
              <div className="map-sheet__group-btns">
                {allGroups.map((g) => (
                  <button
                    key={g}
                    className="map-sheet__group-pill"
                    onClick={() => moveGroupToLocation(g, location.name)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="map-sheet__actions" style={{ marginTop: 12 }}>
            <button
              className="map-sheet__btn map-sheet__btn--save"
              onClick={onAddCharacterHere}
            >
              + Add Character Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
