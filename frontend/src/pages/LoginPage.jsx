import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Introduceți numele și parola.');
            return;
        }

        setLoading(true);
        const result = await login(username, password);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setResetSuccess('');

        if (!resetEmail) {
            setError('Vă rugăm introduceți adresa de email.');
            return;
        }

        setLoading(true);
        try {
            const result = await authAPI.forgotPassword(resetEmail);
            setResetSuccess(result.message);
            setResetEmail('');
        } catch (err) {
            console.error('Forgot password error:', err);
            setError('Eroare la trimiterea email-ului de resetare.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo and Title */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl">
                            <span className="text-white font-bold text-4xl">K</span>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Kudos
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        by CargoTrack
                    </p>
                </div>

                {/* Card */}
                <div className="card slide-up">
                    {!isForgotPassword ? (
                        <>
                            <div className="card-header">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                                    <LogIn className="w-6 h-6 mr-2" />
                                    Autentificare
                                </h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                        </div>
                                    )}

                                    {/* Username Field */}
                                    <div>
                                        <label htmlFor="username" className="label">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email
                                        </label>
                                        <input
                                            id="username"
                                            type="email"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="input"
                                            placeholder="nume@exemplu.ro"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="label">
                                            <Lock className="w-4 h-4 inline mr-1" />
                                            Parolă
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input"
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-full flex items-center justify-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Se autentifică...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="w-6 h-6" />
                                                <span>Autentificare</span>
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Forgot Password Link Toggle */}
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                                    <button
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            setError('');
                                        }}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                                    >
                                        Ai uitat parola?
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="card-header">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    Resetare Parolă
                                </h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleForgotPassword} className="space-y-6">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Introduceți adresa de email pentru a primi link-ul de resetare.
                                    </p>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                        </div>
                                    )}

                                    {/* Success Message */}
                                    {resetSuccess && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start space-x-3">
                                            <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-green-700 dark:text-green-300">{resetSuccess}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="resetEmail" className="label">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email
                                        </label>
                                        <input
                                            id="resetEmail"
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="input"
                                            placeholder="nume@exemplu.ro"
                                            disabled={loading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-full flex items-center justify-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Se trimite...</span>
                                            </>
                                        ) : (
                                            <span>Trimite link de resetare</span>
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsForgotPassword(false);
                                                setError('');
                                                setResetSuccess('');
                                            }}
                                            className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                                        >
                                            Înapoi la autentificare
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} CargoTrack. Toate drepturile rezervate.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
