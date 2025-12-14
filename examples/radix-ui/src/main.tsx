import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// biome-ignore lint/style/noNonNullAssertion: The app element is guaranteed to exist.
createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
