import { useState, useEffect } from 'react';
import CharacterAvatar from './CharacterAvatar';

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
  gender: 'Male' | 'Female';
  hairColor: string;
  beardColor: string;
}

const getStorageKey = (name: string) => `character_${name}`;

const Character = ({ name, location, specialSkills, onUpdate }: CharacterProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CharacterData>({
    name,
    location,
    specialSkills,
    gender: 'Male',
    hairColor: '#d4a373',
    beardColor: '#d4a373',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    // If we cancel, we ideally restore from props/storage, backing off with defaults:
    setFormData({ name, location, specialSkills, gender: 'Male', hairColor: '#d4a373', beardColor: '#d4a373' });
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
        <div className="character__field" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
          <label>Avatar Customization:</label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <CharacterAvatar gender={formData.gender} hairColor={formData.hairColor} beardColor={formData.beardColor} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '4px' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Hair Color:</label>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '120px' }}>
                  {['#FFA012', '#FF6600', '#201108', '#1e1e20', '#BFBFBF'].map(color => (
                    <div
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, hairColor: color }))}
                      style={{
                        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color, cursor: 'pointer',
                        border: (formData.hairColor || '').toUpperCase() === color.toUpperCase() ? '2px solid #007bff' : '2px solid transparent',
                        boxShadow: (formData.hairColor || '').toUpperCase() === color.toUpperCase() ? '0 0 4px rgba(0,123,255,0.6)' : '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    />
                  ))}
                </div>
              </div>
              {formData.gender === 'Male' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Beard Color:</label>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '120px' }}>
                    {['#FFA012', '#FF6600', '#201108', '#1e1e20', '#BFBFBF'].map(color => (
                      <div
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, beardColor: color }))}
                        style={{
                          width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color, cursor: 'pointer',
                          border: (formData.beardColor || '').toUpperCase() === color.toUpperCase() ? '2px solid #007bff' : '2px solid transparent',
                          boxShadow: (formData.beardColor || '').toUpperCase() === color.toUpperCase() ? '0 0 4px rgba(0,123,255,0.6)' : '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="character__actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="character" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <CharacterAvatar 
        gender={formData.gender} 
        hairColor={formData.hairColor} 
        beardColor={formData.beardColor} 
      />
      <div style={{ flex: 1 }}>
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
    </div>
  );
};

export default Character;
