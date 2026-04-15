import { createContext, useContext } from "react";
import type { BookActions } from "../hooks/useBookData";

export const BookContext = createContext<BookActions | null>(null);

export function useBook(): BookActions {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error("useBook must be used within a BookProvider");
  return ctx;
}
