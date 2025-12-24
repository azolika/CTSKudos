import { useState, useEffect } from 'react';
import { feedbackAPI, userAPI } from '../services/api';
import { FEEDBACK_TYPES } from '../utils/constants';
import { Heart, Send, Search, MessageSquare } from 'lucide-react';

const KudosForm = ({ currentUser, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [comment, setComment] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [usersData, categoriesData] = await Promise.all([
                    userAPI.getAllUsers(),
                    feedbackAPI.getCategories()
                ]);
                // Filter out current user from the list
                setUsers(usersData.filter(u => u.id !== currentUser?.id));
                setCategories(categoriesData);
                if (categoriesData.length > 0) setSelectedCategory(categoriesData[0]);
            } catch (err) {
                console.error('Failed to load users or categories:', err);
            }
        };
        loadInitialData();
    }, [currentUser?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUserId || !selectedCategory || !comment.trim()) {
            setMessage({ type: 'error', text: 'Vă rugăm să completați toate câmpurile.' });
            return;
        }

        try {
            setLoading(true);
            await feedbackAPI.createFeedback({
                employee_id: parseInt(selectedUserId),
                point_type: FEEDBACK_TYPES.RED,
                comment: comment.trim(),
                category: selectedCategory
            });

            setMessage({ type: 'success', text: 'Kudos trimis cu succes!' });
            setComment('');
            setSelectedUserId('');
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

    return (
        <div className="card overflow-visible">
            <div className="card-header bg-gradient-to-r from-pink-500 to-rose-500 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <Heart className="w-5 h-5 mr-2 fill-current" />
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
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                            <label htmlFor="kudos-category" className="label">
                                Categorie
                            </label>
                            <select
                                id="kudos-category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="input"
                                disabled={loading}
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action - Fixed type */}
                        <div>
                            <label className="label">Tip Feedback</label>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 font-medium text-sm">
                                <span>🔴</span>
                                <span>Punct Roșu (Kudos)</span>
                            </div>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="kudos-comment" className="label">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            De ce merită acest Kudos?
                        </label>
                        <textarea
                            id="kudos-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="input min-h-[80px] resize-y"
                            placeholder="Scrie o scurtă apreciere despre munca colegului tău..."
                            disabled={loading}
                        />
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !selectedUserId || !comment.trim()}
                        className="btn bg-rose-500 hover:bg-rose-600 text-white w-full py-3 flex items-center justify-center space-x-2 shadow-lg shadow-rose-200 dark:shadow-rose-900/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span className="font-bold text-lg">Trimite Kudos</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KudosForm;
