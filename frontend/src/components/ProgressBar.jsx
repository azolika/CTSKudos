const ProgressBar = ({ percentageRed, rating }) => {
    const isNoData = rating === 'Nu există date';
    const percentageOfficial = isNoData ? 100 : percentageRed;
    const percentageBlack = isNoData ? 0 : 100 - percentageOfficial;

    return (
        <div className="progress-bar">
            {isNoData ? (
                <div
                    className="flex items-center justify-center text-slate-600 font-semibold text-sm w-full"
                    style={{ backgroundColor: '#ECECEC' }}
                >
                    Nu există date
                </div>
            ) : (
                <>
                    <div
                        className="progress-segment-official flex items-center justify-center text-white font-semibold text-sm"
                        style={{ width: `${percentageOfficial}%` }}
                    >
                        {percentageOfficial > 10 && `${percentageOfficial}%`}
                    </div>
                    <div
                        className="progress-segment-black flex items-center justify-center text-white font-semibold text-sm"
                        style={{ width: `${percentageBlack}%` }}
                    >
                        {percentageBlack > 10 && `${percentageBlack}%`}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProgressBar;
