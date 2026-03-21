import { useBook } from "../context/BookContext";

export default function GroupManager() {
  const { book, allGroups, setGroupTravel } = useBook();
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
          const groupTravelTo = members[0]?.travelTo || "";
          const groupProgress = members[0]?.travelProgress ?? 0;

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
                <span>Current Location (From):</span>
                <select
                  value={groupLocation}
                  onChange={(e) =>
                    setGroupTravel(groupName, e.target.value, groupTravelTo || undefined, groupProgress)
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
              <div className="group-card-location" style={{ marginTop: "8px" }}>
                <span>Traveling To:</span>
                <select
                  value={groupTravelTo}
                  onChange={(e) =>
                    setGroupTravel(
                      groupName,
                      groupLocation,
                      e.target.value || undefined,
                      e.target.value ? groupProgress : 0,
                    )
                  }
                >
                  <option value="">Not traveling</option>
                  {locations
                    .filter((loc) => loc.name !== groupLocation)
                    .map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                </select>
              </div>
              {groupTravelTo && (
                <div className="group-card-location" style={{ marginTop: "8px" }}>
                  <span>Progress: {Math.round(groupProgress * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(groupProgress * 100)}
                    onChange={(e) =>
                      setGroupTravel(
                        groupName,
                        groupLocation,
                        groupTravelTo,
                        Number(e.target.value) / 100,
                      )
                    }
                    style={{ flex: 1 }}
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
