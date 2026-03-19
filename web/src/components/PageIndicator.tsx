interface PageIndicatorProps {
  currentSpread: number;
  onNavigate: (index: number) => void;
  pages: { label: string; index: number }[];
}

export default function PageIndicator({
  currentSpread,
  onNavigate,
  pages,
}: PageIndicatorProps) {
  return (
    <div className="page-indicator">
      {pages.map((page) => (
        <div
          key={page.index}
          className="page-dot-wrapper"
          onClick={() => onNavigate(page.index)}
        >
          <div
            className={`page-dot ${
              currentSpread === page.index ? "active" : ""
            }`}
          />
          <span className="page-dot-label">{page.label}</span>
        </div>
      ))}
    </div>
  );
}
