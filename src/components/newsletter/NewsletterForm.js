"use client";

import { useState } from "react";
import { submitNewsletterForm } from "@/lib/actions";
import styles from "./NewsletterForm.module.css";

export default function NewsletterForm() {
  const [status, setStatus] = useState("idle");
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
    <div className={styles.formWrapper}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {status === "success" ? (
          <div className={styles.successBox}>
            <p className={styles.successText}>Thanks for subscribing! Keep an eye on your inbox.</p>
          </div>
        ) : (
          <>
            <div className={styles.inputGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className={styles.inputField}
                disabled={status === "loading"}
              />
              <button 
                type="submit" 
                disabled={status === "loading"} 
                className={styles.submitButton}
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </div>
            {status === "error" && (
              <p className={styles.errorText}>{errorMessage}</p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
