import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth data on unauthorized
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await api.post('/auth/reset-password', {
            token,
            new_password: newPassword,
        });
        return response.data;
    },
};

// ============================================
// USER ENDPOINTS
// ============================================

export const userAPI = {
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    getSubordinates: async () => {
        const response = await api.get('/users/subordinates');
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    setManager: async (userId, managerId) => {
        const response = await api.put(`/users/${userId}/manager`, { manager_id: managerId });
        return response.data;
    },

    changePassword: async (userId, newPassword) => {
        const response = await api.put(`/users/${userId}/password`, { new_password: newPassword });
        return response.data;
    },
};

// ============================================
// FEEDBACK ENDPOINTS
// ============================================

export const feedbackAPI = {
    getMyFeedback: async () => {
        const response = await api.get('/feedback/my');
        return response.data;
    },

    getTeamFeedback: async () => {
        const response = await api.get('/feedback/team');
        return response.data;
    },

    getEmployeeFeedback: async (employeeId) => {
        const response = await api.get(`/feedback/employee/${employeeId}`);
        return response.data;
    },

    createFeedback: async (feedbackData) => {
        const response = await api.post('/feedback', feedbackData);
        return response.data;
    },

    exportFeedback: async (fromDate, toDate) => {
        const response = await api.get('/feedback/export', {
            params: { from_date: fromDate, to_date: toDate },
        });
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/config/categories');
        return response.data;
    },

    getUserCategoryStats: async (userId) => {
        const response = await api.get(`/feedback/stats/categories/${userId}`);
        return response.data;
    },
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const adminAPI = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getConfig: async () => {
        const response = await api.get('/config');
        return response.data;
    },
};

export default api;
