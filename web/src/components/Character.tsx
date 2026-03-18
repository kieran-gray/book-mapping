import { useState, useEffect } from 'react';

interface CharacterProps {
  name: string;
  location: string;
  specialSkills: string;
  onUpdate?: (character: CharacterData) => void;
}

interface CharacterData {
  name: string;
  location: string;
  specialSkills: string;
}

const getStorageKey = (name: string) => `character_${name}`;

const Character = ({ name, location, specialSkills, onUpdate }: CharacterProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CharacterData>({
    name,
    location,
    specialSkills,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const storageKey = getStorageKey(name);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        setFormData(parsedData);
      } catch (error) {
        console.error('Failed to parse stored character data:', error);
      }
    }
  }, [name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Persist to localStorage
    const storageKey = getStorageKey(name);
    localStorage.setItem(storageKey, JSON.stringify(formData));
    
    onUpdate?.(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ name, location, specialSkills });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="character character--editing">
        <div className="character__field">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="character__field">
          <label htmlFor="location">Location:</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className="character__field">
          <label htmlFor="specialSkills">Special Skills:</label>
          <input
            id="specialSkills"
            name="specialSkills"
            type="text"
            value={formData.specialSkills}
            onChange={handleChange}
          />
        </div>
        <div className="character__actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="character">
      <div className="character__field">
        <span className="character__label">Name:</span>
        <span className="character__value">{formData.name}</span>
      </div>
      <div className="character__field">
        <span className="character__label">Location:</span>
        <span className="character__value">{formData.location}</span>
      </div>
      <div className="character__field">
        <span className="character__label">Special Skills:</span>
        <span className="character__value">{formData.specialSkills}</span>
      </div>
      <button onClick={() => setIsEditing(true)}>Edit</button>
    </div>
  );
};

export default Character;
