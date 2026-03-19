import CharacterAvatar from "./CharacterAvatar";
import type { Character, LocationConfig } from "../types";

interface MapPinProps {
  location: LocationConfig;
  characters: Character[];
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export default function MapPin({
  location,
  characters,
  isDragging,
  onMouseDown,
  onClick,
}: MapPinProps) {
  if (location.x === undefined || location.y === undefined) return null;

  return (
    <div
      id={`pin-${location.name.replace(/\s+/g, "-")}`}
      className="map-pin"
      style={{
        left: `${location.x}%`,
        top: `${location.y}%`,
        cursor: isDragging ? "grabbing" : "pointer",
        zIndex: isDragging ? 50 : 20,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        className="map-pin-icon"
        style={{ backgroundColor: location.color }}
      />
      <div className="map-pin-label">{location.name}</div>
      {characters.length > 0 && (
        <div
          className="map-pin-characters"
          style={{
            display: "flex",
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            justifyContent: "center",
            gap: "0px",
            pointerEvents: "none",
          }}
        >
          {characters.map((c) => (
            <div
              key={c.name}
              title={c.name}
              style={{
                width: "60px",
                height: "80px",
                transform: "scale(0.35)",
                transformOrigin: "top center",
                margin: "0 -14px",
              }}
            >
              <CharacterAvatar
                gender={c.gender || "Male"}
                hairColor={c.hairColor || "#FFA012"}
                beardColor={c.beardColor || "#FFA012"}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
