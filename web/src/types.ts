export interface Character {
  id: string;
  name: string;
  location: string;
  specialSkills: string;
  gender?: "Male" | "Female";
  hairColor?: string;
  beardColor?: string;
  group?: string;
  travelTo?: string;
  travelProgress?: number;
  characteristics?: string[];
}

export interface LocationConfig {
  name: string;
  color: string;
  description?: string;
  x?: number;
  y?: number;
}

export interface Relationship {
  source: string;
  target: string;
  type: "Friendly" | "Enemies" | "Neutral";
}

export interface Characteristic {
  title: string;
  meaning: string;
}

export interface BookData {
  title: string;
  slug: string;
  mapImage: string | null;
  characters: Character[];
  locations: LocationConfig[];
  relationships: Relationship[];
  characteristics: Characteristic[];
  displayConfig?: BookDisplayConfig;
}

export interface BookDisplayConfig {
  height: number;
  color: string;
  shelf: number;
}

export interface ShelfConfig {
  shelves: number;
}
