import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { createCard, getAllCards, deleteCard, resetCardConfig } from '../services/cardService';
import { useNotification } from '../contexts/NotificationContext';
import CardCreatedModal from '../components/CardCreatedModal';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { showSuccess, showError, showWarning } = useNotification();
    const [cards, setCards] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [configFilter, setConfigFilter] = useState('all'); // 'all', 'configured', 'not-configured'
    const [loading, setLoading] = useState(true);
    
    // Estados dos modais
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ code: '', link: '' });
    
    // Estados do modal de confirmação
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'danger'
    });

    // Definir título da página
    useEffect(() => {
        document.title = 'Gerenciador de Cartões - Intranet EchoTap';
    }, []);

    // Função auxiliar para abrir modal de confirmação
    const openConfirmModal = (title, message, onConfirm, type = 'danger') => {
        setConfirmModalData({ title, message, onConfirm, type });
        setShowConfirmModal(true);
    };

    // Carregar cartões do Firebase
    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        setLoading(true);
        try {
            const result = await getAllCards();
            if (result.success) {
                setCards(result.cards);
            } else {
                console.error('Erro ao carregar cartões:', result.error);
                showError('Erro ao carregar cartões: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao carregar cartões:', error);
            showError('Erro ao carregar cartões');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCard = () => {
        openConfirmModal(
            'Criar Novo Cartão',
            'Tem certeza que deseja criar um novo cartão? Isso irá gerar um código único e um link para configuração.',
            async () => {
                setIsCreating(true);
                
                try {
                    const result = await createCard(currentUser.email);
                    
                    if (result.success) {
                        // Recarregar lista de cartões
                        await loadCards();
                        
                        // Gerar link do cartão
                        const cardLink = `config.echotap.com.br/view?code=${result.code}`;
                        
                        // Mostrar modal com código e link
                        setModalData({
                            code: result.code,
                            link: cardLink
                        });
                        setShowModal(true);
                        
                        // Copiar link para clipboard automaticamente
                        try {
                            await navigator.clipboard.writeText(cardLink);
                        } catch (clipboardError) {
                            console.log('Erro ao copiar link:', clipboardError);
                        }
                    } else {
                        showError('Erro ao criar cartão: ' + result.error);
                    }
                } catch (error) {
                    console.error('Erro ao criar cartão:', error);
                    showError('Erro ao criar cartão. Tente novamente.');
                } finally {
                    setIsCreating(false);
                }
            },
            'info'
        );
    };

    const handleDeleteCard = (cardId, cardCode) => {
        openConfirmModal(
            'Excluir Cartão',
            `Tem certeza que deseja excluir o cartão ${cardCode}? Esta ação não pode ser desfeita e o cartão ficará inacessível.`,
            async () => {
                try {
                    const result = await deleteCard(cardId);
                    
                    if (result.success) {
                        // Recarregar lista de cartões
                        await loadCards();
                        showSuccess('Cartão excluído com sucesso!');
                    } else {
                        showError('Erro ao excluir cartão: ' + result.error);
                    }
                } catch (error) {
                    console.error('Erro ao excluir cartão:', error);
                    showError('Erro ao excluir cartão. Tente novamente.');
                }
            },
            'danger'
        );
    };

    const handleResetConfig = (cardId, cardCode) => {
        openConfirmModal(
            'Resetar Configurações',
            `Tem certeza que deseja resetar as configurações do cartão "${cardCode}"? O cartão voltará ao estado "não configurado" e todas as configurações serão perdidas.`,
            async () => {
                try {
                    const result = await resetCardConfig(cardId);
                    
                    if (result.success) {
                        await loadCards();
                        showSuccess('Configurações resetadas com sucesso!');
                    } else {
                        showError('Erro ao resetar configurações: ' + result.error);
                    }
                } catch (error) {
                    console.error('Erro ao resetar configurações:', error);
                    showError('Erro ao resetar configurações. Tente novamente.');
                }
            },
            'warning'
        );
    };

    const handleLogout = () => {
        openConfirmModal(
            'Sair do Sistema',
            'Tem certeza que deseja sair? Você será redirecionado para a tela de login.',
            async () => {
                const result = await logout();
                if (result.success) {
                    navigate('/');
                } else {
                    showError('Erro ao fazer logout: ' + result.error);
                }
            },
            'warning'
        );
    };

    const filteredCards = cards.filter(card => {
        // Filtro de busca por texto
        const matchesSearch = card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (card.owner && card.owner.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filtro de configuração
        const matchesConfig = configFilter === 'all' || 
                            (configFilter === 'configured' && card.configured) ||
                            (configFilter === 'not-configured' && !card.configured);
        
        return matchesSearch && matchesConfig;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        
        // Se for um timestamp do Firebase
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString('pt-BR');
        }
        
        // Se for uma string de data
        if (typeof timestamp === 'string') {
            return new Date(timestamp).toLocaleDateString('pt-BR');
        }
        
        return '-';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-left">
                        <img src={logo} alt="EchoTap Logo" className="dashboard-logo" />
                        <div className="header-info">
                            <h1 className="dashboard-title">Gerenciador de Cartões</h1>
                            <p className="dashboard-subtitle">Intranet EchoTap</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="bi bi-box-arrow-right"></i>
                        Sair
                    </button>
                </div>

                {/* Controles */}
                <div className="dashboard-controls">
                    <div className="search-section">
                        <div className="search-container">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Buscar por código ou proprietário..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="filter-container">
                            <select
                                value={configFilter}
                                onChange={(e) => setConfigFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">Todos os cartões</option>
                                <option value="configured">Configurados</option>
                                <option value="not-configured">Não configurados</option>
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleCreateCard}
                        disabled={isCreating}
                        className={`create-btn ${isCreating ? 'loading' : ''}`}
                    >
                        {isCreating ? (
                            <>
                                <i className="bi bi-arrow-clockwise loading-icon"></i>
                                Criando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-plus-circle"></i>
                                Criar Cartão
                            </>
                        )}
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="bi bi-credit-card"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{cards.length}</span>
                            <span className="stat-label">Total de Cartões</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon configured">
                            <i className="bi bi-gear-fill"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{cards.filter(card => card.configured).length}</span>
                            <span className="stat-label">Configurados</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon not-configured">
                            <i className="bi bi-exclamation-circle"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{cards.filter(card => !card.configured).length}</span>
                            <span className="stat-label">Não Configurados</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon recent">
                            <i className="bi bi-clock"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{cards.filter(card => {
                                if (!card.createdAt) return false;
                                
                                const today = new Date();
                                let cardDate;
                                
                                // Verificar se é um timestamp do Firebase
                                if (card.createdAt.toDate) {
                                    cardDate = card.createdAt.toDate();
                                } else if (card.createdAt.seconds) {
                                    // Se for um objeto timestamp do Firebase
                                    cardDate = new Date(card.createdAt.seconds * 1000);
                                } else {
                                    // Se for uma string ou número
                                    cardDate = new Date(card.createdAt);
                                }
                                
                                // Verificar se foi criado no mês atual
                                const isSameMonth = today.getFullYear() === cardDate.getFullYear() && 
                                                   today.getMonth() === cardDate.getMonth();
                                
                                return isSameMonth;
                            }).length}</span>
                            <span className="stat-label">Criados este Mês</span>
                        </div>
                    </div>
                </div>

                {/* Lista de cartões */}
                <div className="cards-section">
                    <h2 className="section-title">
                        <i className="bi bi-list-ul"></i>
                        Lista de Cartões
                    </h2>

                    {filteredCards.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-inbox"></i>
                            <h3>Nenhum cartão encontrado</h3>
                            <p>
                                {searchTerm 
                                    ? 'Tente ajustar os termos de busca'
                                    : 'Crie seu primeiro cartão para começar'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="cards-list">
                            {filteredCards.map((card) => (
                                <div key={card.id} className="card-item">
                                    <div className="card-main">
                                        <div className="card-code">
                                            <span className="code-label">Código:</span>
                                            <span className="code-value">{card.code}</span>
                                        </div>
                                        <div className="card-status-badges">
                                            <div className="card-status-active">
                                                <i className="bi bi-check-circle"></i>
                                                Ativo
                                            </div>
                                            <div className={`card-status-config ${card.configured ? 'configured' : 'not-configured'}`}>
                                                <i className={`bi ${card.configured ? 'bi-gear-fill' : 'bi-gear'}`}></i>
                                                {card.configured ? 'Configurado' : 'Não Configurado'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="card-details">
                                        <div className="detail-item">
                                            <i className="bi bi-calendar"></i>
                                            <span>Criado: {formatDate(card.createdAt)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <i className="bi bi-clock"></i>
                                            <span>Último uso: {formatDate(card.lastUsed)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <i className="bi bi-person"></i>
                                            <span>Proprietário: {card.owner}</span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        {card.configured && (
                                            <button
                                                onClick={() => handleResetConfig(card.id, card.code)}
                                                className="reset-btn"
                                                title="Resetar configurações"
                                            >
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteCard(card.id, card.code)}
                                            className="delete-btn"
                                            title="Excluir cartão"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Modal de Cartão Criado */}
            <CardCreatedModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                cardCode={modalData.code}
                cardLink={modalData.link}
            />
            
            {/* Modal de Confirmação */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmModalData.onConfirm}
                title={confirmModalData.title}
                message={confirmModalData.message}
                type={confirmModalData.type}
                confirmText={confirmModalData.type === 'info' ? 'Criar' : confirmModalData.type === 'warning' ? (confirmModalData.title === 'Resetar Configurações' ? 'Resetar' : 'Sair') : 'Excluir'}
                cancelText="Cancelar"
            />
        </div>
    );
};

export default Dashboard;
