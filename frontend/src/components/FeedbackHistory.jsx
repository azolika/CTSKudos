import { Clock, MessageSquare, Circle, Heart } from 'lucide-react';
import { formatDate, FEEDBACK_TYPES } from '../utils/constants';

const FeedbackHistory = ({ feedbackList, title = 'Istoric feedback' }) => {
    if (!feedbackList || feedbackList.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                        <Clock className="w-6 h-6 mr-2" />
                        {title}
                    </h2>
                </div>
                <div className="card-body">
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                        Nu există feedback primit încă.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                    <Clock className="w-6 h-6 mr-2" />
                    {title}
                </h2>
            </div>
            <div className="card-body">
                <div className="space-y-4">
                    {feedbackList.map((feedback, index) => {
                        const isRed = feedback.point_type === FEEDBACK_TYPES.RED;
                        const isKudos = isRed && (feedback.category === 'Kudos' || !feedback.is_manager_feedback);

                        let IconComponent;
                        let iconColor;
                        if (isKudos) {
                            IconComponent = Heart;
                            iconColor = 'text-primary-600 dark:text-primary-400 fill-current';
                        } else if (isRed) {
                            IconComponent = Circle;
                            iconColor = 'text-green-600 dark:text-green-400 fill-current';
                        } else {
                            IconComponent = Circle;
                            iconColor = 'text-slate-600 dark:text-slate-400 fill-current';
                        }

                        let bgColor = 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'; // Default black p.
                        if (isKudos) {
                            bgColor = 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800';
                        } else if (isRed) {
                            bgColor = 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
                        }

                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${bgColor} transition-all hover:shadow-md`}
                            >
                                <div className="flex items-start space-x-3">
                                    <IconComponent className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    de la <span className="font-semibold">{feedback.manager_name}</span>
                                                </p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isKudos
                                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                                                    : isRed
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                                                    }`}>
                                                    {feedback.category || 'General'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatDate(feedback.timestamp)}
                                            </p>
                                        </div>
                                        {feedback.comment && (
                                            <div className="flex items-start space-x-2 mt-2">
                                                <MessageSquare className="w-6 h-6 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                                    "{feedback.comment}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FeedbackHistory;
