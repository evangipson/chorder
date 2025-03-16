import { useState } from 'react';
import AudioService from '../../assets/js/services/audio-service';
import ScaleFactory from '../../assets/js/factories/scale-factory';
import { getRandomElement } from '../../assets/js/extensions/collection-extensions';
import { allNotes } from '../../assets/js/constants/note-constants';
import Keyboard from '../components/keyboard/keyboard';
import Chord from '../../assets/js/types/chord';
import './radio.css';

const Radio = () => {
    const [ songTitle, setSongTitle ] = useState(null);

    const startSong = () => {
        /* pick a root note */
        const root = getRandomElement(allNotes);

        /* create a scale off the root note */
        const scale = ScaleFactory.createScale(root);

        /* pick chords */
        const numberOfChords = Math.floor(Math.random() * 4) + 3;
        const chords = [];
        let rootFromScale = getRandomElement(scale.notes);
        for (let i = 0; i < numberOfChords; i++) {
            /* pick root note from scale */
            const rootIndex = scale.notes.findIndex(scaleNote => scaleNote == rootFromScale) + Math.floor(Math.random() * 3) + 1;
            rootFromScale = scale.notes[rootIndex % scale.notes.length];
            rootFromScale.octave = Math.floor(Math.random() * 1) + 1;

            /* fill up the chord with notes based on intervals from the scale */
            const chordNotes = Math.floor(Math.random() * 3) + 2;
            const chord = [];
            let nextChordNoteIndex = scale.notes.findIndex(scaleNote => scaleNote == rootFromScale);
            for (let j = 0; j < chordNotes; j++) {
                const newChordNote = scale.notes[nextChordNoteIndex % scale.notes.length];
                chord.push(newChordNote);
                nextChordNoteIndex += 2;
            }

            chords.push(new Chord(`${scale.name}`, rootFromScale, chord));
        }

        /* pick bpm */
        const bpm = Math.floor(Math.random() * 60) + 90;

        /* set title based on the scale and chord progression */
        setSongTitle(`${scale.name} Jam, ${bpm}bpm (${chords.map(chord => chord.root.print()).join(' - ')})`);

        AudioService.playSong(chords, scale, bpm);
    };

    const endSong = () => {
        setSongTitle(null);
        AudioService.stopAudio();
    };

    return (
        <>
            <h1>Listen to the Radio</h1>
            <div className='chorder__buttons'>
                <button onClick={startSong}>Start Song</button>
                <button onClick={endSong}>Stop Song</button>
            </div>
            {!!songTitle && (<p>Now listening to: {songTitle}</p>)}
            <Keyboard />
        </>
    );
};

export default Radio;