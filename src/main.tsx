import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./index.css";
import "./styles/accessibility.css";
import App from "./App.tsx";

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "";

const keyError = !clerkPublishableKey
  ? "Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in your frontend environment."
  : !clerkPublishableKey.startsWith("pk_")
    ? "Invalid Clerk publishable key format. VITE_CLERK_PUBLISHABLE_KEY must start with pk_."
    : null;

const root = createRoot(document.getElementById("root")!);

if (keyError) {
  root.render(
    <StrictMode>
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <section
          style={{
            width: "min(700px, 100%)",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h1 style={{ margin: "0 0 10px", fontSize: "1.4rem" }}>Configuration Required</h1>
          <p style={{ margin: "0 0 16px", lineHeight: 1.5 }}>{keyError}</p>
          <ol style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.6 }}>
            <li>Create a root .env file from .env.example.</li>
            <li>Set VITE_CLERK_PUBLISHABLE_KEY to your Clerk publishable key (pk_...).</li>
            <li>Restart the frontend dev server.</li>
          </ol>
        </section>
      </main>
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ClerkProvider>
    </StrictMode>,
  );
}
