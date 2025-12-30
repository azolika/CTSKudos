import { Sparkles, Award } from 'lucide-react';

const KudosBadgesLegend = ({ badges }) => {
    if (!badges || badges.length === 0) return null;

    return (
        <div className="fade-in space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Semnificația Kudos-urilor
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Află ce reprezintă fiecare insignă de apreciere pe care o poți primi sau oferi.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((badge, index) => (
                    <div
                        key={index}
                        className="group bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-100 dark:hover:shadow-none transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{badge.label.split(' ')[0]}</span>
                            <Award className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-yellow-500 transition-colors" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                            {badge.label.split(' ').slice(1).join(' ')}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {badge.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KudosBadgesLegend;
