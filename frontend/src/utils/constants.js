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
    [FEEDBACK_TYPES.RED]: 'Oficial',
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
// Calculate feedback statistics
export const calculateFeedbackStats = (feedbackList) => {
    if (!feedbackList || feedbackList.length === 0) {
        return {
            red: 0,
            redManager: 0,
            redPeer: 0,
            black: 0,
            total: 0,
            totalOfficial: 0,
            percentageRed: 0,
            rating: 'Nu există date',
        };
    }

    const redManager = feedbackList.filter(f => f.point_type === FEEDBACK_TYPES.RED && f.is_manager_feedback).length;
    const redPeer = feedbackList.filter(f => f.point_type === FEEDBACK_TYPES.RED && !f.is_manager_feedback).length;
    const black = feedbackList.filter(f => f.point_type === FEEDBACK_TYPES.BLACK).length;

    // Official stats for rating calculations (ignores peer kudos)
    const totalOfficial = redManager + black;

    // If no official feedback (even if there are kudos), return "No Data" for rating
    const percentageRed = totalOfficial > 0 ? Math.round((redManager / totalOfficial) * 1000) / 10 : 0;
    const rating = totalOfficial > 0 ? calculateRating(percentageRed) : 'Nu există date';

    return {
        red: redManager + redPeer, // Total red
        redManager,
        redPeer,
        black,
        total: redManager + redPeer + black,
        totalOfficial,
        percentageRed,
        rating
    };
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

    // Check if the date string already has timezone info.
    // If it's a simple ISO string like '2023-12-30T10:00:00' coming from a DB that stores in UTC but doesn't append 'Z',
    // we might need to force it to be treated as UTC. 
    // However, usually API sends 'Z' or DB strings are parsed as local by default in some browsers if 'Z' is missing.
    // Best practice: Ensure backend sends ISO 8601 with Z. 
    // If we assume backend sends UTC (which it should), we can try to append 'Z' if missing to force UTC interpretation before conversion.

    // But for now, let's rely on standard toLocaleString which converts to system local time.
    // If the input dateString is "2023...Z", new Date() creates a date object in UTC.
    // .toLocaleString() then prints it in the browser's local time.

    return date.toLocaleString('ro-RO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
// Period Selection Options
export const PERIOD_OPTIONS = [
    { label: 'Tot istoricul', value: 'all' },
    { label: 'An curent (YTD)', value: 'ytd' },
    { label: 'Ultimul an (1Y)', value: '1y' },
    { label: 'Ultimele 6 luni', value: '6m' },
    { label: 'Ultimele 3 luni', value: '3m' },
    { label: 'Ultima lună', value: '1m' },
];

// Calculate 'since' date based on period value
export const getSinceDate = (periodValue) => {
    if (!periodValue || periodValue === 'all') return null;

    const now = new Date();
    const date = new Date();

    switch (periodValue) {
        case 'ytd':
            date.setMonth(0, 1);
            date.setHours(0, 0, 0, 0);
            break;
        case '1y':
            date.setFullYear(now.getFullYear() - 1);
            break;
        case '6m':
            date.setMonth(now.getMonth() - 6);
            break;
        case '3m':
            date.setMonth(now.getMonth() - 3);
            break;
        case '1m':
            date.setMonth(now.getMonth() - 1);
            break;
        default:
            return null;
    }
    return date.toISOString();
};
