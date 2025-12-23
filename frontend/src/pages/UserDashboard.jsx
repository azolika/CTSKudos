import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { feedbackAPI } from '../services/api';
import Layout from '../components/Layout';
import FeedbackStats from '../components/FeedbackStats';
import FeedbackHistory from '../components/FeedbackHistory';
import { calculateFeedbackStats } from '../utils/constants';
import { AlertCircle } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useAuth();
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        try {
            setLoading(true);
            const data = await feedbackAPI.getMyFeedback();
            setFeedback(data);
            setError('');
        } catch (err) {
            console.error('Failed to load feedback:', err);
            setError('Nu s-au putut încărca datele. Vă rugăm încercați din nou.');
        } finally {
            setLoading(false);
        }
    };

    const stats = calculateFeedbackStats(feedback);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">Se încarcă...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="fade-in">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Bun venit, {user?.name}!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Aici poți vedea feedback-ul primit de la managerii tăi.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            <button
                                onClick={loadFeedback}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline mt-2"
                            >
                                Încearcă din nou
                            </button>
                        </div>
                    </div>
                )}

                {/* Feedback Statistics */}
                <FeedbackStats stats={stats} title="📊 Rezultate personale" />

                {/* Feedback History */}
                <FeedbackHistory feedbackList={feedback} />
            </div>
        </Layout>
    );
};

export default UserDashboard;
