import { useState } from "react";
import { useBookData } from "../hooks/useBookData";
import { BookProvider } from "../context/BookContext";
import BookLayout from "../components/BookLayout";
import PageIndicator from "../components/PageIndicator";
import WorldMap from "../components/WorldMap";
import CharacterSummary from "../components/CharacterSummary";
import CharacterManager from "../components/CharacterManager";
import GroupManager from "../components/GroupManager";
import LocationManager from "../components/LocationManager";
import RelationshipManager from "../components/RelationshipManager";
import seedData from "../data/shadow-of-the-gods.json";
import type { BookData } from "../types";
import "./Home.css";

const PAGES = [
  { label: "Map", index: 0 },
  { label: "Characters", index: 1 },
  { label: "World", index: 2 },
];

export default function BookView() {
  const bookActions = useBookData(seedData as BookData);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [addAtLocation, setAddAtLocation] = useState<string | null>(null);

  const handleAddCharacterAtLocation = (locationName: string) => {
    setAddAtLocation(locationName);
    setCurrentSpread(1);
  };

  const leftPages: Record<number, React.ReactNode> = {
    0: <WorldMap onAddCharacterAtLocation={handleAddCharacterAtLocation} />,
    1: (
      <CharacterManager
        addAtLocation={addAtLocation}
        onClearAddAtLocation={() => setAddAtLocation(null)}
      />
    ),
    2: <LocationManager />,
  };

  const rightPages: Record<number, React.ReactNode> = {
    0: <CharacterSummary />,
    1: <GroupManager />,
    2: <RelationshipManager />,
  };

  return (
    <BookProvider value={bookActions}>
      <div className="home book-theme">
        <BookLayout
          title={bookActions.book.title}
          currentSpread={currentSpread}
          maxSpread={2}
          onPrev={() => setCurrentSpread((s) => s - 1)}
          onNext={() => setCurrentSpread((s) => s + 1)}
          leftPage={leftPages[currentSpread]}
          rightPage={rightPages[currentSpread]}
        />
        <PageIndicator
          currentSpread={currentSpread}
          onNavigate={setCurrentSpread}
          pages={PAGES}
        />
      </div>
    </BookProvider>
  );
}
