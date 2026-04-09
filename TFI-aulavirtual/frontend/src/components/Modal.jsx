import React from "react";
import "../CSS/modal.css";

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
