import type { CSSProperties } from "react";
import Link from "next/link";

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4rem 1.5rem",
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  textAlign: "center",
};

const panelStyle: CSSProperties = {
  maxWidth: "48rem",
  width: "100%",
  borderRadius: "28px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.04)",
  padding: "2.5rem",
};

const linkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.9rem 2.2rem",
  borderRadius: "999px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "0.75rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

export default function Custom500() {
  return (
    <main style={containerStyle}>
      <div style={panelStyle}>
        <p style={{ color: "#f2c94c", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Server error
        </p>
        <h1 style={{ margin: "1rem 0", fontSize: "2.25rem", letterSpacing: "0.2em" }}>
          We&apos;ll be back soon
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
          The site hit an unexpected error. Please try again later or return home.
        </p>
        <Link href="/" style={linkStyle}>
          Return Home
        </Link>
      </div>
    </main>
  );
}
