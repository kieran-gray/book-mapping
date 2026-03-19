import React from "react";
import "./Location.css";

interface LocationCharacter {
  name: string;
  specialSkills: string;
}

interface LocationProps {
  name: string;
  color: string;
  characters: LocationCharacter[];
  characterOffsets?: Record<string, { x: number; y: number }>;
}

const Location: React.FC<LocationProps> = ({
  name,
  color,
  characters,
  characterOffsets = {},
}) => {
  // If color contains an alpha channel (e.g., #e195db), strip it before appending our custom opacity '15'
  const backgroundColor =
    color.length > 7 ? `${color.substring(0, 7)}15` : `${color}15`;

  return (
    <div className="location" style={{ borderColor: color, backgroundColor }}>
      <div className="location__title" style={{ color }}>
        {name}
      </div>
      <div className="location__characters">
        {characters.length === 0 ? (
          <p className="location__empty">No characters present</p>
        ) : (
          characters.map((character) => {
            const offset = characterOffsets[character.name] || { x: 0, y: 0 };
            return (
              <div
                id={`character-${character.name.replace(/\\s+/g, "-")}`}
                key={character.name}
                className="location__character"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                  transition: "transform 0.3s ease-out",
                }}
              >
                <div className="location__character-name">{character.name}</div>
                {character.specialSkills && (
                  <div className="location__character-skills">
                    {character.specialSkills}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Location;
