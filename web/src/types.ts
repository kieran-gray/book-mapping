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
  isDead?: boolean;
}

export interface LocationConfig {
  name: string;
  color: string;
  description?: string;
  region?: string;
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
  mapType?: "image" | "canvas";
  mapImage: string | null;
  mapRegions?: MapRegion[];
  characters: Character[];
  locations: LocationConfig[];
  relationships: Relationship[];
  characteristics: Characteristic[];
  displayConfig?: BookDisplayConfig;
}

export type BookPose = "auto" | "upright" | "lean" | "flat" | "backward";

export interface BookDisplayConfig {
  height: number;
  color: string;
  shelf: number;
  pose?: BookPose;
  order?: number;
}

export type ShelfObjectKind =
  | "fern"
  | "succulent"
  | "stack"
  | "candle"
  | "clock"
  | "teacup";

export interface ShelfObjectItem {
  id: string;
  kind: ShelfObjectKind;
  shelf: number;
  order: number;
}

export interface ShelfConfig {
  shelves: number;
  objects?: ShelfObjectItem[];
}

export interface MapRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}
