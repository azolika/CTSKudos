import { Edit, Trash2, Shield, Users as UsersIcon, User, Key } from 'lucide-react';
import { ROLES } from '../utils/constants';

const UserManagementTable = ({ users, onEdit, onDelete, onPasswordChange }) => {
    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return <Shield className="w-4 h-4 text-purple-600" />;
            case ROLES.MANAGER:
                return <UsersIcon className="w-4 h-4 text-primary-600" />;
            default:
                return <User className="w-4 h-4 text-slate-600" />;
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case ROLES.MANAGER:
                return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300';
            default:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return 'Admin';
            case ROLES.MANAGER:
                return 'Manager/Team Lead';
            default:
                return 'User';
        }
    };

    if (!users || users.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">
                        Nu există utilizatori în sistem.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-body p-0">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nume</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Departament</th>
                                <th>Funcția</th>
                                <th className="text-right">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="font-medium">{user.name}</td>
                                    <td className="text-slate-600 dark:text-slate-400">
                                        {user.username}
                                    </td>
                                    <td>
                                        <span
                                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                                                user.role
                                            )}`}
                                        >
                                            {getRoleIcon(user.role)}
                                            <span>{getRoleLabel(user.role)}</span>
                                        </span>
                                    </td>
                                    <td className="text-slate-600 dark:text-slate-400">
                                        {user.departament || '-'}
                                    </td>
                                    <td className="text-slate-600 dark:text-slate-400">
                                        {user.functia || '-'}
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => onEdit(user)}
                                                className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                title="Editează"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onPasswordChange(user)}
                                                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                title="Schimbă Parola"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(user)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Șterge"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagementTable;
