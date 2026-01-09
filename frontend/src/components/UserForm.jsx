import { useState, useEffect } from 'react';
import { X, Save, UserPlus, Mail, User, Shield, Briefcase, Users, Lock, ChevronRight } from 'lucide-react';
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
        } else if (name === 'role') {
            // If switching to Admin, clear department and function
            if (value === ROLES.ADMIN) {
                setFormData((prev) => ({
                    ...prev,
                    role: value,
                    departament: '',
                    functia: ''
                }));
            } else {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-800"></div>

                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl bg-primary-100 text-primary-600 dark:bg-opacity-10`}>
                                {isEdit ? <Save className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isEdit ? 'Editare Utilizator' : 'Utilizator Nou'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isEdit ? `Modifică datele lui ${user.name}` : 'Configurează un nou membru al echipei'}
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

                    {/* Form Content - Scrollable */}
                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <Mail className="w-6 h-6 mr-1.5 text-slate-400" />
                                    Email
                                </label>
                                <input
                                    name="username"
                                    type="email"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input focus:ring-primary-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-all"
                                    placeholder="ex: nume@cargotrack.ro"
                                    required
                                    disabled={isEdit}
                                />
                            </div>
                            {/* Password */}
                            {!isEdit && (
                                <div className="space-y-1.5">
                                    <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <Lock className="w-6 h-6 mr-1.5 text-slate-400" />
                                        Parolă
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input focus:ring-primary-500/20 transition-all"
                                        placeholder="Minim 8 caractere"
                                        required={!isEdit}
                                    />
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Nume complet
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input focus:ring-primary-500/20 transition-all"
                                    placeholder="Prenume Nume"
                                    required
                                />
                            </div>



                            {/* Role */}
                            <div className="space-y-1.5">
                                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Rol în platformă
                                </label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="input appearance-none focus:ring-primary-500/20 transition-all"
                                        required
                                    >
                                        <option value={ROLES.USER}>Angajat (User)</option>
                                        <option value={ROLES.MANAGER}>Manager / Team Lead</option>
                                        <option value={ROLES.ADMIN}>Administrator</option>
                                    </select>
                                    <ChevronRight className="w-6 h-6 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Organizational Section */}
                        {formData.role !== ROLES.ADMIN && (
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                                    Informații Organizaționale
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Department */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Departament
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="departament"
                                                value={formData.departament}
                                                onChange={handleChange}
                                                className="input appearance-none focus:ring-primary-500/20 transition-all"
                                                required
                                            >
                                                <option value="">Alege departamentul</option>
                                                {departmentOptions.map((dept) => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                            <ChevronRight className="w-6 h-6 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Function */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Funcția / Rolul specific
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="functia"
                                                value={formData.functia}
                                                onChange={handleChange}
                                                className="input appearance-none focus:ring-primary-500/20 transition-all"
                                                required
                                                disabled={!formData.departament}
                                            >
                                                {!formData.departament && <option value="">Alege departamentul întâi</option>}
                                                {functionOptions.map((func) => (
                                                    <option key={func} value={func}>{func}</option>
                                                ))}
                                            </select>
                                            <ChevronRight className="w-6 h-6 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Manager */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Supervizor / Manager Direct
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="manager_id"
                                                value={formData.manager_id || ''}
                                                onChange={handleChange}
                                                className="input appearance-none focus:ring-primary-500/20 transition-all font-medium"
                                            >
                                                <option value="">Fără manager (Nivel Top)</option>
                                                {managerOptions.map((mgr) => (
                                                    <option key={mgr.id} value={mgr.id}>
                                                        {mgr.name} — {mgr.functia} ({mgr.departament})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronRight className="w-6 h-6 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
                            >
                                <span>Anulează</span>
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-[1.5] px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-[0.98] ${isEdit
                                    ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-200 dark:shadow-none'
                                    : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200 dark:shadow-none'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Procesare...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{isEdit ? 'Salvează' : 'Creează utilizator'}</span>
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

export default UserForm;
