import { useState, useEffect, useRef, useCallback } from "react";
import { useBook } from "../context/BookContext";
import type { LocationConfig } from "../types";
import MapPin from "./MapPin";
import PinPopup from "./PinPopup";
import CharacterAvatar from "./CharacterAvatar";

interface WorldMapProps {
  onAddCharacterAtLocation: (locationName: string) => void;
}

/* --- EDITABLE TRAVEL LINE SETTINGS --- */
/* Change these values to customise the travel route lines on the map */
const TRAVEL_LINE_COLOR = "#0000006c";   // Line colour (any CSS colour, e.g. "#ff0000", "red")
const TRAVEL_LINE_WIDTH = 1;           // Line width in px (1–5 recommended)

interface LineData {
  key: string;
  type: "Friendly" | "Enemies" | "Neutral";
  pathD: string;
}

export default function WorldMap({ onAddCharacterAtLocation }: WorldMapProps) {
  const {
    book,
    charactersByLocation,
    travelingCharacters,
    travelingGroups,
    updateLocationPosition,
    updateCharacterTravel,
    updateGroupTravelProgress,
    setMapImage,
  } = useBook();

  const { mapImage, locations, characters, relationships } = book;

  const [activePin, setActivePin] = useState<LocationConfig | null>(null);
  const [draggingPin, setDraggingPin] = useState<string | null>(null);
  const [draggingTraveler, setDraggingTraveler] = useState<string | null>(null);
  const [draggingGroup, setDraggingGroup] = useState<string | null>(null);
  const [lines, setLines] = useState<LineData[]>([]);
  const [characterOffsets, setCharacterOffsets] = useState<
    Record<string, { dx: number; dy: number }>
  >({});

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLImageElement>(null);
  const dragHasMoved = useRef(false);

  // --- Pin Drag handling ---
  useEffect(() => {
    if (!draggingPin) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!mapRef.current) return;
      dragHasMoved.current = true;
      const rect = mapRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const clamped = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
      updateLocationPosition(draggingPin, clamped.x, clamped.y);
    };

    const handlePointerUp = () => setDraggingPin(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingPin, updateLocationPosition]);

  // --- Traveler Drag handling (constrain to line) ---
  useEffect(() => {
    if (!draggingTraveler) return;

    const char = characters.find((c) => c.name === draggingTraveler);
    if (!char || !char.travelTo) return;

    const fromLoc = locations.find((l) => l.name === char.location);
    const toLoc = locations.find((l) => l.name === char.travelTo);
    if (!fromLoc || !toLoc || fromLoc.x == null || fromLoc.y == null || toLoc.x == null || toLoc.y == null) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;

      // Project mouse onto the line segment fromLoc -> toLoc
      const ax = fromLoc.x!;
      const ay = fromLoc.y!;
      const bx = toLoc.x!;
      const by = toLoc.y!;
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return;
      let t = ((mx - ax) * dx + (my - ay) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      updateCharacterTravel(draggingTraveler, t);
    };

    const handlePointerUp = () => setDraggingTraveler(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingTraveler, characters, locations, updateCharacterTravel]);

  // --- Group Drag handling (constrain to line) ---
  useEffect(() => {
    if (!draggingGroup) return;

    const group = travelingGroups.find((g) => g.name === draggingGroup);
    if (!group) return;

    const fromLoc = locations.find((l) => l.name === group.location);
    const toLoc = locations.find((l) => l.name === group.travelTo);
    if (!fromLoc || !toLoc || fromLoc.x == null || fromLoc.y == null || toLoc.x == null || toLoc.y == null) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;

      const ax = fromLoc.x!;
      const ay = fromLoc.y!;
      const bx = toLoc.x!;
      const by = toLoc.y!;
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return;
      let t = ((mx - ax) * dx + (my - ay) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      updateGroupTravelProgress(draggingGroup, t);
    };

    const handlePointerUp = () => setDraggingGroup(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingGroup, travelingGroups, locations, updateGroupTravelProgress]);

  // --- Relationship lines ---
  useEffect(() => {
    const updateLines = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const pinNodes: Record<
        string,
        { cx: number; cy: number; w: number; h: number; name: string }
      > = {};

      locations.forEach((loc) => {
        const el = document.getElementById(
          `pin-${loc.name.replace(/\s+/g, "-")}`,
        );
        if (el) {
          const r = el.getBoundingClientRect();
          pinNodes[loc.name] = {
            cx: r.left + r.width / 2 - containerRect.left,
            cy: r.top + r.height / 2 - containerRect.top,
            w: r.width,
            h: r.height,
            name: loc.name,
          };
        }
      });

      const newLines: LineData[] = [];

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
    const interval = setInterval(updateLines, 1000);
    return () => {
      window.removeEventListener("resize", updateLines);
      clearInterval(interval);
    };
  }, [characters, locations, relationships]);

  const handleMapClick = useCallback((_e: React.MouseEvent<HTMLDivElement>) => {
    // Click-to-add-location can be implemented here
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => setMapImage(event.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [setMapImage],
  );

  return (
    <div className="locations-container">
      <h2>World Map</h2>
      {!mapImage ? (
        <div className="map-uploader">
          <p>Upload a map image to start placing locations</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
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
            {/* Relationship lines */}
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
            {/* Travel route lines */}
            {travelingCharacters.map((char) => {
              const fromLoc = locations.find((l) => l.name === char.location);
              const toLoc = locations.find((l) => l.name === char.travelTo);
              if (!fromLoc || !toLoc || fromLoc.x == null || fromLoc.y == null || toLoc.x == null || toLoc.y == null) return null;
              return (
                <line
                  key={`travel-${char.name}`}
                  x1={`${fromLoc.x}%`}
                  y1={`${fromLoc.y}%`}
                  x2={`${toLoc.x}%`}
                  y2={`${toLoc.y}%`}
                  stroke={TRAVEL_LINE_COLOR}
                  strokeWidth={TRAVEL_LINE_WIDTH}
                  opacity="0.8"
                />
              );
            })}
            {/* Group travel route lines */}
            {travelingGroups.map((group) => {
              const fromLoc = locations.find((l) => l.name === group.location);
              const toLoc = locations.find((l) => l.name === group.travelTo);
              if (!fromLoc || !toLoc || fromLoc.x == null || fromLoc.y == null || toLoc.x == null || toLoc.y == null) return null;
              return (
                <line
                  key={`group-travel-${group.name}`}
                  x1={`${fromLoc.x}%`}
                  y1={`${fromLoc.y}%`}
                  x2={`${toLoc.x}%`}
                  y2={`${toLoc.y}%`}
                  stroke={TRAVEL_LINE_COLOR}
                  strokeWidth={TRAVEL_LINE_WIDTH}
                  opacity="0.8"
                />
              );
            })}
          </svg>
          {/* Location pins */}
          {locations.map((loc) => (
            <MapPin
              key={loc.name}
              location={loc}
              characters={charactersByLocation[loc.name] ?? []}
              isDragging={draggingPin === loc.name}
              onPointerDown={(e) => {
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
            />
          ))}
          {/* Traveling character avatars */}
          {travelingCharacters.map((char) => {
            const fromLoc = locations.find((l) => l.name === char.location);
            const toLoc = locations.find((l) => l.name === char.travelTo);
            if (!fromLoc || !toLoc || fromLoc.x == null || fromLoc.y == null || toLoc.x == null || toLoc.y == null) return null;
            const t = char.travelProgress ?? 0;
            const cx = fromLoc.x + (toLoc.x - fromLoc.x) * t;
            const cy = fromLoc.y + (toLoc.y - fromLoc.y) * t;
            return (
              <div
                key={`traveler-${char.name}`}
                className="travel-avatar"
                title={`${char.name} (${char.location} → ${char.travelTo})`}
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  cursor: draggingTraveler === char.name ? "grabbing" : "grab",
                  zIndex: draggingTraveler === char.name ? 45 : 25,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDraggingTraveler(char.name);
                }}
              >
                <CharacterAvatar
                  gender={char.gender || "Male"}
                  hairColor={char.hairColor || "#FFA012"}
                  beardColor={char.beardColor || "#FFA012"}
                />
                <span className="travel-avatar-name">{char.name}</span>
              </div>
            );
          })}
          {/* Traveling group avatars */}
          {travelingGroups.map((group) => {
            const fromLoc = locations.find((l) => l.name === group.location);
            const toLoc = locations.find((l) => l.name === group.travelTo);
            if (!fromLoc || !toLoc || fromLoc.x == null || fromLoc.y == null || toLoc.x == null || toLoc.y == null) return null;
            const t = group.travelProgress;
            const cx = fromLoc.x + (toLoc.x - fromLoc.x) * t;
            const cy = fromLoc.y + (toLoc.y - fromLoc.y) * t;
            return (
              <div
                key={`group-traveler-${group.name}`}
                className="travel-avatar travel-avatar-group"
                title={`${group.name} (${group.location} → ${group.travelTo})`}
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  cursor: draggingGroup === group.name ? "grabbing" : "grab",
                  zIndex: draggingGroup === group.name ? 45 : 25,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDraggingGroup(group.name);
                }}
              >
                <div className="travel-avatar-group-cluster">
                  {group.members.map((m) => (
                    <div key={m.name} className="travel-avatar-group-member">
                      <CharacterAvatar
                        gender={m.gender || "Male"}
                        hairColor={m.hairColor || "#FFA012"}
                        beardColor={m.beardColor || "#FFA012"}
                      />
                    </div>
                  ))}
                </div>
                <span className="travel-avatar-name">{group.name}</span>
              </div>
            );
          })}
        </div>
      )}
      {activePin && (
        <PinPopup
          pin={activePin}
          onClose={() => setActivePin(null)}
          onAddCharacterHere={() => {
            const locName = activePin.name;
            setActivePin(null);
            onAddCharacterAtLocation(locName);
          }}
        />
      )}
    </div>
  );
}
