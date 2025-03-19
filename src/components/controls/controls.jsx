import './controls.css';

const Controls = ({ playButtonText, onPlay, replayButtonText, onReplay, stopButtonText, onStop }) => {
    return (
        <div className='chorder__controls'>
            <div className='chorder__buttons'>
                {(playButtonText && onPlay) && <button onClick={onPlay}>{playButtonText}</button>}
                {(replayButtonText && onReplay) && <button onClick={onReplay}>{replayButtonText}</button>}
                {(stopButtonText && onStop) && <button onClick={onStop}>{stopButtonText}</button>}
            </div>
        </div>
    );
};

export default Controls;