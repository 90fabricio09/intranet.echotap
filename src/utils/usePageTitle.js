import { useEffect } from 'react';

/**
 * Hook personalizado para definir o título da página
 * @param {string} title - Título da página
 * @param {string} suffix - Sufixo padrão (opcional)
 */
export const usePageTitle = (title, suffix = 'Intranet EchoTap') => {
    useEffect(() => {
        const fullTitle = suffix ? `${title} - ${suffix}` : title;
        document.title = fullTitle;
        
        // Cleanup: restaurar título padrão quando componente desmontar
        return () => {
            document.title = 'Intranet EchoTap';
        };
    }, [title, suffix]);
};

export default usePageTitle;
