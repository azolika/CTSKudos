import { useState, useEffect } from 'react';
import { feedbackAPI, userAPI, adminAPI } from '../services/api';
import { FEEDBACK_TYPES } from '../utils/constants';
import { Heart, Send, Search, Award, X, Sparkles } from 'lucide-react';

const KudosForm = ({ currentUser, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [badges, setBadges] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedBadge, setSelectedBadge] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingFeedback, setPendingFeedback] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [usersData, configData] = await Promise.all([
                    userAPI.getAllUsers(),
                    adminAPI.getConfig()
                ]);
                // Filter out current user AND administrators from the list
                setUsers(usersData.filter(u => u.id !== currentUser?.id && u.role !== 'admin'));
                setBadges(configData.kudos_badges || []);
            } catch (err) {
                console.error('Failed to load initial data:', err);
            }
        };
        loadInitialData();
    }, [currentUser?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUserId || !selectedBadge) {
            setMessage({ type: 'error', text: 'Vă rugăm să alegeți un coleg și un mesaj.' });
            return;
        }

        const selectedUser = users.find(u => u.id.toString() === selectedUserId.toString());

        setPendingFeedback({
            employee_id: parseInt(selectedUserId),
            point_type: FEEDBACK_TYPES.RED,
            comment: selectedBadge,
            category: "Kudos", // Default category for Kudos
            employee_name: selectedUser?.name || 'Coleg'
        });
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        if (!pendingFeedback) return;

        try {
            setLoading(true);

            // Prepare payload (exclude helper fields like employee_name)
            const payload = {
                employee_id: pendingFeedback.employee_id,
                point_type: pendingFeedback.point_type,
                comment: pendingFeedback.comment,
                category: pendingFeedback.category
            };

            await feedbackAPI.createFeedback(payload);

            setMessage({ type: 'success', text: 'Kudos trimis cu succes!' });
            setSelectedBadge('');
            setSelectedUserId('');
            setShowConfirmModal(false);
            setPendingFeedback(null);

            if (onSuccess) onSuccess();

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Failed to send Kudos:', err);
            setMessage({ type: 'error', text: 'Eroare la trimiterea feedback-ului.' });
        } finally {
            setLoading(false);
        }
    };

    const cancelSubmit = () => {
        setShowConfirmModal(false);
        setPendingFeedback(null);
    };

    return (
        <>
            <div className="card overflow-visible">
                <div className="card-header bg-gradient-to-r from-primary-400 to-primary-600 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Heart className="w-6 h-6 mr-2 fill-current" />
                        Trimite un Kudos (Apreciere)
                    </h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* User Selector */}
                        <div>
                            <label htmlFor="target-user" className="label">
                                Către cine trimiți?
                            </label>
                            <div className="relative">
                                <select
                                    id="target-user"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="input pl-10"
                                    disabled={loading}
                                >
                                    <option value="">Alege un coleg...</option>
                                    {users.sort((a, b) => a.name.localeCompare(b.name)).map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.departament || 'Fără deparament'})
                                        </option>
                                    ))}
                                </select>
                                <Search className="w-6 h-6 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Badges */}
                        <div>
                            <label className="label">
                                <Sparkles className="w-4 h-4 inline mr-1 text-yellow-500" />
                                Alege un mesaj (Badge)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {badges.map((badge) => (
                                    <button
                                        key={badge.label}
                                        type="button"
                                        onClick={() => setSelectedBadge(badge.label)}
                                        className={`flex items-center p-3 rounded-lg border text-sm font-medium transition-all ${selectedBadge === badge.label
                                            ? 'bg-primary-50 border-primary-500 text-primary-800 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300 ring-2 ring-primary-200 dark:ring-primary-900/20'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <Award className={`w-4 h-4 mr-2 ${selectedBadge === badge.label ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                                        {badge.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !selectedUserId || !selectedBadge}
                            className="btn bg-primary-500 hover:bg-primary-600 text-white w-full py-3 flex items-center justify-center space-x-2 shadow-lg shadow-primary-200 dark:shadow-primary-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Send className="w-6 h-6" />
                                    <span className="font-bold text-lg">Trimite Kudos</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && pendingFeedback && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="modal-overlay" onClick={cancelSubmit}></div>
                    <div className="modal-content">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                                    <Heart className="w-6 h-6 mr-2 text-primary-500 fill-current" />
                                    Confirmare Kudos
                                </h3>
                                <button
                                    onClick={cancelSubmit}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4 mb-6">
                                <p className="text-slate-700 dark:text-slate-300">
                                    Ești sigur că vrei să trimiți acest <strong>Kudos</strong>?
                                </p>

                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Către:</strong> {pendingFeedback.employee_name}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Mesaj:</strong>
                                    </p>
                                    <p className="text-sm text-slate-900 dark:text-white italic">
                                        "{pendingFeedback.comment}"
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={cancelSubmit}
                                    disabled={loading}
                                    className="btn btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Anulează</span>
                                </button>

                                <button
                                    onClick={confirmSubmit}
                                    disabled={loading}
                                    className="btn bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center space-x-2 shadow-lg shadow-primary-200 dark:shadow-primary-900/20"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Se trimite...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Trimite</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KudosForm;
