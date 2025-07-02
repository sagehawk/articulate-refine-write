
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Topics from "./pages/Topics";
import Sentences from "./pages/Sentences";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="essay-theme">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/sentences" element={<Sentences />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
