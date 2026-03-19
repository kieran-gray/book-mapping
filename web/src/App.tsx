import { Routes, Route } from "react-router-dom";
import BookView from "./views/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookView />} />
    </Routes>
  );
}

export default App;
