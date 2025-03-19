import { useMemo, useState } from 'react';
import { allNotes } from '../../assets/js/constants/note-constants';
import { getRandomElement } from '../../assets/js/extensions/collection-extensions';
import ChordFactory from '../../assets/js/factories/chord-factory';
import AudioService from '../../assets/js/services/audio-service';
import Note from '../../assets/js/types/note';
import Controls from '../components/controls/controls';
import Keyboard from '../components/keyboard/keyboard';
import './create-chord.css';

const CreateChord = () => {
    const [ chord, setChord ] = useState({});
    const [ noteList, setNoteList ] = useState([]);

    const createNewChord = () => {
        const chordNotes = Math.floor(Math.random() * 3) + 3;
        const randomNote = getRandomElement(allNotes);
        const rootNote = new Note(randomNote.name);
        rootNote.flat = randomNote.flat;
        rootNote.sharp = randomNote.sharp;
        rootNote.octave = Math.floor(Math.random() * 2) + 1;
        setChord(ChordFactory.createChord(chordNotes, rootNote));
    };

    useMemo(() => {
        if (!chord?.notes?.length) {
            return;
        }

        setNoteList(chord.notes.map(note => note.print()).join(' '));
        AudioService.playChord(chord.notes);
    }, [chord]);

    return (
        <>
            <h1>Create a Chord</h1>
            <Controls playButtonText='Create Chord'
                onPlay={createNewChord}
                replayButtonText={chord.notes?.length && 'Replay Chord'}
                onReplay={() => chord.notes?.length && AudioService.playChord(chord.notes)} />
            <Keyboard />
            {chord &&
                <div className='chorder__chord'>
                    {!!noteList.length && <p className='chorder__chord-root'>{chord.symbolName}</p>}
                    {!!noteList.length && <p className='chorder__chord-notes'>({chord.fullName}) {noteList}</p>}
                </div>
            }
        </>
    );
};

export default CreateChord;