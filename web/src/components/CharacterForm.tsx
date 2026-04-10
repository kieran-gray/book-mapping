import { useState } from "react";
import type { Character } from "../types";
import { useBook } from "../context/BookContext";

interface CharacterFormProps {
  character?: Character;
  isAdding: boolean;
  initialLocation?: string;
  onClose: () => void;
}

const HAIR_COLORS = ["#FFA012", "#FF6600", "#201108", "#1e1e20", "#BFBFBF"];
const BEARD_COLORS = ["#FFA012", "#FF6600", "#201108", "#1e1e20", "#BFBFBF"];

export default function CharacterForm({
  character,
  isAdding,
  initialLocation,
  onClose,
}: CharacterFormProps) {
  const { book, allGroups, addCharacter, updateCharacter, deleteCharacter } = useBook();
  const { locations } = book;

  const [formData, setFormData] = useState<Character>(
    character ?? {
      id: "",
      name: "",
      location: initialLocation ?? "",
      specialSkills: "",
      gender: "Male",
      hairColor: "#FFA012",
      beardColor: "#FFA012",
      group: "",
    },
  );

  const handleChange = (field: keyof Character, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isAdding) {
      addCharacter(formData);
    } else if (character) {
      updateCharacter(character.id, formData);
    }
    onClose();
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal__content">
        <h3>{isAdding ? "Add Character" : `Edit ${character?.name}`}</h3>

        <div className="edit-modal__field">
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="edit-modal__field">
          <label>Current Location (From):</label>
          <select
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
          >
            <option value="">Select a location...</option>
            {locations.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="edit-modal__field">
          <label>Traveling To:</label>
          <select
            value={formData.travelTo || ""}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({
                ...prev,
                travelTo: val || undefined,
                travelProgress: val ? prev.travelProgress ?? 0 : undefined,
              }));
            }}
          >
            <option value="">Not traveling</option>
            {locations
              .filter((loc) => loc.name !== formData.location)
              .map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
          </select>
        </div>

        {formData.travelTo && (
          <div className="edit-modal__field">
            <label>
              Travel Progress:{" "}
              {Math.round((formData.travelProgress ?? 0) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((formData.travelProgress ?? 0) * 100)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  travelProgress: Number(e.target.value) / 100,
                }))
              }
            />
          </div>
        )}

        <div className="edit-modal__field">
          <label>Special Skills:</label>
          <input
            type="text"
            value={formData.specialSkills}
            onChange={(e) => handleChange("specialSkills", e.target.value)}
          />
        </div>

        <div className="edit-modal__field">
          <label>Group:</label>
          {formData.group === "__new__" ? (
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                placeholder="New group name..."
                autoFocus
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.target as HTMLInputElement).value.trim()
                  ) {
                    handleChange(
                      "group",
                      (e.target as HTMLInputElement).value.trim(),
                    );
                  }
                  if (e.key === "Escape") {
                    handleChange("group", "");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    handleChange("group", e.target.value.trim());
                  } else {
                    handleChange("group", "");
                  }
                }}
              />
            </div>
          ) : (
            <select
              value={formData.group || ""}
              onChange={(e) => handleChange("group", e.target.value)}
            >
              <option value="">None</option>
              {allGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="__new__">+ Add new group...</option>
            </select>
          )}
        </div>

        <div className="edit-modal__field">
          <label>Gender:</label>
          <select
            value={formData.gender || "Male"}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="edit-modal__field color-picker-row">
          <ColorPicker
            label="Hair Color:"
            colors={HAIR_COLORS}
            value={formData.hairColor || ""}
            onChange={(c) => handleChange("hairColor", c)}
          />
          {(formData.gender === "Male" || !formData.gender) && (
            <ColorPicker
              label="Beard Color:"
              colors={BEARD_COLORS}
              value={formData.beardColor || ""}
              onChange={(c) => handleChange("beardColor", c)}
            />
          )}
        </div>

        {book.characteristics && book.characteristics.length > 0 && (
          <div className="edit-modal__field">
            <label>Characteristics:</label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              {book.characteristics.map((ch) => {
                const isChecked =
                  formData.characteristics?.includes(ch.title) ?? false;
                return (
                  <label
                    key={ch.title}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "4px",
                      fontSize: "14px",
                      cursor: "pointer",
                      textAlign: "left",
                      margin: 0,
                      fontWeight: "normal",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ margin: 0, width: "auto", padding: 0, cursor: "pointer" }}
                      checked={isChecked}
                      onChange={() => {
                        setFormData((prev) => {
                          const current = prev.characteristics || [];
                          const next = isChecked
                            ? current.filter((t) => t !== ch.title)
                            : [...current, ch.title];
                          return { ...prev, characteristics: next };
                        });
                      }}
                    />
                    <span>
                      <strong>{ch.title}</strong>
                      <span style={{ color: "#666", marginLeft: "6px" }}>
                        — {ch.meaning}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="edit-modal__actions">
          <button onClick={handleSave}>Save</button>
          {!isAdding && character && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this character?")) {
                  deleteCharacter(character.id);
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
    </div>
  );
}

function ColorPicker({
  label,
  colors,
  value,
  onChange,
}: {
  label: string;
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <label
        style={{ fontSize: "13px", marginBottom: "8px", fontWeight: "bold" }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "160px",
        }}
      >
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => onChange(color)}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              backgroundColor: color,
              cursor: "pointer",
              border:
                (value || "").toUpperCase() === color.toUpperCase()
                  ? "2px solid #007bff"
                  : "2px solid transparent",
              boxShadow:
                (value || "").toUpperCase() === color.toUpperCase()
                  ? "0 0 6px rgba(0,123,255,0.6)"
                  : "0 2px 4px rgba(0,0,0,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
