import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import "./styles/accessibility.css";
import App from "./App.tsx";

const clerkPublishableKey =
  "pk_test_Y2FyaW5nLXdhc3AtNDkuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!clerkPublishableKey) {
  throw new Error(
    "Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in the frontend env.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
