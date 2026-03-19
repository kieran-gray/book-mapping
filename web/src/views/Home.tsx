import { useState, useEffect, useRef } from "react";
import CharacterAvatar from "../components/CharacterAvatar";
import "./Home.css";

interface Character {
  name: string;
  location: string;
  specialSkills: string;
  gender?: "Male" | "Female";
  hairColor?: string;
  beardColor?: string;
  group?: string;
}

interface LocationConfig {
  name: string;
  color: string;
  x?: number;
  y?: number;
}

interface Relationship {
  source: string;
  target: string;
  type: "Friendly" | "Enemies" | "Neutral";
}

const Home = () => {
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [activePin, setActivePin] = useState<LocationConfig | null>(null);
  const mapRef = useRef<HTMLImageElement>(null);
  const [draggingPin, setDraggingPin] = useState<string | null>(null);
  const dragHasMoved = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingPin || !mapRef.current) return;
      dragHasMoved.current = true;
      const rect = mapRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;

      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      setLocations((prev) =>
        prev.map((loc) => (loc.name === draggingPin ? { ...loc, x, y } : loc)),
      );
    };

    const handleMouseUp = () => {
      if (draggingPin) {
        setDraggingPin(null);
      }
    };

    if (draggingPin) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingPin]);

  const [locations, setLocations] = useState<LocationConfig[]>([
    { name: "OSKUTRED", color: "#D9D9D9", x: 60.42, y: 23.5 },
    { name: "DARL", color: "#D9D9D9", x: 59.41, y: 48.65 },
    { name: "THE GRIMHOLT", color: "#D9D9D9", x: 69.33, y: 36.21 },
    { name: "SVELGARTH", color: "#D9D9D9", x: 83.45, y: 45.1 },
    { name: "FELLUR", color: "#D9D9D9", x: 75.88, y: 56.02 },
    { name: "LIGA", color: "#D9D9D9", x: 46.47, y: 56.91 },
    { name: "SNAKAVIK", color: "#D9D9D9", x: 35.04, y: 39.63 },
    { name: "ELDRAFELL", color: "#D9D9D9", x: 46.47, y: 24.39 },
    { name: "ULAZ", color: "#D9D9D9", x: 61.09, y: 80.29 },
    { name: "UNKNOWN", color: "#D9D9D9", x: 22.61, y: 71.14 },
  ]);

  const [characters, setCharacters] = useState<Character[]>([
    {
      name: "Orka",
      location: "DARL",
      specialSkills: "Fighting",
      gender: "Female",
      hairColor: "#3d2314",
      group: "",
    },
    {
      name: "Lif",
      location: "DARL",
      specialSkills: "Child, Brother to Mord",
      gender: "Male",
      hairColor: "#e0c08b",
      group: "",
    },
    {
      name: "Mord",
      location: "DARL",
      specialSkills: "Child, Brother to Lif",
      gender: "Male",
      hairColor: "#e0c08b",
      group: "",
    },
    {
      name: "Varg",
      location: "THE GRIMHOLT",
      specialSkills: "Bloodsworn",
      gender: "Male",
      hairColor: "#b58e65",
      beardColor: "#b58e65",
      group: "",
    },
    {
      name: "Elvar",
      location: "SNAKAVIK",
      specialSkills: "Battle-Grim",
      gender: "Female",
      hairColor: "#e0c08b",
      group: "",
    },
    {
      name: "Grend",
      location: "SNAKAVIK",
      specialSkills: "Battle-Grim",
      gender: "Male",
      hairColor: "#3d2314",
      group: "",
    },
    {
      name: "Drekr",
      location: "UNKNOWN",
      specialSkills: "UNKNOWN",
      gender: "Male",
      hairColor: "#3d2314",
      group: "",
    },
  ]);

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [formData, setFormData] = useState<Character | null>(null);

  const [editingLocation, setEditingLocation] = useState<LocationConfig | null>(
    null,
  );
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [locationFormData, setLocationFormData] =
    useState<LocationConfig | null>(null);

  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [relationshipFormData, setRelationshipFormData] =
    useState<Relationship | null>(null);
  const [lines, setLines] = useState<
    { pathD: string; key: string; type: "Friendly" | "Enemies" | "Neutral" }[]
  >([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [characterOffsets, setCharacterOffsets] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [currentSpread, setCurrentSpread] = useState(0);

  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: typeof lines = [];

      const pinNodes: Record<
        string,
        { name: string; cx: number; cy: number; w: number; h: number }
      > = {};
      locations.forEach((loc) => {
        const el = document.getElementById(
          `pin-${loc.name.replace(/\s+/g, "-")}`,
        );
        if (el) {
          const rect = el.getBoundingClientRect();
          pinNodes[loc.name] = {
            name: loc.name,
            cx: rect.left + rect.width / 2 - containerRect.left,
            cy: rect.top + rect.height / 2 - containerRect.top,
            w: rect.width,
            h: rect.height,
          };
        }
      });

      const distPointToSegment = (
        px: number,
        py: number,
        ax: number,
        ay: number,
        bx: number,
        by: number,
      ) => {
        const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
        if (l2 === 0) return Math.hypot(px - ax, py - ay);
        let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
      };

      relationships.forEach((rel) => {
        const sChar = characters.find((c) => c.name === rel.source);
        const tChar = characters.find((c) => c.name === rel.target);
        if (!sChar || !tChar) return;
        const sLocName = sChar.location;
        const tLocName = tChar.location;
        if (!sLocName || !tLocName || sLocName === tLocName) return;

        const sNode = pinNodes[sLocName];
        const tNode = pinNodes[tLocName];
        if (!sNode || !tNode) return;

        const getBoxIntersection = (
          cx: number,
          cy: number,
          w: number,
          h: number,
          tx: number,
          ty: number,
        ) => {
          const dx = tx - cx;
          const dy = ty - cy;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          if (absDx === 0 && absDy === 0) return { x: cx, y: cy };
          const scale = Math.min(
            (w / 2 + 5) / (absDx || 1),
            (h / 2 + 5) / (absDy || 1),
          );
          return {
            x: cx + dx * Math.min(1, scale),
            y: cy + dy * Math.min(1, scale),
          };
        };

        const p1 = getBoxIntersection(
          sNode.cx,
          sNode.cy,
          sNode.w,
          sNode.h,
          tNode.cx,
          tNode.cy,
        );
        const p2 = getBoxIntersection(
          tNode.cx,
          tNode.cy,
          tNode.w,
          tNode.h,
          sNode.cx,
          sNode.cy,
        );

        const intersectingNodes = Object.values(pinNodes).filter((n) => {
          if (n.name === sLocName || n.name === tLocName) return false;
          const dist = distPointToSegment(n.cx, n.cy, p1.x, p1.y, p2.x, p2.y);
          return dist < n.w / 2 + 20;
        });

        let pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

        if (intersectingNodes.length > 0) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy);
          const nx = -dy / (len || 1);
          const ny = dx / (len || 1);

          const shifts = [120, -120, 200, -200, 300, -300];
          let bestShift = 120;

          for (const shift of shifts) {
            const curveMidX = p1.x + dx / 2 + nx * (shift / 2);
            const curveMidY = p1.y + dy / 2 + ny * (shift / 2);

            const conflict = intersectingNodes.some(
              (n) =>
                Math.hypot(n.cx - curveMidX, n.cy - curveMidY) < n.w / 2 + 15,
            );
            if (!conflict) {
              bestShift = shift;
              break;
            }
          }

          // Re-calculate p1 and p2 based on the control point so the line still originates correctly from the borders
          const cpX = p1.x + dx / 2 + nx * bestShift;
          const cpY = p1.y + dy / 2 + ny * bestShift;

          const newP1 = getBoxIntersection(
            sNode.cx,
            sNode.cy,
            sNode.w,
            sNode.h,
            cpX,
            cpY,
          );
          const newP2 = getBoxIntersection(
            tNode.cx,
            tNode.cy,
            tNode.w,
            tNode.h,
            cpX,
            cpY,
          );

          pathD = `M ${newP1.x} ${newP1.y} Q ${cpX} ${cpY} ${newP2.x} ${newP2.y}`;
        }

        newLines.push({
          key: `${rel.source}-${rel.target}`,
          type: rel.type,
          pathD,
        });
      });

      // Clear layout offsets if they existed previously
      if (Object.keys(characterOffsets).length > 0) {
        setCharacterOffsets({});
      }

      const linesChanged = JSON.stringify(lines) !== JSON.stringify(newLines);
      if (linesChanged) {
        setLines(newLines);
      }
    };

    updateLines();
    window.addEventListener("resize", updateLines);
    // Observe DOM changes or layout shifts loosely
    const interval = setInterval(updateLines, 1000);
    return () => {
      window.removeEventListener("resize", updateLines);
      clearInterval(interval);
    };
  }, [characters, locations, relationships]);

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({ ...character });
  };

  const handleAddCharacter = () => {
    setIsAddingCharacter(true);
    setFormData({
      name: "",
      location: "",
      specialSkills: "",
      gender: "Male",
      hairColor: "#FFA012",
      beardColor: "#FFA012",
      group: "",
    });
  };

  const handleFormChange = (field: keyof Character, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = () => {
    if (formData) {
      if (isAddingCharacter) {
        setCharacters([...characters, formData]);
      } else if (editingCharacter) {
        setCharacters(
          characters.map((c) =>
            c.name === editingCharacter.name ? formData : c,
          ),
        );
      }
      setEditingCharacter(null);
      setIsAddingCharacter(false);
      setFormData(null);
    }
  };

  const handleCancel = () => {
    setEditingCharacter(null);
    setIsAddingCharacter(false);
    setFormData(null);
  };

  const handleEditLocation = (location: LocationConfig) => {
    setEditingLocation(location);
    setLocationFormData({ ...location });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsAddingLocation(true);
    setLocationFormData({ name: "", color: "#43A047", x, y });
  };

  const handleAddLocation = () => {
    setIsAddingLocation(true);
    setLocationFormData({ name: "", color: "#43A047", x: 50, y: 50 });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setMapImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLocationFormChange = (
    field: keyof LocationConfig,
    value: string,
  ) => {
    if (locationFormData) {
      setLocationFormData({ ...locationFormData, [field]: value });
    }
  };

  const handleSaveLocation = () => {
    if (locationFormData) {
      if (isAddingLocation) {
        setLocations([...locations, locationFormData]);
      } else if (editingLocation) {
        if (editingLocation.name !== locationFormData.name) {
          setCharacters(
            characters.map((c) =>
              c.location === editingLocation.name
                ? { ...c, location: locationFormData.name }
                : c,
            ),
          );
        }
        setLocations(
          locations.map((loc) =>
            loc.name === editingLocation.name ? locationFormData : loc,
          ),
        );
      }
      setEditingLocation(null);
      setIsAddingLocation(false);
      setLocationFormData(null);
    }
  };

  const handleDeleteLocation = (locationName: string) => {
    setLocations(locations.filter((loc) => loc.name !== locationName));
    setCharacters(
      characters.map((c) =>
        c.location === locationName ? { ...c, location: "" } : c,
      ),
    );
  };

  const handleCancelLocation = () => {
    setEditingLocation(null);
    setIsAddingLocation(false);
    setLocationFormData(null);
  };

  const handleAddRelationship = () => {
    setIsAddingRelationship(true);
    setRelationshipFormData({ source: "", target: "", type: "Neutral" });
  };

  const handleRelationshipFormChange = (
    field: keyof Relationship,
    value: string,
  ) => {
    if (relationshipFormData) {
      setRelationshipFormData({ ...relationshipFormData, [field]: value });
    }
  };

  const handleSaveRelationship = () => {
    if (
      relationshipFormData &&
      relationshipFormData.source &&
      relationshipFormData.target &&
      relationshipFormData.source !== relationshipFormData.target
    ) {
      setRelationships([...relationships, relationshipFormData]);
      setIsAddingRelationship(false);
      setRelationshipFormData(null);
    }
  };

  const handleDeleteRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const handleCancelRelationship = () => {
    setIsAddingRelationship(false);
    setRelationshipFormData(null);
  };

  const handleMoveGroupToLocation = (
    groupName: string,
    locationName: string,
  ) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.group === groupName ? { ...c, location: locationName } : c,
      ),
    );
  };

  const allGroups = Array.from(
    new Set(characters.map((c) => c.group).filter((g): g is string => !!g)),
  );

  const groupCharactersByLocation = () => {
    const grouped: { [key: string]: Character[] } = {};
    locations.forEach((loc) => {
      grouped[loc.name] = characters.filter((c) => c.location === loc.name);
    });
    return grouped;
  };

  const charactersByLocation = groupCharactersByLocation();

  return (
    <div className="home book-theme">
      <h1 className="book-title">The Shadow of the Gods</h1>

      <div className="book-container">
        {/* Left Page */}
        <div className="book-page book-page-left">
          <div className="page-content">
            {currentSpread === 0 && (
              <div className="locations-container">
                <h2>World Map</h2>
                {!mapImage ? (
                  <div className="map-uploader">
                    <p>Upload a map image to start placing locations</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                ) : (
                  <div
                    className="map-container"
                    ref={containerRef}
                    onClick={handleMapClick}
                  >
                    <img
                      src={mapImage}
                      alt="World Map"
                      className="map-image"
                      ref={mapRef}
                    />
                    <svg
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    >
                      {lines.map((line) => {
                        const color =
                          line.type === "Friendly"
                            ? "#28a745"
                            : line.type === "Enemies"
                              ? "#dc3545"
                              : "#6c757d";
                        return (
                          <path
                            key={line.key}
                            d={line.pathD}
                            fill="transparent"
                            stroke={color}
                            strokeWidth="3"
                            strokeDasharray="5,5"
                          />
                        );
                      })}
                    </svg>
                    {locations.map((loc) => {
                      if (loc.x === undefined || loc.y === undefined)
                        return null;
                      return (
                        <div
                          key={loc.name}
                          id={`pin-${loc.name.replace(/\\s+/g, "-")}`}
                          className="map-pin"
                          style={{
                            left: `${loc.x}%`,
                            top: `${loc.y}%`,
                            cursor:
                              draggingPin === loc.name ? "grabbing" : "pointer",
                            zIndex: draggingPin === loc.name ? 50 : 20,
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dragHasMoved.current = false;
                            setDraggingPin(loc.name);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!dragHasMoved.current) {
                              setActivePin(loc);
                            }
                          }}
                        >
                          <div
                            className="map-pin-icon"
                            style={{ backgroundColor: loc.color }}
                          ></div>
                          <div className="map-pin-label">{loc.name}</div>
                          {charactersByLocation[loc.name]?.length > 0 && (
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
                              {charactersByLocation[loc.name].map((c) => (
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
                    })}
                  </div>
                )}
                {activePin && (
                  <div className="edit-modal">
                    <div className="pin-modal-content">
                      <h3>Characters at {activePin.name}</h3>
                      <div
                        className="character-list"
                        style={{ marginTop: "15px" }}
                      >
                        {charactersByLocation[activePin.name]?.length > 0 ? (
                          charactersByLocation[activePin.name].map((c) => (
                            <div key={c.name} className="character-item">
                              <span className="character-item__name">
                                {c.name}
                              </span>
                              <button
                                onClick={() => {
                                  setActivePin(null);
                                  handleEdit(c);
                                }}
                              >
                                Edit
                              </button>
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
                                onClick={() => {
                                  handleMoveGroupToLocation(g, activePin.name);
                                }}
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
                      <div
                        className="edit-modal__actions"
                        style={{ marginTop: "20px" }}
                      >
                        <button
                          onClick={() => {
                            setActivePin(null);
                            setIsAddingCharacter(true);
                            setFormData({
                              name: "",
                              location: activePin.name,
                              specialSkills: "",
                              gender: "Male",
                              hairColor: "#FFA012",
                              beardColor: "#FFA012",
                              group: "",
                            });
                          }}
                        >
                          Add Character Here
                        </button>
                        <button onClick={() => setActivePin(null)}>
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentSpread === 1 && (
              <div className="character-management">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ margin: 0 }}>Manage Characters</h2>
                  <button
                    onClick={handleAddCharacter}
                    style={{
                      height: "fit-content",
                      padding: "8px 16px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Add Character
                  </button>
                </div>
                <div className="character-list">
                  {characters.map((character) => (
                    <div key={character.name} className="character-item">
                      <span className="character-item__name">
                        {character.name}
                      </span>
                      <span className="character-item__location">
                        {character.location}
                        {character.group ? ` · ${character.group}` : ""}
                      </span>
                      <button onClick={() => handleEdit(character)}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>

                {(editingCharacter || isAddingCharacter) && formData && (
                  <div className="edit-modal">
                    <div className="edit-modal__content">
                      <h3>
                        {isAddingCharacter
                          ? "Add Character"
                          : `Edit ${editingCharacter?.name}`}
                      </h3>
                      <div className="edit-modal__field">
                        <label>Name:</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleFormChange("name", e.target.value)
                          }
                          disabled={!isAddingCharacter}
                        />
                      </div>
                      <div className="edit-modal__field">
                        <label>Location:</label>
                        <select
                          value={formData.location}
                          onChange={(e) =>
                            handleFormChange("location", e.target.value)
                          }
                        >
                          <option value="">Select a location...</option>
                          {locations.map((loc) => (
                            <option key={loc.name} value={loc.name}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="edit-modal__field">
                        <label>Special Skills:</label>
                        <input
                          type="text"
                          value={formData.specialSkills}
                          onChange={(e) =>
                            handleFormChange("specialSkills", e.target.value)
                          }
                        />
                      </div>
                      <div className="edit-modal__field">
                        <label>Group:</label>
                        {formData.group === "__new__" ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input
                              type="text"
                              placeholder="New group name..."
                              autoFocus
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  (e.target as HTMLInputElement).value.trim()
                                ) {
                                  handleFormChange(
                                    "group",
                                    (e.target as HTMLInputElement).value.trim(),
                                  );
                                }
                                if (e.key === "Escape") {
                                  handleFormChange("group", "");
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  handleFormChange(
                                    "group",
                                    e.target.value.trim(),
                                  );
                                } else {
                                  handleFormChange("group", "");
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <select
                            value={formData.group || ""}
                            onChange={(e) =>
                              handleFormChange("group", e.target.value)
                            }
                          >
                            <option value="">None</option>
                            {allGroups.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                            <option value="__new__">+ Add new group...</option>
                          </select>
                        )}
                      </div>
                      <div className="edit-modal__field">
                        <label>Gender:</label>
                        <select
                          value={formData.gender || "Male"}
                          onChange={(e) =>
                            handleFormChange("gender", e.target.value)
                          }
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div
                        className="edit-modal__field"
                        style={{ display: "flex", gap: "30px" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "13px",
                              marginBottom: "8px",
                              fontWeight: "bold",
                            }}
                          >
                            Hair Color:
                          </label>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              maxWidth: "160px",
                            }}
                          >
                            {[
                              "#FFA012",
                              "#FF6600",
                              "#201108",
                              "#1e1e20",
                              "#BFBFBF",
                            ].map((color) => (
                              <div
                                key={color}
                                onClick={() =>
                                  handleFormChange("hairColor", color)
                                }
                                style={{
                                  width: "26px",
                                  height: "26px",
                                  borderRadius: "50%",
                                  backgroundColor: color,
                                  cursor: "pointer",
                                  border:
                                    (formData.hairColor || "").toUpperCase() ===
                                    color.toUpperCase()
                                      ? "2px solid #007bff"
                                      : "2px solid transparent",
                                  boxShadow:
                                    (formData.hairColor || "").toUpperCase() ===
                                    color.toUpperCase()
                                      ? "0 0 6px rgba(0,123,255,0.6)"
                                      : "0 2px 4px rgba(0,0,0,0.3)",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        {(formData.gender === "Male" || !formData.gender) && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <label
                              style={{
                                fontSize: "13px",
                                marginBottom: "8px",
                                fontWeight: "bold",
                              }}
                            >
                              Beard Color:
                            </label>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                maxWidth: "160px",
                              }}
                            >
                              {[
                                "#FFA012",
                                "#FF6600",
                                "#201108",
                                "#1e1e20",
                                "#BFBFBF",
                              ].map((color) => (
                                <div
                                  key={color}
                                  onClick={() =>
                                    handleFormChange("beardColor", color)
                                  }
                                  style={{
                                    width: "26px",
                                    height: "26px",
                                    borderRadius: "50%",
                                    backgroundColor: color,
                                    cursor: "pointer",
                                    border:
                                      (
                                        formData.beardColor || ""
                                      ).toUpperCase() === color.toUpperCase()
                                        ? "2px solid #007bff"
                                        : "2px solid transparent",
                                    boxShadow:
                                      (
                                        formData.beardColor || ""
                                      ).toUpperCase() === color.toUpperCase()
                                        ? "0 0 6px rgba(0,123,255,0.6)"
                                        : "0 2px 4px rgba(0,0,0,0.3)",
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="edit-modal__actions">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentSpread === 2 && (
              <div className="character-management">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ margin: 0 }}>Manage Locations</h2>
                  <button
                    onClick={handleAddLocation}
                    style={{
                      height: "fit-content",
                      padding: "8px 16px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Add Location
                  </button>
                </div>
                <div className="character-list">
                  {locations.map((location) => (
                    <div key={location.name} className="character-item">
                      <span className="character-item__name">
                        {location.name}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          minWidth: "120px",
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: location.color,
                          }}
                        ></div>
                        <span
                          className="character-item__location"
                          style={{ minWidth: "auto" }}
                        >
                          {location.color}
                        </span>
                      </div>
                      <button onClick={() => handleEditLocation(location)}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.name)}
                        style={{ background: "#dc3545" }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                {(editingLocation || isAddingLocation) && locationFormData && (
                  <div className="edit-modal">
                    <div className="edit-modal__content">
                      <h3>
                        {isAddingLocation
                          ? "Add Location"
                          : `Edit ${editingLocation?.name}`}
                      </h3>
                      <div className="edit-modal__field">
                        <label>Name:</label>
                        <input
                          type="text"
                          value={locationFormData.name}
                          onChange={(e) =>
                            handleLocationFormChange("name", e.target.value)
                          }
                        />
                      </div>
                      <div className="edit-modal__field">
                        <label>Color:</label>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "5px",
                          }}
                        >
                          {[
                            "#43A047",
                            "#2E7D32",
                            "#689F38",
                            "#D9D9D9",
                            "#292A2B",
                          ].map((color) => (
                            <div
                              key={color}
                              onClick={() =>
                                handleLocationFormChange("color", color)
                              }
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor: color,
                                cursor: "pointer",
                                border:
                                  locationFormData.color.toUpperCase() ===
                                  color.toUpperCase()
                                    ? "3px solid #007bff"
                                    : "2px solid transparent",
                                boxShadow:
                                  locationFormData.color.toUpperCase() ===
                                  color.toUpperCase()
                                    ? "0 0 5px rgba(0,123,255,0.5)"
                                    : "0 2px 4px rgba(0,0,0,0.2)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="edit-modal__actions">
                        <button onClick={handleSaveLocation}>Save</button>
                        <button onClick={handleCancelLocation}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {currentSpread > 0 && (
            <button
              className="book-nav-button prev-button"
              onClick={() => setCurrentSpread((s) => s - 1)}
            >
              ← Previous Page
            </button>
          )}
        </div>

        {/* Book Spine / Binding */}
        <div className="book-spine">
          <div className="book-spine-crease"></div>
        </div>

        {/* Right Page */}
        <div className="book-page book-page-right">
          <div className="page-content">
            {currentSpread === 0 && (
              <div className="contents-page">
                <h2>Characters & Groups</h2>
                {allGroups.length > 0 && (
                  <>
                    {allGroups.map((groupName) => {
                      const members = characters.filter(
                        (c) => c.group === groupName,
                      );
                      if (members.length === 0) return null;
                      return (
                        <div key={groupName} className="group-section">
                          <h3 className="group-section-title">{groupName}</h3>
                          <div
                            className="contents-list"
                            style={{ marginTop: "10px" }}
                          >
                            {members.map((c) => (
                              <div key={c.name} className="contents-item">
                                <span className="contents-name">{c.name}</span>
                                <span className="contents-dots"></span>
                                <span className="contents-details">
                                  {c.location || "Unknown"} —{" "}
                                  {c.specialSkills || "None"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                {(() => {
                  const ungrouped = characters.filter((c) => !c.group);
                  if (ungrouped.length === 0) return null;
                  return (
                    <div className="group-section">
                      <h3 className="group-section-title">Ungrouped</h3>
                      <div
                        className="contents-list"
                        style={{ marginTop: "10px" }}
                      >
                        {ungrouped.map((c) => (
                          <div key={c.name} className="contents-item">
                            <span className="contents-name">{c.name}</span>
                            <span className="contents-dots"></span>
                            <span className="contents-details">
                              {c.location || "Unknown"} —{" "}
                              {c.specialSkills || "None"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {currentSpread === 1 && (
              <div className="character-management">
                <h2>Manage Groups</h2>
                {allGroups.length === 0 ? (
                  <p style={{ color: "#8a7b6b", fontStyle: "italic" }}>
                    No groups yet. Assign characters to a group when editing
                    them.
                  </p>
                ) : (
                  allGroups.map((groupName) => {
                    const members = characters.filter(
                      (c) => c.group === groupName,
                    );
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
                              handleMoveGroupToLocation(
                                groupName,
                                e.target.value,
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
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {currentSpread === 2 && (
              <div className="character-management">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ margin: 0 }}>Manage Relationships</h2>
                  <button
                    onClick={handleAddRelationship}
                    style={{
                      height: "fit-content",
                      padding: "8px 16px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Add Relationship
                  </button>
                </div>
                <div className="character-list">
                  {relationships.map((rel, index) => (
                    <div key={index} className="character-item">
                      <span className="character-item__name">
                        {rel.source} ↔ {rel.target} ({rel.type})
                      </span>
                      <button
                        onClick={() => handleDeleteRelationship(index)}
                        style={{ background: "#dc3545" }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                {isAddingRelationship && relationshipFormData && (
                  <div className="edit-modal">
                    <div className="edit-modal__content">
                      <h3>Add Relationship</h3>
                      <div className="edit-modal__field">
                        <label>Source Character:</label>
                        <select
                          value={relationshipFormData.source}
                          onChange={(e) =>
                            handleRelationshipFormChange(
                              "source",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select...</option>
                          {characters.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="edit-modal__field">
                        <label>Target Character:</label>
                        <select
                          value={relationshipFormData.target}
                          onChange={(e) =>
                            handleRelationshipFormChange(
                              "target",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select...</option>
                          {characters.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="edit-modal__field">
                        <label>Relationship Type:</label>
                        <select
                          value={relationshipFormData.type}
                          onChange={(e) =>
                            handleRelationshipFormChange(
                              "type",
                              e.target.value as any,
                            )
                          }
                        >
                          <option value="Friendly">Friendly</option>
                          <option value="Enemies">Enemies</option>
                          <option value="Neutral">Neutral</option>
                        </select>
                      </div>
                      <div className="edit-modal__actions">
                        <button onClick={handleSaveRelationship}>Save</button>
                        <button onClick={handleCancelRelationship}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {currentSpread < 2 && (
            <button
              className="book-nav-button next-button"
              onClick={() => setCurrentSpread((s) => s + 1)}
            >
              Next Page →
            </button>
          )}
        </div>
      </div>

      {/* Page Indicator Dots */}
      <div className="page-indicator">
        {[
          { label: "Map", index: 0 },
          { label: "Characters", index: 1 },
          { label: "World", index: 2 },
        ].map((page) => (
          <div
            key={page.index}
            className="page-dot-wrapper"
            onClick={() => setCurrentSpread(page.index)}
          >
            <div
              className={`page-dot ${
                currentSpread === page.index ? "active" : ""
              }`}
            />
            <span className="page-dot-label">{page.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
