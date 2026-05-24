import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { useStore } from "./store";

const STORAGE_KEY = "zafirus-rh-session";

// Hydrate persisted cases before first render so candidate links survive page reloads.
// Only cases + selectedCaseId are serialized — actions and transient state are not.
try {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    const { cases, selectedCaseId } = JSON.parse(raw);
    if (Array.isArray(cases) && cases.length > 0) {
      useStore.setState({ cases, selectedCaseId: selectedCaseId ?? null });
    }
  }
} catch {
  // ignore malformed storage
}

useStore.subscribe((state) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cases: state.cases, selectedCaseId: state.selectedCaseId })
    );
  } catch {
    // ignore quota errors
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
