import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initApiConfig } from "./services/api";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

async function bootstrap() {
  await initApiConfig();
  createRoot(rootElement).render(<App />);
}

void bootstrap();
