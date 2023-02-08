import React, { useCallback } from "react";
import { Modal } from "react-bootstrap";
import "./ConfirmModal.scss";

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  error?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
  onHide: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  confirmLabel,
  cancelLabel,
  icon,
  onConfirm,
  onCancel,
  onHide,
  error,
  ...props
}) => {
  const cancelBtnLabel = cancelLabel || "Cancel";
  const confirmBtnLabel = confirmLabel || "Confirm";

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  return (
    <Modal show onHide={onHide} className="confirm-modal" centered {...props}>
      <div className="modal-container">
        <div>
          <h4 className="title">{title}</h4>
          <p className="description">{description}</p>
        </div>

        {error && <div className="error">{error}</div>}
        <div className="footer-container">
          <button
            className="cancel-btn"
            onClick={() => {
              onCancel && onCancel();
              onHide();
            }}
          >
            {cancelBtnLabel}
          </button>

          <button className="btn btn-primary" onClick={handleConfirm}>
            {confirmBtnLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
