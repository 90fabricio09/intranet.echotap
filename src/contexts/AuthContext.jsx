import { createContext, useContext, useEffect, useState } from 'react';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função para login
    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    };

    // Função para logout
    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Erro no logout:', error);
            return { success: false, error: error.message };
        }
    };

    // Função para criar usuário (para funcionários)
    const createEmployee = async (email, password) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            return { success: false, error: error.message };
        }
    };

    // Redefinição de senha
    const resetPassword = async (email) => {
        try {
            // Verifica se o email existe para provider "password"
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (!methods || methods.length === 0 || !methods.includes('password')) {
                return { success: false, code: 'auth/user-not-found', error: 'Usuário não encontrado' };
            }

            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar email de redefinição:', error);
            return { success: false, error: error.message, code: error.code };
        }
    };

    // Verificar se usuário está logado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        createEmployee,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
