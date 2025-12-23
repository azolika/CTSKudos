import { useState, useEffect } from 'react';
import { X, Save, UserPlus } from 'lucide-react';
import { ROLES } from '../utils/constants';

const UserForm = ({ user, allUsers, config, onSubmit, onCancel, loading }) => {
    const isEdit = !!user;

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        role: ROLES.USER,
        departament: '',
        functia: '',
        manager_id: null,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                name: user.name || '',
                password: '',
                role: user.role || ROLES.USER,
                departament: user.departament || '',
                functia: user.functia || '',
                manager_id: user.manager_id || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If department changes, reset functia to the first available or empty
        if (name === 'departament') {
            const availableFunctions = config.departments[value] || [];
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                functia: availableFunctions[0] || ''
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const managerOptions = allUsers.filter((u) => u.role === ROLES.MANAGER || u.role === ROLES.ADMIN);

    // Departments from config
    const departmentOptions = Object.keys(config.departments || {}).sort();

    // Functions for the selected department
    const functionOptions = formData.departament ? (config.departments[formData.departament] || []) : [];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="modal-overlay" onClick={onCancel}></div>
            <div className="modal-content max-w-2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center">
                            {isEdit ? (
                                <>
                                    <Save className="w-6 h-6 mr-2" />
                                    Editează Utilizator
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-6 h-6 mr-2" />
                                    Adaugă Utilizator Nou
                                </>
                            )}
                        </h3>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Username/Email */}
                            <div>
                                <label htmlFor="username" className="label">
                                    Email *
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="email"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                    disabled={isEdit}
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="label">
                                    Nume complet *
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password (only for new users or when changing) */}
                        {!isEdit && (
                            <div>
                                <label htmlFor="password" className="label">
                                    Parolă *
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    required={!isEdit}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="label">
                                    Rol *
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value={ROLES.USER}>User</option>
                                    <option value={ROLES.MANAGER}>Manager</option>
                                    <option value={ROLES.ADMIN}>Admin</option>
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <label htmlFor="departament" className="label">
                                    Departament *
                                </label>
                                <select
                                    id="departament"
                                    name="departament"
                                    value={formData.departament}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Selectează Departament</option>
                                    {departmentOptions.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Function */}
                            <div>
                                <label htmlFor="functia" className="label">
                                    Funcția *
                                </label>
                                <select
                                    id="functia"
                                    name="functia"
                                    value={formData.functia}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                    disabled={!formData.departament}
                                >
                                    {!formData.departament && <option value="">Alege departamentul întâi</option>}
                                    {functionOptions.map((func) => (
                                        <option key={func} value={func}>
                                            {func}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Manager */}
                            <div>
                                <label htmlFor="manager_id" className="label">
                                    Manager
                                </label>
                                <select
                                    id="manager_id"
                                    name="manager_id"
                                    value={formData.manager_id || ''}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="">(fără manager)</option>
                                    {managerOptions.map((mgr) => (
                                        <option key={mgr.id} value={mgr.id}>
                                            {mgr.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="btn btn-secondary flex items-center justify-center space-x-2"
                        >
                            <X className="w-4 h-4" />
                            <span>Anulează</span>
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Se salvează...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{isEdit ? 'Salvează' : 'Adaugă'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
