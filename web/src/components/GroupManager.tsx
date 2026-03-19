import { useBook } from "../context/BookContext";

export default function GroupManager() {
  const { book, allGroups, moveGroupToLocation } = useBook();
  const { characters, locations } = book;

  return (
    <div className="character-management">
      <h2>Manage Groups</h2>
      {allGroups.length === 0 ? (
        <p style={{ color: "#8a7b6b", fontStyle: "italic" }}>
          No groups yet. Assign characters to a group when editing them.
        </p>
      ) : (
        allGroups.map((groupName) => {
          const members = characters.filter((c) => c.group === groupName);
          const groupLocation = members[0]?.location || "";
          return (
            <div key={groupName} className="group-card">
              <div className="group-card-header">
                <span className="group-card-name">{groupName}</span>
                <span className="group-card-count">
                  {members.length} member
                  {members.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="group-card-members">
                {members.map((m) => (
                  <span key={m.name} className="group-member-tag">
                    {m.name}
                  </span>
                ))}
              </div>
              <div className="group-card-location">
                <span>Move to:</span>
                <select
                  value={groupLocation}
                  onChange={(e) =>
                    moveGroupToLocation(groupName, e.target.value)
                  }
                >
                  <option value="">Select location...</option>
                  {locations.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
