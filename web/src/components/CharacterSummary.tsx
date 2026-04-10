import { useBook } from "../context/BookContext";
import type { Character } from "../types";
import CharacterAvatar from "./CharacterAvatar";

export default function CharacterSummary() {
  const { book, allGroups } = useBook();
  const { characters } = book;

  const ungrouped = characters.filter((c: Character) => !c.group);

  const CharacterCard = ({ c }: { c: Character }) => (
    <div className="char-card">
      <div className="char-card__avatar">
        <CharacterAvatar
          gender={c.gender || "Male"}
          hairColor={c.hairColor || "#FFA012"}
          beardColor={c.beardColor || "#FFA012"}
        />
      </div>
      <div className="char-card__name">{c.name}</div>
      <div className="char-card__info">
        <span className="char-card__location">
          {c.travelTo
            ? `${c.location} → ${c.travelTo}`
            : c.location || "Unknown"}
        </span>
        {c.specialSkills && (
          <span className="char-card__skills">{c.specialSkills}</span>
        )}
        {c.characteristics && c.characteristics.length > 0 && (
          <div className="char-card__traits">
            {c.characteristics.map((t) => (
              <span key={t} className="char-card__trait-tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="contents-page">
      <h2>Characters &amp; Groups</h2>

      {allGroups.map((groupName: string) => {
        const members = characters.filter(
          (c: Character) => c.group === groupName,
        );
        if (members.length === 0) return null;
        return (
          <div key={groupName} className="group-section">
            <h3 className="group-section-title">{groupName}</h3>
            <div className="char-card-grid">
              {members.map((c: Character) => (
                <CharacterCard key={c.name} c={c} />
              ))}
            </div>
          </div>
        );
      })}

      {ungrouped.length > 0 && (
        <div className="group-section">
          <h3 className="group-section-title">Ungrouped</h3>
          <div className="char-card-grid">
            {ungrouped.map((c: Character) => (
              <CharacterCard key={c.name} c={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
