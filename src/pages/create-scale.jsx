import { useMemo, useState } from 'react';
import ScaleFactory from '../../assets/js/factories/scale-factory';
import { getRandomElement } from '../../assets/js/extensions/collection-extensions';
import { allNotes } from '../../assets/js/constants/note-constants';
import Keyboard from '../components/keyboard/keyboard';
import AudioService from '../../assets/js/services/audio-service';

const CreateScale = () => {
    const [ scale, setScale ] = useState({});
    const [ noteList, setNoteList ] = useState([]);

    const createNewScale = () => {
        const rootNote = getRandomElement(allNotes);
        rootNote.octave = Math.floor(Math.random() * 3) + 1;
        setScale(ScaleFactory.createScale(rootNote));
    }

    useMemo(() => {
        if (!noteList.length) {
            return;
        }

        AudioService.playScale(scale.notes);
    }, [noteList]);

    useMemo(() => {
        if (!scale?.notes?.length) {
            return;
        }

        setNoteList(scale.notes.map(note => note.print()).join(' '));
    }, [scale]);

    return (
        <>
            <h1>Create a Scale</h1>
            <button onClick={createNewScale}>Create Scale</button>
            {!!scale.notes?.length && (
                <>
                    <div>
                        <p>name: {scale.name}</p>
                        <p>notes: {noteList}</p>
                    </div>
                    <Keyboard />
                </>
            )}
        </>
    );
};

export default CreateScale;