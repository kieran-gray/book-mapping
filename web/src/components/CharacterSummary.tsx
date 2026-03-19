import { useBook } from "../context/BookContext";

export default function CharacterSummary() {
  const { book, allGroups } = useBook();
  const { characters } = book;

  const ungrouped = characters.filter((c) => !c.group);

  return (
    <div className="contents-page">
      <h2>Characters & Groups</h2>

      {allGroups.map((groupName) => {
        const members = characters.filter((c) => c.group === groupName);
        if (members.length === 0) return null;
        return (
          <div key={groupName} className="group-section">
            <h3 className="group-section-title">{groupName}</h3>
            <div className="contents-list" style={{ marginTop: "10px" }}>
              {members.map((c) => (
                <div key={c.name} className="contents-item">
                  <span className="contents-name">{c.name}</span>
                  <span className="contents-dots" />
                  <span className="contents-details">
                    {c.location || "Unknown"} — {c.specialSkills || "None"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {ungrouped.length > 0 && (
        <div className="group-section">
          <h3 className="group-section-title">Ungrouped</h3>
          <div className="contents-list" style={{ marginTop: "10px" }}>
            {ungrouped.map((c) => (
              <div key={c.name} className="contents-item">
                <span className="contents-name">{c.name}</span>
                <span className="contents-dots" />
                <span className="contents-details">
                  {c.location || "Unknown"} — {c.specialSkills || "None"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
