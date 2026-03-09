import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyThemeMode, getStoredThemeMode } from "./lib/theme";

applyThemeMode(getStoredThemeMode());

createRoot(document.getElementById("root")!).render(<App />);
