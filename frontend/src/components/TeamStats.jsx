import { Users, TrendingUp, Award, Heart } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { calculateFeedbackStats } from '../utils/constants';

const TeamStats = ({ subordinates, allFeedback }) => {
    // Calculate team-wide statistics
    const teamStats = calculateFeedbackStats(allFeedback);

    // Calculate individual stats for ranking
    const subordinatesWithStats = subordinates.map((sub) => {
        const subFeedback = allFeedback.filter(
            (f) => f.employee_id === sub.id
        );
        const stats = calculateFeedbackStats(subFeedback);
        return { ...sub, ...stats };
    });

    // Sort by percentage red (descending)
    const rankedSubordinates = [...subordinatesWithStats].sort(
        (a, b) => b.percentageRed - a.percentageRed
    );

    return (
        <div className="space-y-6">
            {/* Team Overview */}
            <div className="card fade-in">
                <div className="card-header">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        📊 Rezultate generale ale echipei
                    </h2>
                </div>
                <div className="card-body space-y-6">
                    <ProgressBar percentageRed={teamStats.percentageRed} />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Red Points */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-3 border border-red-200 dark:border-red-800 text-center">
                            <div className="w-full">
                                <p className="text-m text-red-600 dark:text-red-400 font-bold mb-1">
                                    🔴 Puncte roșii
                                </p>
                                <p className="text-3xl font-black text-red-700 dark:text-red-300 mt-1">
                                    {teamStats.redManager}
                                </p>
                            </div>
                        </div>

                        {/* Black Points */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-3 border border-slate-300 dark:border-slate-600 text-center">
                            <div className="w-full">
                                <p className="text-m text-slate-600 dark:text-slate-400 font-bold mb-1">
                                    ⚫ Puncte negre
                                </p>
                                <p className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-1">
                                    {teamStats.black}
                                </p>
                            </div>
                        </div>

                        {/* Kudos Card */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-800 text-center">
                            <div className="w-full">
                                <p className="text-m text-green-600 dark:text-green-400 font-bold mb-1 flex items-center justify-center">
                                    <Heart className="w-3 h-3 mr-1 fill-current" />
                                    Kudos
                                </p>
                                <p className="text-3xl font-black text-green-700 dark:text-green-300 mt-1">
                                    {teamStats.redPeer}
                                </p>
                            </div>
                        </div>

                        {/* Percentage */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 text-center">
                            <div className="w-full">
                                <p className="text-m text-blue-600 dark:text-blue-400 font-bold mb-1">
                                    🔢 Performanță
                                </p>
                                <p className="text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">
                                    {teamStats.percentageRed}%
                                </p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800 text-center">
                            <div className="w-full">
                                <p className="text-m text-purple-600 dark:text-purple-400 font-bold mb-1 flex items-center justify-center">
                                    <Award className="w-3 h-3 mr-1" />
                                    Calificativ
                                </p>
                                <div className="mt-1">
                                    <span className="badge badge-info text-xl font-black px-3 py-1">
                                        {teamStats.rating}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subordinates Ranking */}
            <div className="card fade-in">
                <div className="card-header">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        📋 Clasament subordonați
                    </h3>
                </div>
                <div className="card-body">
                    {rankedSubordinates.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                            Nu există subordonați în sistem.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nume</th>
                                        <th>Departament</th>
                                        <th>Funcția</th>
                                        <th className="text-center">Roșu</th>
                                        <th className="text-center">Kudos</th>
                                        <th className="text-center">Negru</th>
                                        <th className="text-center">% Roșu</th>
                                        <th>Calificativ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankedSubordinates.map((sub, index) => (
                                        <tr key={sub.id}>
                                            <td className="font-medium">
                                                {index < 3 && (
                                                    <span className="mr-2">
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                    </span>
                                                )}
                                                {sub.name}
                                            </td>
                                            <td className="text-slate-600 dark:text-slate-400">
                                                {sub.departament || '-'}
                                            </td>
                                            <td className="text-slate-600 dark:text-slate-400">
                                                {sub.functia || '-'}
                                            </td>
                                            <td className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">
                                                    {sub.redManager}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold">
                                                    {sub.redPeer}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                                                    {sub.black}
                                                </span>
                                            </td>
                                            <td className="text-center font-semibold text-blue-600 dark:text-blue-400">
                                                {sub.percentageRed}%
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${sub.rating === 'Nu există date'
                                                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                        : sub.percentageRed >= 75
                                                            ? 'badge-success'
                                                            : sub.percentageRed >= 50
                                                                ? 'badge-info'
                                                                : sub.percentageRed >= 25
                                                                    ? 'badge-warning'
                                                                    : 'badge-danger'
                                                        }`}
                                                >
                                                    {sub.rating}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamStats;
