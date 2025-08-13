import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Home = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showError, showWarning } = useNotification();

    // Definir título da página
    useEffect(() => {
        document.title = 'Login - Intranet EchoTap';
    }, []);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email.trim() || !formData.password.trim()) {
            showWarning('Por favor, preencha todos os campos');
            return;
        }

        setIsLoading(true);
        
        try {
            const result = await login(formData.email, formData.password);
            
            if (result.success) {
                // Navegar para dashboard após login bem-sucedido
                navigate('/dashboard');
            } else {
                // Mostrar erro específico
                let errorMessage = 'Erro ao fazer login';
                
                if (result.error.includes('user-not-found')) {
                    errorMessage = 'Usuário não encontrado';
                } else if (result.error.includes('wrong-password')) {
                    errorMessage = 'Senha incorreta';
                } else if (result.error.includes('invalid-email')) {
                    errorMessage = 'Email inválido';
                } else if (result.error.includes('too-many-requests')) {
                    errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
                }
                
                showError(errorMessage);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showError('Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-header">
                    <div className="logo-container">
                        <img src={logo} alt="EchoTap Logo" className="login-logo" />
                    </div>
                    <h1 className="login-title">Intranet EchoTap</h1>
                    <p className="login-subtitle">
                        Acesso exclusivo para funcionários
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            <i className="bi bi-envelope"></i>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="seu.email@echotap.com"
                            className="form-input"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            <i className="bi bi-lock"></i>
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Digite sua senha"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" className="checkbox-input" />
                            <span className="checkbox-checkmark"></span>
                            Lembrar de mim
                        </label>
                        <a href="#" className="forgot-password">
                            Esqueci minha senha
                        </a>
                    </div>

                    <button 
                        type="submit" 
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="bi bi-arrow-clockwise loading-icon"></i>
                                Entrando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right"></i>
                                Entrar
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="footer-text">
                        <i className="bi bi-shield-check"></i>
                        Ambiente seguro e protegido
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
