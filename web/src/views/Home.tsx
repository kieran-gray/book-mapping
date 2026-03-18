import { useState, useEffect, useRef } from 'react';
import Location from '../components/Location';
import './Home.css';

interface Character {
  name: string;
  location: string;
  specialSkills: string;
}

interface LocationConfig {
  name: string;
  color: string;
}

interface Relationship {
  source: string;
  target: string;
  type: 'Friendly' | 'Enemies' | 'Neutral';
}

const Home = () => {
  const [locations, setLocations] = useState<LocationConfig[]>([
    { name: 'OSKUTRED', color: '#FF6B6B' },
    { name: 'DARL', color: '#4ECDC4' },
    { name: 'THE GRIMHOLT', color: '#FFE66D' },
    { name: 'SVELGARTH', color: '#95E1D3' },
    { name: 'FELLUR', color: '#d3e195' },
    { name: 'LIGA', color: '#a2e195' },
  ]);

  const [characters, setCharacters] = useState<Character[]>([
    { name: 'Orka', location: 'OSKUTRED', specialSkills: 'Fighting' },
    { name: 'Varg', location: 'DARL', specialSkills: 'Bloodsworn' },
    { name: 'Elvar', location: 'THE GRIMHOLT', specialSkills: 'Mercenary' },
  ]);

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [formData, setFormData] = useState<Character | null>(null);

  const [editingLocation, setEditingLocation] = useState<LocationConfig | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [locationFormData, setLocationFormData] = useState<LocationConfig | null>(null);

  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [relationshipFormData, setRelationshipFormData] = useState<Relationship | null>(null);
  const [lines, setLines] = useState<{ pathD: string, key: string, type: 'Friendly' | 'Enemies' | 'Neutral' }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [characterOffsets, setCharacterOffsets] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: typeof lines = [];

      const charNodes: Record<string, { name: string, cx: number, cy: number, w: number, h: number }> = {};
      characters.forEach(c => {
        const el = document.getElementById(`character-${c.name.replace(/\\s+/g, '-')}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          charNodes[c.name] = { 
            name: c.name,
            cx: rect.left + rect.width / 2 - containerRect.left, 
            cy: rect.top + rect.height / 2 - containerRect.top, 
            w: rect.width, 
            h: rect.height 
          };
        }
      });

      const distPointToSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
        const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
        if (l2 === 0) return Math.hypot(px - ax, py - ay);
        let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
      };

      relationships.forEach(rel => {
        const sNode = charNodes[rel.source];
        const tNode = charNodes[rel.target];
        if (!sNode || !tNode) return;

        const getBoxIntersection = (cx: number, cy: number, w: number, h: number, tx: number, ty: number) => {
          const dx = tx - cx;
          const dy = ty - cy;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          if (absDx === 0 && absDy === 0) return { x: cx, y: cy };
          const scale = Math.min((w / 2 + 5) / (absDx || 1), (h / 2 + 5) / (absDy || 1));
          return { x: cx + dx * Math.min(1, scale), y: cy + dy * Math.min(1, scale) };
        };

        const p1 = getBoxIntersection(sNode.cx, sNode.cy, sNode.w, sNode.h, tNode.cx, tNode.cy);
        const p2 = getBoxIntersection(tNode.cx, tNode.cy, tNode.w, tNode.h, sNode.cx, sNode.cy);

        const intersectingNodes = Object.values(charNodes).filter(n => {
          if (n.name === rel.source || n.name === rel.target) return false;
          const dist = distPointToSegment(n.cx, n.cy, p1.x, p1.y, p2.x, p2.y);
          return dist < (n.w / 2) + 20; 
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
             const curveMidX = p1.x + dx/2 + nx * (shift / 2);
             const curveMidY = p1.y + dy/2 + ny * (shift / 2);
             
             const conflict = intersectingNodes.some(n => Math.hypot(n.cx - curveMidX, n.cy - curveMidY) < (n.w / 2) + 15);
             if (!conflict) {
                bestShift = shift;
                break;
             }
          }
          
          // Re-calculate p1 and p2 based on the control point so the line still originates correctly from the borders
          const cpX = p1.x + dx/2 + nx * bestShift;
          const cpY = p1.y + dy/2 + ny * bestShift;
          
          const newP1 = getBoxIntersection(sNode.cx, sNode.cy, sNode.w, sNode.h, cpX, cpY);
          const newP2 = getBoxIntersection(tNode.cx, tNode.cy, tNode.w, tNode.h, cpX, cpY);

          pathD = `M ${newP1.x} ${newP1.y} Q ${cpX} ${cpY} ${newP2.x} ${newP2.y}`;
        }

        newLines.push({
          key: `${rel.source}-${rel.target}`,
          type: rel.type,
          pathD
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
    window.addEventListener('resize', updateLines);
    // Observe DOM changes or layout shifts loosely
    const interval = setInterval(updateLines, 1000);
    return () => {
      window.removeEventListener('resize', updateLines);
      clearInterval(interval);
    };
  }, [characters, locations, relationships]);

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({ ...character });
  };

  const handleAddCharacter = () => {
    setIsAddingCharacter(true);
    setFormData({ name: '', location: '', specialSkills: '' });
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
            c.name === editingCharacter.name ? formData : c
          )
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

  const handleAddLocation = () => {
    setIsAddingLocation(true);
    setLocationFormData({ name: '', color: '#000000' });
  };

  const handleLocationFormChange = (field: keyof LocationConfig, value: string) => {
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
              c.location === editingLocation.name ? { ...c, location: locationFormData.name } : c
            )
          );
        }
        setLocations(
          locations.map((loc) =>
            loc.name === editingLocation.name ? locationFormData : loc
          )
        );
      }
      setEditingLocation(null);
      setIsAddingLocation(false);
      setLocationFormData(null);
    }
  };

  const handleDeleteLocation = (locationName: string) => {
    setLocations(locations.filter(loc => loc.name !== locationName));
    setCharacters(
      characters.map((c) =>
        c.location === locationName ? { ...c, location: '' } : c
      )
    );
  };

  const handleCancelLocation = () => {
    setEditingLocation(null);
    setIsAddingLocation(false);
    setLocationFormData(null);
  };

  const handleAddRelationship = () => {
    setIsAddingRelationship(true);
    setRelationshipFormData({ source: '', target: '', type: 'Neutral' });
  };

  const handleRelationshipFormChange = (field: keyof Relationship, value: string) => {
    if (relationshipFormData) {
      setRelationshipFormData({ ...relationshipFormData, [field]: value });
    }
  };

  const handleSaveRelationship = () => {
    if (relationshipFormData && relationshipFormData.source && relationshipFormData.target && relationshipFormData.source !== relationshipFormData.target) {
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

  const groupCharactersByLocation = () => {
    const grouped: { [key: string]: Character[] } = {};
    locations.forEach((loc) => {
      grouped[loc.name] = characters.filter((c) => c.location === loc.name);
    });
    return grouped;
  };

  const charactersByLocation = groupCharactersByLocation();

  return (
    <div className="home">
      <h1>The Shadow of the Gods</h1>

      <div className="locations-container" ref={containerRef} style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          {lines.map(line => {
            const color = line.type === 'Friendly' ? '#28a745' : line.type === 'Enemies' ? '#dc3545' : '#6c757d';
            return <path key={line.key} d={line.pathD} fill="transparent" stroke={color} strokeWidth="2" strokeDasharray="5,5" />;
          })}
        </svg>
        <h2>Character Locations</h2>
        <div className="locations-grid">
          {locations.map((location) => (
            <Location
              key={location.name}
              name={location.name}
              color={location.color}
              characters={charactersByLocation[location.name]}
              characterOffsets={characterOffsets}
            />
          ))}
        </div>
      </div>

      {/* Page break with 100px space - Edit height here to change the space */}
      <div style={{ height: '100px', width: '100%' }}></div>

      <div className="character-management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Manage Characters</h2>
          <button onClick={handleAddCharacter} style={{ height: 'fit-content', padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Character</button>
        </div>
        <div className="character-list">
          {characters.map((character) => (
            <div key={character.name} className="character-item">
              <span className="character-item__name">{character.name}</span>
              <span className="character-item__location">{character.location}</span>
              <button onClick={() => handleEdit(character)}>Edit</button>
            </div>
          ))}
        </div>

        {(editingCharacter || isAddingCharacter) && formData && (
          <div className="edit-modal">
            <div className="edit-modal__content">
              <h3>{isAddingCharacter ? 'Add Character' : `Edit ${editingCharacter?.name}`}</h3>
              <div className="edit-modal__field">
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  disabled={!isAddingCharacter}
                />
              </div>
              <div className="edit-modal__field">
                <label>Location:</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
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
                  onChange={(e) => handleFormChange('specialSkills', e.target.value)}
                />
              </div>
              <div className="edit-modal__actions">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="character-management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Manage Relationships</h2>
          <button onClick={handleAddRelationship} style={{ height: 'fit-content', padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Relationship</button>
        </div>
        <div className="character-list">
          {relationships.map((rel, index) => (
            <div key={index} className="character-item">
              <span className="character-item__name">{rel.source} ↔ {rel.target} ({rel.type})</span>
              <button onClick={() => handleDeleteRelationship(index)} style={{ background: '#dc3545' }}>Delete</button>
            </div>
          ))}
        </div>

        {isAddingRelationship && relationshipFormData && (
          <div className="edit-modal">
            <div className="edit-modal__content">
              <h3>Add Relationship</h3>
              <div className="edit-modal__field">
                <label>Source Character:</label>
                <select value={relationshipFormData.source} onChange={(e) => handleRelationshipFormChange('source', e.target.value)}>
                  <option value="">Select...</option>
                  {characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="edit-modal__field">
                <label>Target Character:</label>
                <select value={relationshipFormData.target} onChange={(e) => handleRelationshipFormChange('target', e.target.value)}>
                  <option value="">Select...</option>
                  {characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="edit-modal__field">
                <label>Relationship Type:</label>
                <select value={relationshipFormData.type} onChange={(e) => handleRelationshipFormChange('type', e.target.value as any)}>
                  <option value="Friendly">Friendly</option>
                  <option value="Enemies">Enemies</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>
              <div className="edit-modal__actions">
                <button onClick={handleSaveRelationship}>Save</button>
                <button onClick={handleCancelRelationship}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="character-management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Manage Locations</h2>
          <button onClick={handleAddLocation} style={{ height: 'fit-content', padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Location</button>
        </div>
        <div className="character-list">
          {locations.map((location) => (
            <div key={location.name} className="character-item">
              <span className="character-item__name">{location.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '120px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: location.color }}></div>
                <span className="character-item__location" style={{ minWidth: 'auto' }}>{location.color}</span>
              </div>
              <button onClick={() => handleEditLocation(location)}>Edit</button>
              <button onClick={() => handleDeleteLocation(location.name)} style={{ background: '#dc3545' }}>Delete</button>
            </div>
          ))}
        </div>

        {(editingLocation || isAddingLocation) && locationFormData && (
          <div className="edit-modal">
            <div className="edit-modal__content">
              <h3>{isAddingLocation ? 'Add Location' : `Edit ${editingLocation?.name}`}</h3>
              <div className="edit-modal__field">
                <label>Name:</label>
                <input
                  type="text"
                  value={locationFormData.name}
                  onChange={(e) => handleLocationFormChange('name', e.target.value)}
                />
              </div>
              <div className="edit-modal__field">
                <label>Color:</label>
                <input
                  type="color"
                  value={locationFormData.color}
                  onChange={(e) => handleLocationFormChange('color', e.target.value)}
                  style={{ height: '40px', padding: '2px', cursor: 'pointer', width: '100%' }}
                />
              </div>
              <div className="edit-modal__actions">
                <button onClick={handleSaveLocation}>Save</button>
                <button onClick={handleCancelLocation}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
