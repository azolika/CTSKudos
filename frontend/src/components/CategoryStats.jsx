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
                    const total = stat.rosu_manager + stat.rosu_peer + stat.negru;
                    if (total === 0) return null;

                    const mRedPercent = (stat.rosu_manager / total) * 100;
                    const pRedPercent = (stat.rosu_peer / total) * 100;
                    const blackPercent = (stat.negru / total) * 100;

                    return (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-end text-sm font-medium text-slate-700 dark:text-slate-300">
                                <div className="flex flex-col">
                                    <span className="font-bold">{stat.category}</span>
                                    <span className="text-[10px] text-slate-500 font-normal">
                                        Total: {total} {total === 1 ? 'pct' : 'pct'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-[10px] mb-0.5 opacity-90">
                                    <div className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1"></div>
                                        <span className="font-bold text-red-600">{stat.rosu_manager}M</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-1"></div>
                                        <span className="font-bold text-rose-500">{stat.rosu_peer}P</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-slate-800 dark:bg-slate-400 rounded-full mr-1"></div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{stat.negru}N</span>
                                    </div>
                                </div>
                            </div>

                            {/* Background track */}
                            <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                                {/* Manager Red */}
                                {stat.rosu_manager > 0 && (
                                    <div
                                        style={{ width: `${mRedPercent}%` }}
                                        className="bg-red-600 h-full transition-all duration-700 ease-out flex items-center justify-center overflow-hidden border-r border-white/10"
                                        title={`${stat.rosu_manager} Puncte Roșii Manager`}
                                    >
                                        {mRedPercent > 10 && <span className="text-[9px] text-white font-black">{Math.round(mRedPercent)}%</span>}
                                    </div>
                                )}
                                {/* Peer Red / Kudos */}
                                {stat.rosu_peer > 0 && (
                                    <div
                                        style={{ width: `${pRedPercent}%` }}
                                        className="bg-rose-400 h-full transition-all duration-700 ease-out flex items-center justify-center overflow-hidden border-r border-white/10"
                                        title={`${stat.rosu_peer} Kudos Colegi`}
                                    >
                                        {pRedPercent > 10 && <span className="text-[9px] text-white font-black">{Math.round(pRedPercent)}%</span>}
                                    </div>
                                )}
                                {/* Black portion */}
                                {stat.negru > 0 && (
                                    <div
                                        style={{ width: `${blackPercent}%` }}
                                        className="bg-slate-800 dark:bg-slate-700 h-full transition-all duration-700 ease-out flex items-center justify-center overflow-hidden"
                                        title={`${stat.negru} Puncte Negre`}
                                    >
                                        {blackPercent > 10 && <span className="text-[9px] text-white font-black">{Math.round(blackPercent)}%</span>}
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
