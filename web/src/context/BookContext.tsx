import { createContext, useContext } from "react";
import type { BookActions } from "../hooks/useBookData";

const BookContext = createContext<BookActions | null>(null);

export function BookProvider({
  value,
  children,
}: {
  value: BookActions;
  children: React.ReactNode;
}) {
  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

export function useBook(): BookActions {
  const ctx = useContext(BookContext);
  if (!ctx) {
    throw new Error("useBook must be used within a BookProvider");
  }
  return ctx;
}
