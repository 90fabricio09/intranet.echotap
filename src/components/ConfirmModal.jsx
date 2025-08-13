import React from 'react';
import '../css/ConfirmModal.css';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar',
    type = 'danger' // 'danger', 'warning', 'info'
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return 'bi-exclamation-triangle-fill';
            case 'warning':
                return 'bi-exclamation-circle-fill';
            case 'info':
                return 'bi-info-circle-fill';
            default:
                return 'bi-question-circle-fill';
        }
    };

    return (
        <div className="confirm-modal-backdrop" onClick={handleBackdropClick}>
            <div className="confirm-modal-content">
                <div className="confirm-modal-header">
                    <div className={`confirm-modal-icon ${type}`}>
                        <i className={`bi ${getIcon()}`}></i>
                    </div>
                    <h3 className="confirm-modal-title">{title}</h3>
                </div>

                <div className="confirm-modal-body">
                    <p className="confirm-modal-message">{message}</p>
                </div>

                <div className="confirm-modal-footer">
                    <button 
                        onClick={onClose}
                        className="confirm-modal-button secondary"
                    >
                        <i className="bi bi-x"></i>
                        {cancelText}
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className={`confirm-modal-button primary ${type}`}
                    >
                        <i className="bi bi-check"></i>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
