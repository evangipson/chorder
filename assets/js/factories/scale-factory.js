import { allNotes } from '../constants/note-constants';
import { scales } from '../constants/scale-constants';
import { getRandomElement } from '../extensions/collection-extensions';
import Note from '../types/note';
import Scale from '../types/scale';

class ScaleFactory {
    /**
     * Creates a new `Scale` off the provided `rootNote`.
     * @param {Note} rootNote
     * @returns {Scale}
     */
    static createScale = (rootNote) => {
        let scale = getRandomElement(scales);
        const initialInterval = allNotes.findIndex(note => {
            return note.name == rootNote.name && note.sharp == rootNote.sharp && note.flat == rootNote.flat;
        });

        /* fill the scale with all intervals defined in the selected scale */
        let currentInterval = initialInterval;
        let scaleNotes = scale.intervals.map(interval => {
            currentInterval += parseInt(interval);
            const newScaleNote = allNotes[(currentInterval % allNotes.length + allNotes.length) % allNotes.length];
            newScaleNote.octave = rootNote.octave;
            return newScaleNote;
        });

        /* end with the root on top */
        scaleNotes.push(new Note(rootNote.name, rootNote.sharp, rootNote.flat, rootNote.octave + 1));
        return new Scale(`${scaleNotes[0].print()} ${scale.name}`, scaleNotes);
    };
}

export default ScaleFactory;