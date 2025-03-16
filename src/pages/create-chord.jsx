import { useMemo, useState } from 'react';
import { allNotes } from '../../assets/js/constants/note-constants';
import { getRandomElement } from '../../assets/js/extensions/collection-extensions';
import ChordFactory from '../../assets/js/factories/chord-factory';
import Note from '../../assets/js/types/note';
import Keyboard from '../components/keyboard/keyboard';
import AudioService from '../../assets/js/services/audio-service';

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
            <button onClick={createNewChord}>Create Chord</button>
            {!!chord.notes?.length && (
                <>
                    <div>
                        <p>name: {chord.name}</p>
                        <p>root: {chord.root.print()}</p>
                        <p>notes: {noteList}</p>
                    </div>
                    <button onClick={() => AudioService.playChord(chord.notes)}>Play Chord</button>
                </>
            )}
            <Keyboard />
        </>
    );
};

export default CreateChord;