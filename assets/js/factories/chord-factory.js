import { allNotes } from '../constants/note-constants';
import Chord from '../types/chord';
import Note from '../types/note';

class ChordFactory {
    /**
     * Creates a new `Chord` with the provided amount of `notes`.
     * @param {number} notes 
     * @param {Note} rootNote
     * @returns {Chord}
     */
    static createChord = (notes, rootNote) => {
        const initialInterval = allNotes.findIndex(note => {
            return note.name == rootNote.name && note.sharp == rootNote.sharp && note.flat == rootNote.flat;
        }) + (12 * rootNote.octave);

        let currentInterval = initialInterval;
        let chordNotes = [];
        for (let i = 0; i < notes; i++) {
            currentInterval += Math.floor(Math.random() * 6) + 2;
            const newChordNote = allNotes[currentInterval % allNotes.length];
            newChordNote.octave = Math.floor(currentInterval / allNotes.length);
            chordNotes.push(newChordNote);
        }

        return new Chord(`${chordNotes[0].print()}`, chordNotes[0], chordNotes);
    };
}

export default ChordFactory;