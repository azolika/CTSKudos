import { X, Trash2, AlertTriangle, User } from 'lucide-react';

const DeleteConfirmModal = ({ user, onConfirm, onCancel, loading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-red-600 to-red-800"></div>

                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-red-50/30 dark:bg-red-900/10">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-opacity-10">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Confirmare Ștergere
                                </h3>
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5 uppercase tracking-wider">
                                    Acțiune ireversibilă
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-700 dark:text-slate-300">
                                Ești sigur că vrei să ștergi definitiv contul utilizatorului:
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user.username}</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed italic">
                            Toate datele asociate, feedback-urile trimise și primite vor rămâne în sistem, însă utilizatorul nu se va mai putea autentifica.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
                            >
                                Anulează
                            </button>

                            <button
                                onClick={() => onConfirm(user)}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-[0.98] bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Se șterge...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Șterge</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
