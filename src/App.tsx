import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Showcase } from "./components/Showcase";
import Admin from "./components/Admin";

export default function App() {
  return (
    <Router>
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Showcase />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </Router>
  );
}
