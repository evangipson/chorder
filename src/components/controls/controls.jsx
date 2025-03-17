import './controls.css';

const Controls = ({ playButtonText, onPlay, stopButtonText, onStop }) => {
    return (
        <div className='chorder__controls'>
            <div className='chorder__buttons'>
                {!!(playButtonText && onPlay) && (<button onClick={onPlay}>{playButtonText}</button>)}
                {!!(stopButtonText && onStop) && (<button onClick={onStop}>{stopButtonText}</button>)}
            </div>
        </div>
    );
};

export default Controls;