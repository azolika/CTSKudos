import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Users, Shield } from 'lucide-react';
import { ROLES } from '../utils/constants';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('theme');
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getRoleIcon = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return <Shield className="w-5 h-5" />;
            case ROLES.MANAGER:
                return <Users className="w-5 h-5" />;
            default:
                return <User className="w-5 h-5" />;
        }
    };

    const getRoleLabel = () => {
        switch (user?.role) {
            case ROLES.ADMIN:
                return 'Administrator';
            case ROLES.MANAGER:
                return 'Manager/Team Lead';
            default:
                return 'Angajat';
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}Hello
            <header className="glass-effect border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">K</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Kudos
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">by CargoTrack</p>
                            </div>
                        </div>

                        {/* User Info & Logout */}
                        <div className="flex items-center space-x-4">

                            <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                {getRoleIcon()}
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {getRoleLabel()}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary flex items-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-700 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} CargoTrack. Toate drepturile rezervate.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
