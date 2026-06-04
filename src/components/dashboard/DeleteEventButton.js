'use client';

import { useState } from "react";
import PropTypes from 'prop-types';
import { deleteEventMutation } from "@/lib/graphql/events";

export default function DeleteEventButton({ eventId, className = "btn-delete" }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const executeDelete = async () => {
    setShowConfirmModal(false);
    setIsDeleting(true);
    try {
      const result = await deleteEventMutation(eventId);
      if (!result.success) {
        alert("Failed to delete event: " + result.message);
      }
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event.");
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
        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem', fontWeight: 600 }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
        <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
      </button>

      {showConfirmModal && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-dialog">
            <div className="material-symbols-outlined dashboard-modal-icon dashboard-modal-icon--warning">
              warning
            </div>
            <h3 className="dashboard-modal-title">Delete Event?</h3>
            <p className="dashboard-modal-text">
              Are you sure you want to permanently delete this event? This action cannot be undone.
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

DeleteEventButton.propTypes = {
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  className: PropTypes.string,
};
