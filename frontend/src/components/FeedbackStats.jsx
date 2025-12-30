import { TrendingUp, Award } from 'lucide-react';
import ProgressBar from './ProgressBar';

const FeedbackStats = ({ stats, title = 'Rezultate generale' }) => {
    const { red, black, total, percentageRed, rating } = stats;

    const getRatingColor = () => {
        if (rating === 'Nu există date') return 'text-slate-400 dark:text-slate-500';
        if (percentageRed >= 75) return 'text-green-600 dark:text-green-400';
        if (percentageRed >= 50) return 'text-blue-600 dark:text-blue-400';
        if (percentageRed >= 25) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getRatingBadge = () => {
        if (rating === 'Nu există date') return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
        if (percentageRed >= 75) return 'badge-success';
        if (percentageRed >= 50) return 'badge-info';
        if (percentageRed >= 25) return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    {title}
                </h2>
            </div>
            <div className="card-body space-y-6">
                {/* Progress Bar */}
                <div>
                    <ProgressBar percentageRed={percentageRed} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Red Points */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                            <div className="w-full">
                                <p className="text-sm text-red-600 dark:text-red-400 font-bold mb-1">
                                    🔴 Puncte roșii
                                </p>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-3xl font-black text-red-700 dark:text-red-300 mt-1">
                                        {stats.redManager}
                                    </p>
                                    <div className="flex flex-col text-[10px] space-y-0.5 opacity-80">
                                        <span className="bg-red-200 dark:bg-red-900/40 px-1.5 rounded text-red-800 dark:text-red-200">
                                            {stats.redManager} Manager
                                        </span>
                                        <span className="bg-pink-100 dark:bg-pink-900/40 px-1.5 rounded text-pink-800 dark:text-pink-200">
                                            + {stats.redPeer} Kudos Colegi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Black Points */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-4 border border-slate-300 dark:border-slate-600">
                        <div className="flex items-center justify-between text-center md:text-left">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-1 text-center md:text-left">
                                    ⚫ Puncte negre
                                </p>
                                <p className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-1">
                                    {black}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Percentage */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">
                                    🔢 Performanță
                                </p>
                                <p className="text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">
                                    {percentageRed}%
                                </p>
                                <p className="text-[10px] text-blue-500 mt-1 uppercase tracking-tighter">
                                    Din feedback oficial
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                            <div className="w-full">
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-bold mb-1 flex items-center">
                                    <Award className="w-4 h-4 mr-1" />
                                    Calificativ
                                </p>
                                <div className="mt-2">
                                    <span className={`badge ${getRatingBadge()} text-sm font-black px-3 py-1`}>
                                        {rating}
                                    </span>
                                </div>
                                <p className="text-[10px] text-purple-500 mt-2 uppercase tracking-tighter">
                                    Calculat de manager
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Count */}
                {total > 0 && (
                    <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Total feedback-uri: <span className="font-semibold">{total}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackStats;
