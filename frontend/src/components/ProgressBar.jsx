const ProgressBar = ({ percentageRed }) => {
    const percentageOfficial = percentageRed;
    const percentageBlack = 100 - percentageOfficial;

    return (
        <div className="progress-bar">
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
        </div>
    );
};

export default ProgressBar;
