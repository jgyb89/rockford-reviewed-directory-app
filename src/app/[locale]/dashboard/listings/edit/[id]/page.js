import PropTypes from "prop-types";
import { getListingForEdit } from "@/lib/actions";
import EditListingForm from "@/components/dashboard/EditListingForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditListingPage({ params }) {
  const { id, locale } = await params;
  const listing = await getListingForEdit(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="edit-listing-page">
      <Link href={`/dashboard`} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span>{" "}Back to Dashboard
      </Link>
      <div style={{ marginBottom: "2rem" }}>
        <Link 
          href={`/dashboard/listings`} 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            color: "#666", 
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>{" "}
          Back to My Listings
        </Link>
      </div>

      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>
          Edit Listing
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>
          Update your business information below.
        </p>
      </header>

      <EditListingForm initialData={listing} />
    </div>
  );
}

EditListingPage.propTypes = {
  params: PropTypes.object.isRequired,
};
