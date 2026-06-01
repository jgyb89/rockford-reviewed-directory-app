'use client';
import { useState } from "react";
import PropTypes from 'prop-types';
import { deleteUserListing } from "@/lib/actions";

export default function DeleteListingButton({ listingId, className = "btn-delete" }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const executeDelete = async () => {
    setShowConfirmModal(false);
    setIsDeleting(true);
    try {
      await deleteUserListing(listingId);
    } catch (error) {
      console.error("Failed to delete listing", error);
      alert("Failed to delete listing.");
    }
    setIsDeleting(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={isDeleting}
        className={className}
        type="button"
      >
        <span className="material-symbols-outlined">delete</span>
        <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
      </button>

      {showConfirmModal && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-dialog">
            <div className="material-symbols-outlined dashboard-modal-icon dashboard-modal-icon--warning">
              warning
            </div>
            <h3 className="dashboard-modal-title">Delete Listing?</h3>
            <p className="dashboard-modal-text">
              Are you sure you want to permanently delete this listing? This action cannot be undone.
            </p>
            <div className="dashboard-modal-actions">
              <button 
                className="dashboard-modal-btn dashboard-modal-btn--cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className="dashboard-modal-btn dashboard-modal-btn--danger"
                onClick={executeDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

DeleteListingButton.propTypes = {
  listingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  className: PropTypes.string,
};
