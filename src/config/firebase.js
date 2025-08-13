import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCeTqAjRFJjFSveIy2MeXsBzqOZtMGqaI4",
  authDomain: "echotap-config.firebaseapp.com",
  projectId: "echotap-config",
  storageBucket: "echotap-config.firebasestorage.app",
  messagingSenderId: "765790026079",
  appId: "1:765790026079:web:b1754ad3b6c78d22cd1eea",
  measurementId: "G-P7NPER13KH"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
