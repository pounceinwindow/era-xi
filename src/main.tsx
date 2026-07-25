import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { GameProvider } from "./state/GameContext";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <GameProvider><App /></GameProvider>
    </HashRouter>
  </StrictMode>
);
