export interface Character {
  name: string;
  location: string;
  specialSkills: string;
  gender?: "Male" | "Female";
  hairColor?: string;
  beardColor?: string;
  group?: string;
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

export interface BookData {
  title: string;
  slug: string;
  mapImage: string | null;
  characters: Character[];
  locations: LocationConfig[];
  relationships: Relationship[];
}
