import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.jsx";
import "./index.css";

const PUBLISHABLE_KEY =
  "pk_test_ZGFyaW5nLWxvYnN0ZXItMTIuY2xlcmsuYWNjb3VudHMuZGV2JA";

createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    navigate={(to) => (window.location.href = to)}
  >
    <App />
  </ClerkProvider>
);
