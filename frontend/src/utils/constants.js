// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// User Roles
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager/tl',
    USER: 'user',
};

// Feedback Types
export const FEEDBACK_TYPES = {
    RED: 'rosu',
    BLACK: 'negru',
};

// Feedback Type Labels (Romanian)
export const FEEDBACK_LABELS = {
    [FEEDBACK_TYPES.RED]: 'Roșu',
    [FEEDBACK_TYPES.BLACK]: 'Negru',
};

// Rating Thresholds and Labels
export const RATING_THRESHOLDS = {
    EXCELLENT: 75,
    GOOD: 50,
    SATISFACTORY: 25,
};

export const RATING_LABELS = {
    EXCELLENT: 'Excelent',
    GOOD: 'Bun',
    SATISFACTORY: 'Satisfăcător',
    UNSATISFACTORY: 'Nesatisfăcător',
};

// Calculate rating based on percentage
export const calculateRating = (percentageRed) => {
    if (percentageRed >= RATING_THRESHOLDS.EXCELLENT) return RATING_LABELS.EXCELLENT;
    if (percentageRed >= RATING_THRESHOLDS.GOOD) return RATING_LABELS.GOOD;
    if (percentageRed >= RATING_THRESHOLDS.SATISFACTORY) return RATING_LABELS.SATISFACTORY;
    return RATING_LABELS.UNSATISFACTORY;
};

// Calculate feedback statistics
export const calculateFeedbackStats = (feedbackList) => {
    if (!feedbackList || feedbackList.length === 0) {
        return {
            red: 0,
            black: 0,
            total: 0,
            percentageRed: 0,
            rating: 'N/A',
        };
    }

    const red = feedbackList.filter(f => f.point_type === FEEDBACK_TYPES.RED).length;
    const black = feedbackList.filter(f => f.point_type === FEEDBACK_TYPES.BLACK).length;
    const total = red + black;
    const percentageRed = total > 0 ? Math.round((red / total) * 1000) / 10 : 0;
    const rating = calculateRating(percentageRed);

    return { red, black, total, percentageRed, rating };
};

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    USER_DATA: 'user_data',
};

// Format date for display
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
