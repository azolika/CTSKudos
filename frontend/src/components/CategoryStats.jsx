import React from 'react';

const CategoryStats = ({ stats }) => {
    // stats: [{ category: "Productivitate", rosu: 5, negru: 2 }, ...]

    if (!stats || stats.length === 0) return null;

    // Calculate max total (red + black) to scale the bars
    const maxTotal = Math.max(...stats.map(s => s.rosu + s.negru), 1);

    return (
        <div className="card mt-6">
            <div className="card-header">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Statistici pe Categorii</h3>
            </div>
            <div className="card-body space-y-4">
                {stats.map((stat, idx) => {
                    const total = stat.rosu + stat.negru;
                    if (total === 0) return null;

                    const redPercent = (stat.rosu / total) * 100;
                    const blackPercent = (stat.negru / total) * 100;

                    return (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-end text-sm font-medium text-slate-700 dark:text-slate-300">
                                <div className="flex flex-col">
                                    <span>{stat.category}</span>
                                    <span className="text-[10px] text-slate-500 font-normal">
                                        Total: {total} {total === 1 ? 'punct' : 'puncte'}
                                    </span>
                                </div>
                                <div className="space-x-3 text-xs mb-0.5">
                                    <span className={stat.rosu > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-slate-400"}>
                                        {stat.rosu} R
                                    </span>
                                    <span className={stat.negru > 0 ? "text-slate-900 dark:text-slate-300 font-bold" : "text-slate-400"}>
                                        {stat.negru} N
                                    </span>
                                </div>
                            </div>

                            {/* Background track - always 100% */}
                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                                {/* Red portion */}
                                {stat.rosu > 0 && (
                                    <div
                                        style={{ width: `${redPercent}%` }}
                                        className="bg-red-500 h-full transition-all duration-700 ease-out flex items-center justify-center overflow-hidden"
                                        title={`${stat.rosu} Puncte Roșii`}
                                    >
                                        {redPercent > 15 && <span className="text-[10px] text-white font-bold">{Math.round(redPercent)}%</span>}
                                    </div>
                                )}
                                {/* Black portion */}
                                {stat.negru > 0 && (
                                    <div
                                        style={{ width: `${blackPercent}%` }}
                                        className="bg-slate-800 dark:bg-slate-700 h-full transition-all duration-700 ease-out flex items-center justify-center overflow-hidden"
                                        title={`${stat.negru} Puncte Negre`}
                                    >
                                        {blackPercent > 15 && <span className="text-[10px] text-white font-bold">{Math.round(blackPercent)}%</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryStats;
