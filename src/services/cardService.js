import { 
    collection, 
    doc, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    updateDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CARDS_COLLECTION = 'cards';

// Gerar código único para cartão
const generateCardCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Verificar se código já existe
const checkCodeExists = async (code) => {
    try {
        const q = query(collection(db, CARDS_COLLECTION), where('code', '==', code));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Erro ao verificar código:', error);
        return false;
    }
};

// Gerar código único (verificando duplicatas)
const generateUniqueCode = async () => {
    let code;
    let exists = true;
    
    while (exists) {
        code = generateCardCode();
        exists = await checkCodeExists(code);
    }
    
    return code;
};

// Criar novo cartão
export const createCard = async (createdBy) => {
    try {
        const code = await generateUniqueCode();
        
        const cardData = {
            code,
            status: 'active',
            createdAt: serverTimestamp(),
            createdBy,
            lastUsed: null,
            owner: null,
            configured: false,
            // Dados de configuração (inicialmente vazios)
            config: {
                name: '',
                bio: '',
                profilePhoto: '',
                themeColor: '#2563EB',
                links: []
            }
        };

        const docRef = await addDoc(collection(db, CARDS_COLLECTION), cardData);
        
        return {
            success: true,
            cardId: docRef.id,
            code,
            data: cardData
        };
    } catch (error) {
        console.error('Erro ao criar cartão:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Buscar todos os cartões
export const getAllCards = async () => {
    try {
        const q = query(
            collection(db, CARDS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const cards = [];
        
        querySnapshot.forEach((doc) => {
            cards.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            success: true,
            cards
        };
    } catch (error) {
        console.error('Erro ao buscar cartões:', error);
        return {
            success: false,
            error: error.message,
            cards: []
        };
    }
};

// Excluir cartão
export const deleteCard = async (cardId) => {
    try {
        await deleteDoc(doc(db, CARDS_COLLECTION, cardId));
        
        return {
            success: true
        };
    } catch (error) {
        console.error('Erro ao excluir cartão:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Buscar cartão por código
export const getCardByCode = async (code) => {
    try {
        const q = query(
            collection(db, CARDS_COLLECTION), 
            where('code', '==', code.toUpperCase())
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return {
                success: false,
                error: 'Cartão não encontrado'
            };
        }

        const cardDoc = querySnapshot.docs[0];
        const cardData = {
            id: cardDoc.id,
            ...cardDoc.data()
        };

        return {
            success: true,
            card: cardData
        };
    } catch (error) {
        console.error('Erro ao buscar cartão:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Atualizar configuração do cartão
export const updateCardConfig = async (cardId, configData) => {
    try {
        const cardRef = doc(db, CARDS_COLLECTION, cardId);
        
        await updateDoc(cardRef, {
            config: configData,
            configured: true,
            lastUsed: serverTimestamp()
        });

        return {
            success: true
        };
    } catch (error) {
        console.error('Erro ao atualizar configuração:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Atualizar último uso do cartão
export const updateLastUsed = async (cardId) => {
    try {
        const cardRef = doc(db, CARDS_COLLECTION, cardId);
        
        await updateDoc(cardRef, {
            lastUsed: serverTimestamp()
        });

        return {
            success: true
        };
    } catch (error) {
        console.error('Erro ao atualizar último uso:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Resetar configurações do cartão
export const resetCardConfig = async (cardId) => {
    try {
        const cardRef = doc(db, CARDS_COLLECTION, cardId);
        
        await updateDoc(cardRef, {
            configured: false,
            config: {
                name: '',
                bio: '',
                profilePhoto: '',
                themeColor: '#2563EB',
                links: []
            },
            owner: null,
            lastUsed: null
        });

        return {
            success: true
        };
    } catch (error) {
        console.error('Erro ao resetar configurações:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
