import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";

function restoreGitHubPagesPath() {
  if (typeof window === "undefined") return;

  const { location, history } = window;
  if (!location.search.startsWith("?/")) return;

  const decoded = location.search
    .slice(2)
    .replace(/~and~/g, "&")
    .replace(/~q~/g, "?");

  const nextUrl = `${location.pathname.slice(0, -1) || ""}/${decoded}${location.hash}`;
  history.replaceState(null, "", nextUrl);
}

restoreGitHubPagesPath();

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
