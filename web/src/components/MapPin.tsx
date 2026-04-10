import { useState, useRef } from "react";
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
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const dragMoved = useRef(false);

  const showTooltip = hovered || clicked;

  if (location.x === undefined || location.y === undefined) return null;

  return (
    <div
      id={`pin-${location.name.replace(/\s+/g, "-")}`}
      className="map-pin"
      style={{
        left: `${location.x}%`,
        top: `${location.y}%`,
        cursor: isDragging ? "grabbing" : "pointer",
        zIndex: isDragging ? 50 : (showTooltip ? 40 : 20),
      }}
      onPointerDown={(e) => {
        dragMoved.current = false;
        onPointerDown(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!dragMoved.current) {
          setClicked((prev) => !prev);
        }
        onClick(e);
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          setHovered(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          setHovered(false);
        }
      }}
    >
      <div
        className="map-pin-icon"
        style={{ backgroundColor: location.color }}
      />
      {/* Tooltip on hover and click */}
      {showTooltip && (
        <div className="map-pin-tooltip">
          <strong>{location.name}</strong>
          {location.description && (
            <p className="map-pin-tooltip-desc">{location.description}</p>
          )}
          {characters.length > 0 && (
            <div className="map-pin-tooltip-chars">
              {characters.map((c) => (
                <span key={c.name} className="map-pin-tooltip-char">
                  {c.name}
                </span>
              ))}
            </div>
          )}
          {onEditLocation && (
            <button
              className="map-pin-tooltip-edit"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setClicked(false);
                setHovered(false);
                onEditLocation(location);
              }}
            >
              Edit Location
            </button>
          )}
        </div>
      )}
      {characters.length > 0 && (
        <div className="map-pin-characters">
          {characters.map((c) => (
            <div
              key={c.name}
              title={c.name}
              className="map-pin-character"
            >
              <CharacterAvatar
                gender={c.gender || "Male"}
                hairColor={c.hairColor || "#FFA012"}
                beardColor={c.beardColor || "#FFA012"}
              />
              <span className="map-pin-character-name">{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
