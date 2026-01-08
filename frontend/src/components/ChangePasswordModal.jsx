import { useState } from 'react';
import { X, Key, Lock, Save, AlertCircle } from 'lucide-react';

const ChangePasswordModal = ({ user, onSubmit, onCancel, loading }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Parola trebuie să aibă cel puțin 6 caractere.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Parolele nu se potrivesc.');
            return;
        }

        onSubmit(user.id, password);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-800"></div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-opacity-10">
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Resetare Parolă
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Schimbă parola pentru <strong>{user.name}</strong>
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

                    {/* Form Content */}
                    <div className="p-6 space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start space-x-3">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <Lock className="w-4 h-4 mr-1.5 text-slate-400" />
                                    Noua parolă
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input focus:ring-amber-500/20 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <Lock className="w-4 h-4 mr-1.5 text-slate-400" />
                                    Confirmă parolă
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input focus:ring-amber-500/20 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
                            >
                                <span>Anulează</span>
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-[0.98] bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Salvare...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-6 h-6" />
                                        <span>Salvează</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
