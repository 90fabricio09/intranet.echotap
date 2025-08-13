import React, { useState, useEffect } from 'react';
import '../css/Notification.css';

const Notification = ({ message, type = 'info', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'bi-check-circle-fill';
            case 'error':
                return 'bi-exclamation-circle-fill';
            case 'warning':
                return 'bi-exclamation-triangle-fill';
            default:
                return 'bi-info-circle-fill';
        }
    };

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose && onClose();
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <div className={`notification ${type} ${isLeaving ? 'leaving' : ''}`}>
            <div className="notification-content">
                <i className={`bi ${getIcon()} notification-icon`}></i>
                <span className="notification-message">{message}</span>
                <button 
                    onClick={handleClose}
                    className="notification-close"
                    aria-label="Fechar notificação"
                >
                    <i className="bi bi-x"></i>
                </button>
            </div>
        </div>
    );
};

export default Notification;
