import React from "react";

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
  return (
    <>
      <h1 className="book-title">{title}</h1>
      <div className="book-container">
        {/* Left Page */}
        <div className="book-page book-page-left">
          <div className="page-content">{leftPage}</div>
          {currentSpread > 0 && (
            <div className="book-nav-container">
              <button className="book-nav-button prev-button" onClick={onPrev}>
                ← Previous Page
              </button>
            </div>
          )}
        </div>

        {/* Book Spine */}
        <div className="book-spine">
          <div className="book-spine-crease" />
        </div>

        {/* Right Page */}
        <div className="book-page book-page-right">
          <div className="page-content">{rightPage}</div>
          {currentSpread < maxSpread && (
            <div className="book-nav-container">
              <button className="book-nav-button next-button" onClick={onNext}>
                Next Page →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
