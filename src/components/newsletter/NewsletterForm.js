"use client";

import { useState } from "react";
import { submitNewsletterForm } from "@/lib/actions";

export default function NewsletterForm() {
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.target);
    const result = await submitNewsletterForm(formData);

    if (result.success) {
      setStatus("success");
      e.target.reset();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", width: "100%" }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {status === "success" ? (
          <div style={{ padding: "1rem", backgroundColor: "#e6fffa", color: "#234e52", borderRadius: "8px", border: "1px solid #b2f5ea" }}>
            <p style={{ margin: 0, fontWeight: "600" }}>Thanks for subscribing! Keep an eye on your inbox.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", width: "100%", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" }}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                disabled={status === "loading"}
                required
                style={{
                  flex: 1,
                  padding: "1rem 1.25rem",
                  border: "1px solid #e2e8f0",
                  borderRight: "none",
                  borderRadius: "8px 0 0 8px",
                  fontSize: "1rem",
                  outline: "none",
                  width: "100%"
                }}
              />
              <button 
                type="submit" 
                disabled={status === "loading"} 
                style={{
                  padding: "1rem 1.5rem",
                  backgroundColor: "#e94f37", // brand red
                  color: "#fff",
                  border: "none",
                  borderRadius: "0 8px 8px 0",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => { if (status !== "loading") e.target.style.backgroundColor = "#c93d28"; }}
                onMouseLeave={(e) => { if (status !== "loading") e.target.style.backgroundColor = "#e94f37"; }}
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </div>
            {status === "error" && (
              <p style={{ color: "#e04c4c", fontSize: "0.875rem", margin: 0, textAlign: "left" }}>{errorMessage}</p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
