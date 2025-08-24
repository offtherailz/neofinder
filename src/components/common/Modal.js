import React, { useEffect } from "react";

function Modal({ open, onClose, children }) {
  useEffect(() => {
    // Chiude la modal con ESC
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="my-modal"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          padding: "2rem",
          borderRadius: 8,
          minWidth: 300,
          minHeight: 100,
          position: "relative",
          boxShadow: "0 0 12px rgba(0,0,0,0.2)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            border: "none",
            background: "none",
            fontSize: "1.6rem",
            cursor: "pointer"
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
export default Modal;
