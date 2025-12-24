import { TrendingUp, Award } from 'lucide-react';
import ProgressBar from './ProgressBar';

const FeedbackStats = ({ stats, title = 'Rezultate generale' }) => {
    const { red, black, total, percentageRed, rating } = stats;

    const getRatingColor = () => {
        if (percentageRed >= 75) return 'text-green-600 dark:text-green-400';
        if (percentageRed >= 50) return 'text-blue-600 dark:text-blue-400';
        if (percentageRed >= 25) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getRatingBadge = () => {
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
                            <div>
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    🔴 Puncte roșii
                                </p>
                                <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-1">
                                    {red}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Black Points */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-4 border border-slate-300 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    ⚫ Puncte negre
                                </p>
                                <p className="text-3xl font-bold text-slate-700 dark:text-slate-300 mt-1">
                                    {black}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Percentage */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                    🔢 % Puncte roșii
                                </p>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                                    {percentageRed}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                            <div className="w-full">
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center">
                                    <Award className="w-4 h-4 mr-1" />
                                    Calificativ
                                </p>
                                <div className="mt-2">
                                    <span className={`badge ${getRatingBadge()} text-sm font-bold`}>
                                        {rating}
                                    </span>
                                </div>
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
