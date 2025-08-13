import React, { useState } from 'react';
import '../css/CardCreatedModal.css';

const CardCreatedModal = ({ isOpen, onClose, cardCode, cardLink }) => {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    if (!isOpen) return null;

    // Remove https:// ou http:// do link
    const cleanLink = cardLink ? cardLink.replace(/^https?:\/\//, '') : '';

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'code') {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } else {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            }
        } catch (error) {
            console.error('Erro ao copiar:', error);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-icon success">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 className="modal-title">Cartão Criado com Sucesso!</h2>
                    <button 
                        onClick={onClose}
                        className="modal-close"
                        aria-label="Fechar modal"
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-description">
                        O cartão foi criado e está pronto para ser configurado pelo cliente.
                    </p>

                    <div className="card-info-section">
                        <div className="info-item">
                            <label className="info-label">
                                <i className="bi bi-qr-code"></i>
                                Código do Cartão
                            </label>
                            <div className="info-value-container">
                                <span className="info-value code">{cardCode}</span>
                                <button
                                    onClick={() => copyToClipboard(cardCode, 'code')}
                                    className={`copy-button ${copiedCode ? 'copied' : ''}`}
                                    title="Copiar código"
                                >
                                    <i className={`bi ${copiedCode ? 'bi-check' : 'bi-copy'}`}></i>
                                    {copiedCode ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>

                        <div className="info-item">
                            <label className="info-label">
                                <i className="bi bi-link-45deg"></i>
                                Link do Cartão
                            </label>
                            <div className="info-value-container">
                                <span className="info-value link">{cleanLink}</span>
                                <button
                                    onClick={() => copyToClipboard(cleanLink, 'link')}
                                    className={`copy-button ${copiedLink ? 'copied' : ''}`}
                                    title="Copiar link"
                                >
                                    <i className={`bi ${copiedLink ? 'bi-check' : 'bi-copy'}`}></i>
                                    {copiedLink ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-instructions">
                        <h4>
                            <i className="bi bi-info-circle"></i>
                            Próximos Passos
                        </h4>
                        <ul>
                            <li>Envie o <strong>código</strong> ou <strong>link</strong> para o cliente</li>
                            <li>O cliente pode acessar o link para configurar o cartão</li>
                            <li>Após a configuração, o cartão estará ativo e funcional</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        onClick={onClose}
                        className="modal-button primary"
                    >
                        <i className="bi bi-check"></i>
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardCreatedModal;
