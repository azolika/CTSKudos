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
                    const percentOfMax = (total / maxTotal) * 100;

                    // Prevent 0 width if there are stats
                    const barWidth = total === 0 ? 0 : Math.max(percentOfMax, 5);

                    return (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                                <span>{stat.category}</span>
                                <div className="space-x-3 text-xs">
                                    <span className={stat.rosu > 0 ? "text-red-900 dark:text-red-300 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded" : "text-slate-400"}>
                                        {stat.rosu} roșii
                                    </span>
                                    <span className={stat.negru > 0 ? "text-slate-900 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded" : "text-slate-400"}>
                                        {stat.negru} negre
                                    </span>
                                </div>
                            </div>

                            {/* Background track */}
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                {/* Flex container for bars */}
                                <div
                                    style={{ width: `${barWidth}%` }}
                                    className="h-full flex transition-all duration-500 ease-out"
                                >
                                    {/* Red portion */}
                                    {stat.rosu > 0 && (
                                        <div
                                            style={{ flexGrow: stat.rosu }}
                                            className="bg-red-500 h-full"
                                            title={`${stat.rosu} Puncte Roșii`}
                                        />
                                    )}
                                    {/* Black portion */}
                                    {stat.negru > 0 && (
                                        <div
                                            style={{ flexGrow: stat.negru }}
                                            className="bg-slate-700 dark:bg-slate-400 h-full"
                                            title={`${stat.negru} Puncte Negre`}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryStats;
