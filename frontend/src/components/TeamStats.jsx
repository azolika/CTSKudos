import { Users, TrendingUp } from 'lucide-react';
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
                <div className="card-body space-y-4">
                    <ProgressBar percentageRed={teamStats.percentageRed} />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {teamStats.red}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                🔴 Puncte roșii
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                                {teamStats.black}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                ⚫ Puncte negre
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {teamStats.percentageRed}%
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                🔢 % Puncte roșii
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {teamStats.rating}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                🏅 Calificativ
                            </p>
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
                                                    {sub.red}
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
                                                    className={`badge ${sub.percentageRed >= 75
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
