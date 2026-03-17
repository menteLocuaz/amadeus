/**
 * Utility functions for formatting and handling dates consistently across the application.
 */

export const formatDate = (dateString?: string | Date | null): string => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return "-";
        
        return new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    } catch (e) {
        return "-";
    }
};

export const formatDateTime = (dateString?: string | Date | null): string => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        
        return new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        return "-";
    }
};
