import type { Character, LocationConfig } from "../types";
import { useBook } from "../context/BookContext";

interface PinPopupProps {
  pin: LocationConfig;
  onClose: () => void;
  onAddCharacterHere: () => void;
}

export default function PinPopup({
  pin,
  onClose,
  onAddCharacterHere,
}: PinPopupProps) {
  const { charactersByLocation, allGroups, moveGroupToLocation } = useBook();
  const chars = charactersByLocation[pin.name] ?? [];

  return (
    <div className="edit-modal">
      <div className="pin-modal-content">
        <h3>Characters at {pin.name}</h3>
        <div className="character-list" style={{ marginTop: "15px" }}>
          {chars.length > 0 ? (
            chars.map((c: Character) => (
              <div key={c.name} className="character-item">
                <span className="character-item__name">{c.name}</span>
              </div>
            ))
          ) : (
            <p>No characters here.</p>
          )}
        </div>
        {allGroups.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
              Move Group Here
            </h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {allGroups.map((g) => (
                <button
                  key={g}
                  onClick={() => moveGroupToLocation(g, pin.name)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="edit-modal__actions" style={{ marginTop: "20px" }}>
          <button onClick={onAddCharacterHere}>Add Character Here</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
