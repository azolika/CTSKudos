import { TrendingUp, Award, Heart, Circle, Hash } from 'lucide-react';
import ProgressBar from './ProgressBar';

const FeedbackStats = ({ stats, title = 'Rezultate generale' }) => {
    const { red, black, total, percentageRed, rating } = stats;

    const getRatingColor = () => {
        if (rating === 'Nu există date') return 'text-slate-400 dark:text-slate-500';
        if (percentageRed >= 75) return 'text-green-600 dark:text-green-400';
        if (percentageRed >= 50) return 'text-primary-600 dark:text-primary-400';
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
                    <ProgressBar percentageRed={percentageRed} rating={rating} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Red Points (Official) - Now Green */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800 text-center">
                        <div className="flex items-center justify-center">
                            <div className="w-full">
                                <p className="text-m text-green-600 dark:text-green-400 font-bold mb-1 flex items-center justify-center">
                                    <Circle className="w-5 h-5 mr-1 fill-current" />
                                    Puncte pozitive
                                </p>
                                <p className="text-3xl font-black text-green-700 dark:text-green-300 mt-1">
                                    {stats.redManager}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Black Points */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-4 border border-slate-300 dark:border-slate-600 text-center">
                        <div className="flex items-center justify-center">
                            <div className="w-full">
                                <p className="text-m text-slate-600 dark:text-slate-400 font-bold mb-1 flex items-center justify-center">
                                    <Circle className="w-5 h-5 mr-1 fill-current" />
                                    Puncte negative
                                </p>
                                <p className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-1">
                                    {black}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Kudos Card - Now Primary Blue */}
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800 text-center">
                        <div className="flex items-center justify-center">
                            <div className="w-full">
                                <p className="text-m text-primary-600 dark:text-primary-400 font-bold mb-1 flex items-center justify-center">
                                    <Heart className="w-4 h-4 mr-1 fill-current" />
                                    Kudos
                                </p>
                                <p className="text-3xl font-black text-primary-700 dark:text-primary-300 mt-1">
                                    {stats.redPeer}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Percentage */}
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800 text-center">
                        <div className="flex items-center justify-center">
                            <div className="w-full">
                                <p className="text-m text-primary-600 dark:text-primary-400 font-bold mb-1 flex items-center justify-center">
                                    <Hash className="w-5 h-5 mr-1" />
                                    Performanță
                                </p>
                                <p className="text-3xl font-black text-primary-700 dark:text-primary-300 mt-1">
                                    {percentageRed}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 text-center">
                        <div className="flex items-center justify-center">
                            <div className="w-full">
                                <p className="text-m text-purple-600 dark:text-purple-400 font-bold mb-1 flex items-center justify-center">
                                    <Award className="w-4 h-4 mr-1" />
                                    Calificativ
                                </p>
                                <div className="mt-2">
                                    <span className={`badge ${getRatingBadge()} text-xl font-black px-3 py-1`}>
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
