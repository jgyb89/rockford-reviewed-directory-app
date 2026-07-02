import MobileOptInForm from "@/components/MobileOptInForm";

export const metadata = {
  title: "Mobile Opt-In | Cape Coral Reviewed",
  description: "Sign up for SMS/MMS marketing and account alerts from Cape Coral Reviewed.",
};

export default function MobileOptInPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
      <h1 style={{ marginBottom: "1rem", color: "#333" }}>Sign Up for Cape Coral Reviewed Text Alerts</h1>
      <p style={{ marginBottom: "2rem", color: "#555", lineHeight: "1.6", fontSize: "1.1rem" }}>
        Stay up-to-date with the latest local news, deals, and exclusive account alerts by opting into our mobile program. Please provide your information below to subscribe.
      </p>
      
      <div style={{ textAlign: "left" }}>
        <MobileOptInForm />
      </div>
    </div>
  );
}
