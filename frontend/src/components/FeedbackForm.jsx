import { useState } from 'react';
import { feedbackAPI } from '../services/api';
import { FEEDBACK_TYPES } from '../utils/constants';
import { MessageSquare, Send, X, AlertTriangle } from 'lucide-react';

const FeedbackForm = ({ selectedEmployee, onSuccess }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingFeedback, setPendingFeedback] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useState(() => {
        feedbackAPI.getCategories().then(data => {
            setCategories(data);
            if (data.length > 0) setSelectedCategory(data[0]);
        }).catch(console.error);
    }, []);

    const handleSubmit = (pointType) => {
        if (!selectedCategory) {
            alert('Te rugăm să selectezi o categorie!');
            return;
        }
        if (!comment.trim()) {
            alert('Comentariul este obligatoriu pentru punct!');
            return;
        }

        setPendingFeedback({
            employee_id: selectedEmployee.id,
            point_type: pointType,
            comment: comment.trim(),
            category: selectedCategory
        });
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        if (!pendingFeedback) return;

        try {
            setLoading(true);
            await feedbackAPI.createFeedback(pendingFeedback);
            setComment('');
            setShowConfirmModal(false);
            setPendingFeedback(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Failed to submit feedback:', err);
            alert('Eroare la trimiterea feedback-ului. Vă rugăm încercați din nou.');
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
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        Trimite feedback
                    </h3>
                </div>
                <div className="card-body space-y-4">
                    {/* Category Selector */}
                    <div>
                        <label htmlFor="category" className="label">
                            Categorie
                        </label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input"
                            disabled={loading}
                        >
                            <option value="" disabled>Selectează o categorie</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Comment Input */}
                    <div>
                        <label htmlFor="comment" className="label">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            Comentariu (obligatoriu)
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="input min-h-[100px] resize-y"
                            placeholder="Scrie un comentariu despre performanța angajatului..."
                            disabled={loading}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleSubmit(FEEDBACK_TYPES.BLACK)}
                            disabled={loading || !comment.trim() || !selectedCategory}
                            className="btn btn-feedback-black flex items-center justify-center space-x-2"
                        >
                            <span>⚫</span>
                            <span>Punct Negru</span>
                        </button>

                        <button
                            onClick={() => handleSubmit(FEEDBACK_TYPES.RED)}
                            disabled={loading || !comment.trim() || !selectedCategory}
                            className="btn btn-feedback-red flex items-center justify-center space-x-2"
                        >
                            <span>🔴</span>
                            <span>Punct Roșu</span>
                        </button>
                    </div>
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
                                    <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
                                    Confirmare Feedback
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
                                    Ești sigur că vrei să acorzi un{' '}
                                    <strong className={pendingFeedback.point_type === FEEDBACK_TYPES.RED ? 'text-red-600' : 'text-slate-900'}>
                                        Punct {pendingFeedback.point_type === FEEDBACK_TYPES.RED ? 'Roșu' : 'Negru'}
                                    </strong>
                                    ?
                                </p>

                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Către:</strong> {selectedEmployee.name}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Categorie:</strong> {pendingFeedback.category}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Mesaj:</strong>
                                    </p>
                                    <p className="text-sm text-slate-900 dark:text-white italic">
                                        "{pendingFeedback.comment}"
                                    </p>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        ⚠️ Această acțiune va trimite automat un email angajatului.
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
                                    className="btn btn-primary flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Se trimite...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Confirmă și Trimite</span>
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

export default FeedbackForm;
