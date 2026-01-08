import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Token de resetare lipsă.');
            return;
        }

        if (!password || !confirmPassword) {
            setError('Vă rugăm să completați ambele câmpuri.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Parolele nu coincid!');
            return;
        }

        if (password.length < 6) {
            setError('Parola trebuie să aibă cel puțin 6 caractere.');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.response?.data?.detail || 'Eroare la resetarea parolei. Token-ul ar putea fi expirat.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl">
                            <span className="text-white font-bold text-4xl">K</span>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Resetare Parolă
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Introduceți noua parolă pentru contul dumneavoastră.
                    </p>
                </div>

                <div className="card slide-up">
                    <div className="card-body">
                        {success ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Parolă resetată!
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    Parola a fost actualizată cu succes. Veți fi redirecționat către pagina de autentificare...
                                </p>
                                <Link to="/" className="btn btn-primary w-full">
                                    Mergi la Autentificare
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                    </div>
                                )}

                                {!token && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
                                        <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            Token-ul este invalid sau lipsește. Vă rugăm să folosiți link-ul din email.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="password" className="label">
                                        <Lock className="w-6 h-6 inline mr-1" />
                                        Parolă nouă
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input"
                                        placeholder="••••••••"
                                        disabled={loading || !token}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="label">
                                        <Lock className="w-6 h-6 inline mr-1" />
                                        Confirmă parola
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input"
                                        placeholder="••••••••"
                                        disabled={loading || !token}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Se resetează...</span>
                                        </>
                                    ) : (
                                        <span>Resetează parola</span>
                                    )}
                                </button>

                                <div className="text-center pt-4">
                                    <Link
                                        to="/"
                                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm flex items-center justify-center"
                                    >
                                        <ArrowLeft className="w-6 h-6 mr-1" />
                                        Înapoi la autentificare
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
