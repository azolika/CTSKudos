const ProgressBar = ({ percentageRed }) => {
    const percentageBlack = 100 - percentageRed;

    return (
        <div className="progress-bar">
            <div
                className="progress-segment-red flex items-center justify-center text-white font-semibold text-sm"
                style={{ width: `${percentageRed}%` }}
            >
                {percentageRed > 10 && `${percentageRed}%`}
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
