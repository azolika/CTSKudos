import { useState, useEffect } from 'react';
import { userAPI, adminAPI, feedbackAPI } from '../services/api';
import Layout from '../components/Layout';
import UserManagementTable from '../components/UserManagementTable';
import UserForm from '../components/UserForm';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { AlertCircle, BarChart3, UserPlus, TrendingUp, Users, Award } from 'lucide-react';
import { ROLES } from '../utils/constants';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUserForm, setShowUserForm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForPassword, setUserForPassword] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [config, setConfig] = useState({ departments: {} });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, statsData, configData] = await Promise.all([
                userAPI.getAllUsers(),
                adminAPI.getStats(),
                adminAPI.getConfig()
            ]);
            setUsers(usersData);
            setStats(statsData);
            setConfig(configData);
            setError('');
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError('Nu s-au putut încărca datele. Vă rugăm încercați din nou.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setShowUserForm(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowUserForm(true);
    };

    const openPasswordModal = (user) => {
        setUserForPassword(user);
        setShowPasswordModal(true);
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async (user) => {
        try {
            setFormLoading(true);
            await userAPI.deleteUser(user.id);
            await loadData();
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Eroare la ștergerea utilizatorului. Vă rugăm încercați din nou.');
        } finally {
            setFormLoading(false);
        }
    };

    const handlePasswordChange = async (userId, newPassword) => {
        try {
            setFormLoading(true);
            await userAPI.changePassword(userId, newPassword);
            alert('Parola a fost actualizată cu succes!');
            setShowPasswordModal(false);
            setUserForPassword(null);
        } catch (err) {
            console.error('Failed to change password:', err);
            alert('Eroare la schimbarea parolei. Vă rugăm încercați din nou.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setFormLoading(true);

            if (editingUser) {
                // Update existing user
                await userAPI.updateUser(editingUser.id, {
                    name: formData.name,
                    role: formData.role,
                    departament: formData.departament,
                    functia: formData.functia,
                });

                // Update manager if changed
                if (formData.manager_id) {
                    await userAPI.setManager(editingUser.id, parseInt(formData.manager_id));
                }
            } else {
                // Create new user
                const newUser = await userAPI.createUser(formData);
                if (formData.manager_id && newUser.id) {
                    await userAPI.setManager(newUser.id, parseInt(formData.manager_id));
                }
            }

            setShowUserForm(false);
            setEditingUser(null);
            await loadData();
        } catch (err) {
            console.error('Failed to save user:', err);
            alert('Eroare la salvarea utilizatorului. Vă rugăm încercați din nou.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormCancel = () => {
        setShowUserForm(false);
        setEditingUser(null);
    };


    // Calculate statistics
    const totalUsers = users.length;
    const totalManagers = users.filter((u) => u.role === 'manager').length;
    const totalAdmins = users.filter((u) => u.role === 'admin').length;

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
                {/* Header */}
                <div className="fade-in">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Panou Administrativ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Gestionează utilizatorii și vizualizează statisticile sistemului.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            <button
                                onClick={loadData}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline mt-2"
                            >
                                Încearcă din nou
                            </button>
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="card h-full">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                        Total Feedback-uri
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {stats?.total_feedback || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card h-full border-l-4 border-red-500">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                        Roșii (30 zile)
                                    </p>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {stats?.red_30_days || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card h-full border-l-4 border-slate-800">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                        Negre (30 zile)
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-400">
                                        {stats?.black_30_days || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Kudos Card */}
                    <div className="card h-full border-l-4 border-green-500">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                        Kudos (30 zile)
                                    </p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {stats?.kudos_30_days || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card h-full">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                        Total Utilizatori
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {totalUsers}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Managers and Info */}
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card h-fit">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                    Top 5 Manageri/Team Leads (Activitate)
                                </h3>
                            </div>
                            <div className="card-body p-0">
                                {stats?.top_managers && stats.top_managers.length > 0 ? (
                                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {stats.top_managers.map((manager, index) => (
                                            <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-slate-900 dark:text-white">{manager.name}</span>
                                                </div>
                                                <span className="badge badge-primary">{manager.count} feedback-uri</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        Nu există date disponibile.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card h-fit">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Distribuție Roluri
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-4">
                                    {[ROLES.ADMIN, ROLES.MANAGER, ROLES.USER].map((role) => {
                                        const count = stats?.user_counts?.[role] || 0;
                                        const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                                        const colors = {
                                            [ROLES.ADMIN]: 'bg-purple-500',
                                            [ROLES.MANAGER]: 'bg-green-500',
                                            [ROLES.USER]: 'bg-primary-500'
                                        };
                                        const labels = {
                                            [ROLES.ADMIN]: 'Admin',
                                            [ROLES.MANAGER]: 'Manager/Team Lead',
                                            [ROLES.USER]: 'User'
                                        };
                                        return (
                                            <div key={role}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{labels[role]}</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className={`${colors[role]} h-2 rounded-full`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Gestionare Utilizatori
                            </h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleAddUser}
                                    className="btn btn-primary flex items-center space-x-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Adaugă Utilizator</span>
                                </button>
                            </div>
                        </div>

                        <UserManagementTable
                            users={users}
                            onEdit={handleEditUser}
                            onDelete={openDeleteModal}
                            onPasswordChange={openPasswordModal}
                        />
                    </div>
                </div>
            </div>

            {/* User Form Modal */}
            {showUserForm && (
                <UserForm
                    user={editingUser}
                    allUsers={users}
                    config={config}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={formLoading}
                />
            )}

            {/* Change Password Modal */}
            {showPasswordModal && userForPassword && (
                <ChangePasswordModal
                    user={userForPassword}
                    onSubmit={handlePasswordChange}
                    onCancel={() => {
                        setShowPasswordModal(false);
                        setUserForPassword(null);
                    }}
                    loading={formLoading}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <DeleteConfirmModal
                    user={userToDelete}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                    }}
                    loading={formLoading}
                />
            )}
        </Layout>
    );
};

export default AdminDashboard;
