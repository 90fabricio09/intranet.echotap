import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Home.css';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const ForgotPassword = () => {
	const navigate = useNavigate();
	const { resetPassword } = useAuth();
	const { showSuccess, showError, showWarning } = useNotification();
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		document.title = 'Recuperar senha - Intranet EchoTap';
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email.trim()) {
			showWarning('Informe seu email');
			return;
		}

		setIsLoading(true);
    try {
        const result = await resetPassword(email);
        if (result.success) {
            showSuccess('Se o email estiver cadastrado, você receberá um link de redefinição.');
            setEmail('');
        } else {
            // Mapeia códigos do Firebase para mensagens amigáveis
            let message = 'Não foi possível enviar o email de redefinição';
            if (result.code === 'auth/invalid-email') {
                message = 'Email inválido';
            } else if (result.code === 'auth/too-many-requests') {
                message = 'Muitas tentativas. Tente novamente mais tarde';
            }
            showError(message);
        }
    } catch (err) {
			console.error(err);
			showError('Erro inesperado. Tente novamente.');
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
					<h1 className="login-title">Recuperar senha</h1>
					<p className="login-subtitle">Digite seu email para receber o link</p>
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
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="seu.email@echotap.com"
							className="form-input"
							required
							autoFocus
						/>
					</div>

					<button 
						type="submit" 
						className={`login-button ${isLoading ? 'loading' : ''}`}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<i className="bi bi-arrow-clockwise loading-icon"></i>
								Enviando...
							</>
						) : (
							<>
								<i className="bi bi-send"></i>
								Enviar link
							</>
						)}
					</button>
				</form>

				<div className="login-footer" style={{ marginTop: 12 }}>
					<p className="footer-text">
						<Link to="/" className="forgot-password">
							<i className="bi bi-arrow-left"></i>
							{' '}Voltar para login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
