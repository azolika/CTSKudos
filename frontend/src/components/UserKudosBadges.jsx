import { useMemo } from 'react';

const UserKudosBadges = ({ feedback }) => {
    const uniqueRecentBadges = useMemo(() => {
        if (!feedback || feedback.length === 0) return [];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 180);

        // Filter for kudos (non-manager feedback) from the last 180 days
        const recentKudos = feedback.filter(f => {
            const feedbackDate = new Date(f.timestamp);
            // Handle both boolean and numeric (0/1) values for is_manager_feedback
            const isManager = f.is_manager_feedback === true || f.is_manager_feedback === 1;
            return feedbackDate >= cutoffDate && !isManager && f.point_type === 'rosu';
        });

        // Get unique labels
        const uniqueLabels = [...new Set(recentKudos.map(f => f.comment))];

        // Extract the emoji and text for each unique badge
        const badges = uniqueLabels.map(fullLabel => {
            if (!fullLabel) return null;
            const trimmed = fullLabel.trim();
            const parts = trimmed.split(/\s+/);

            if (parts.length > 0) {
                const firstPart = parts[0];
                // Check if the first part is likely an emoji or contains one
                if (/[\uD800-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/.test(firstPart)) {
                    return {
                        icon: firstPart,
                        label: parts.slice(1).join(' ') || trimmed
                    };
                }
            }
            return { icon: '✨', label: trimmed };
        }).filter(Boolean);

        return badges;
    }, [feedback]);

    if (uniqueRecentBadges.length === 0) return null;

    return (
        <span className="inline-flex items-center ml-3 space-x-1 animate-in fade-in zoom-in duration-500">
            {uniqueRecentBadges.map((badge, index) => (
                <span
                    key={index}
                    className="w-8 h-8 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 hover:rotate-12 transition-transform cursor-default"
                    title={badge.label}
                >
                    <span className="text-lg">{badge.icon}</span>
                </span>
            ))}
        </span>
    );
};

export default UserKudosBadges;
