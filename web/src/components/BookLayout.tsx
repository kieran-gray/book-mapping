import React, { useState, useEffect } from "react";

interface BookLayoutProps {
  title: string;
  currentSpread: number;
  maxSpread: number;
  onPrev: () => void;
  onNext: () => void;
  leftPage: React.ReactNode;
  rightPage: React.ReactNode;
}

export default function BookLayout({
  title,
  currentSpread,
  maxSpread,
  onPrev,
  onNext,
  leftPage,
  rightPage,
}: BookLayoutProps) {
  // Mobile layout detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Synchronize state when currentSpread changes from outside (e.g. PageIndicator dots)
  const [prevSpread, setPrevSpread] = useState(currentSpread);
  const [activePageIndex, setActivePageIndex] = useState(currentSpread * 2);

  if (currentSpread !== prevSpread) {
    setPrevSpread(currentSpread);
    setActivePageIndex(currentSpread * 2);
  }

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      const nextIndex = activePageIndex - 1;
      setActivePageIndex(nextIndex);
      const newSpread = Math.floor(nextIndex / 2);
      if (newSpread < currentSpread) {
        onPrev();
      }
    }
  };

  const handleNextPage = () => {
    if (activePageIndex < maxSpread * 2 + 1) {
      const nextIndex = activePageIndex + 1;
      setActivePageIndex(nextIndex);
      const newSpread = Math.floor(nextIndex / 2);
      if (newSpread > currentSpread) {
        onNext();
      }
    }
  };

  const showPrev = activePageIndex > 0;
  const showNext = activePageIndex < maxSpread * 2 + 1;

  if (isMobile) {
    const isLeftPage = activePageIndex % 2 === 0;
    const activePageContent = isLeftPage ? leftPage : rightPage;
    const pageClass = isLeftPage ? "book-page-left" : "book-page-right";

    return (
      <>
        <h1 className="book-title">{title}</h1>
        <div className="book-container">
          <div className={`book-page ${pageClass}`}>
            <div className="page-content">{activePageContent}</div>
            <div className="book-nav-container">
              {showPrev && (
                <button
                  className="book-nav-button prev-button"
                  onClick={handlePrevPage}
                >
                  ← Previous Page
                </button>
              )}
              {showNext && (
                <button
                  className="book-nav-button next-button"
                  onClick={handleNextPage}
                >
                  Next Page →
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Side-by-Side Book Spread Layout
  const desktopShowPrev = currentSpread > 0;
  const desktopShowNext = currentSpread < maxSpread;

  return (
    <>
      <h1 className="book-title">{title}</h1>
      <div className="book-container">
        {/* Left Page */}
        <div className="book-page book-page-left">
          <div className="page-content">{leftPage}</div>
          <div className="book-nav-container">
            {desktopShowPrev && (
              <button className="book-nav-button prev-button" onClick={onPrev}>
                ← Previous Page
              </button>
            )}
          </div>
        </div>

        {/* Book Spine */}
        <div className="book-spine">
          <div className="book-spine-crease" />
        </div>

        {/* Right Page */}
        <div className="book-page book-page-right">
          <div className="page-content">{rightPage}</div>
          <div className="book-nav-container">
            {desktopShowNext && (
              <button className="book-nav-button next-button" onClick={onNext}>
                Next Page →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
