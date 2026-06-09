import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Point the generated API client at a remote API server when configured;
// otherwise it calls the same origin (relative paths), which is what the
// browser session-cookie flow expects.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
setBaseUrl(apiBaseUrl && apiBaseUrl.trim() ? apiBaseUrl.trim() : null);

createRoot(document.getElementById("root")!).render(<App />);
