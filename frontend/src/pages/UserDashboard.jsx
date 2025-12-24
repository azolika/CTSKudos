import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { feedbackAPI } from '../services/api';
import Layout from '../components/Layout';
import FeedbackStats from '../components/FeedbackStats';
import CategoryStats from '../components/CategoryStats';
import FeedbackHistory from '../components/FeedbackHistory';
import KudosForm from '../components/KudosForm';
import { calculateFeedbackStats, PERIOD_OPTIONS, getSinceDate } from '../utils/constants';
import { AlertCircle } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useAuth();
    const [feedback, setFeedback] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('all');

    useEffect(() => {
        if (user?.id) {
            loadFeedback();
        }
    }, [user?.id, period]);

    const loadFeedback = async () => {
        try {
            setLoading(true);
            const since = getSinceDate(period);
            const [data, catStats] = await Promise.all([
                feedbackAPI.getMyFeedback(since),
                feedbackAPI.getUserCategoryStats(user.id, since)
            ]);
            setFeedback(data);
            setCategoryStats(catStats);
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
                <div className="fade-in flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Bun venit, {user?.name}!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Aici poți vedea feedback-ul primit de la managerul tău.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Perioadă:
                        </label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                        >
                            {PERIOD_OPTIONS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
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

                {/* Send Kudos Section */}
                <div className="fade-in max-w-2xl mx-auto w-full">
                    <KudosForm currentUser={user} onSuccess={loadFeedback} />
                </div>

                {/* Feedback Statistics */}
                <FeedbackStats stats={stats} title="📊 Rezultate personale" />

                {/* Category Statistics */}
                <CategoryStats stats={categoryStats} />

                {/* Feedback History */}
                <FeedbackHistory feedbackList={feedback} />
            </div>
        </Layout>
    );
};

export default UserDashboard;
