import { useRef } from "react";
import CharacterAvatar from "./CharacterAvatar";
import type { Character, LocationConfig } from "../types";

interface MapPinProps {
  location: LocationConfig;
  characters: Character[];
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onEditLocation?: (location: LocationConfig) => void;
}

export default function MapPin({
  location,
  characters,
  isDragging,
  onPointerDown,
  onClick,
  onEditLocation,
}: MapPinProps) {
  const dragMoved = useRef(false);

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
      onPointerDown={(e) => {
        dragMoved.current = false;
        onPointerDown(e);
      }}
      onPointerMove={() => {
        // Mark that the pointer has moved so click won't trigger sheet open
        dragMoved.current = true;
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!dragMoved.current && onEditLocation) {
          onEditLocation(location);
        }
        dragMoved.current = false;
        onClick(e);
      }}
    >
      {/* Pin icon */}
      <div
        className="map-pin-icon"
        style={{ backgroundColor: location.color }}
      />

      {/* Static name label — always visible, no clipping issues */}
      <span className="map-pin-label">{location.name}</span>

      {/* Character avatars below the pin */}
      {characters.length > 0 && (
        <>
          <div className="map-pin-characters">
            {characters.map((c) => (
              <div key={c.id} title={c.name} className="map-pin-character">
                <CharacterAvatar
                  gender={c.gender || "Male"}
                  hairColor={c.hairColor || "#FFA012"}
                  beardColor={c.beardColor || "#FFA012"}
                />
              </div>
            ))}
          </div>
          {/* Single shared label — sibling of characters div, not inside it */}
          <span className="map-pin-names-label">
            {characters.length <= 2
              ? characters.map((c) => c.name).join(", ")
              : `${characters[0].name} +${characters.length - 1}`}
          </span>
        </>
      )}
    </div>
  );
}
