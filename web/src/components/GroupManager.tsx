import { useState } from "react";
import { useBook } from "../context/BookContext";

export default function GroupManager() {
  const { book, allGroups, setGroupTravel } = useBook();
  const { characters, locations } = book;

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggle = (name: string) =>
    setExpandedGroup((prev) => (prev === name ? null : name));

  if (allGroups.length === 0) {
    return (
      <div className="character-management">
        <h2>Manage Groups</h2>
        <p style={{ color: "#8a7b6b", fontStyle: "italic" }}>
          No groups yet. Assign characters to a group when editing them.
        </p>
      </div>
    );
  }

  return (
    <div className="character-management">
      <h2>Manage Groups</h2>

      <div className="accordion-list">
        {allGroups.map((groupName) => {
          const members = characters.filter((c) => c.group === groupName);
          const groupLocation = members[0]?.location || "";
          const groupTravelTo = members[0]?.travelTo || "";
          const groupProgress = members[0]?.travelProgress ?? 0;
          const isOpen = expandedGroup === groupName;

          return (
            <div
              key={groupName}
              className={`accordion-item${isOpen ? " accordion-item--open" : ""}`}
            >
              <button
                className="accordion-header"
                onClick={() => toggle(groupName)}
                aria-expanded={isOpen}
              >
                <span className="accordion-name">{groupName}</span>
                <span className="accordion-badge">
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
                {groupLocation && (
                  <span className="accordion-location">{groupLocation}</span>
                )}
                <span className="accordion-chevron">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="accordion-body">
                  <div className="accordion-members">
                    {members.map((m) => (
                      <span key={m.id} className="group-member-tag">
                        {m.name}
                      </span>
                    ))}
                  </div>

                  <div className="accordion-field">
                    <label>From:</label>
                    <select
                      value={groupLocation}
                      onChange={(e) =>
                        setGroupTravel(
                          groupName,
                          e.target.value,
                          groupTravelTo || undefined,
                          groupProgress,
                        )
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

                  <div className="accordion-field">
                    <label>Traveling to:</label>
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
                    <div className="accordion-field">
                      <label>Progress: {Math.round(groupProgress * 100)}%</label>
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
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
