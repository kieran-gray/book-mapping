import { BookContext } from "./BookContext";
import type { BookActions } from "../hooks/useBookData";

export function BookProvider({
  value,
  children,
}: {
  value: BookActions;
  children: React.ReactNode;
}) {
  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}
