import { allNotes } from '../constants/note-constants';
import { getWrappedIndex } from '../extensions/collection-extensions';
import Note from './note';

/** Represents two or more `Note` objects to be played in parallel. */
class Chord {
    /** The name of this `Chord`. */
    name;
    /** The root `Note` of this `Chord`. */
    root;
    /** All the `Note` objects in this `Chord`. */
    notes = [];

    /**
     * Creates a new `Chord`.
     * @param {string} name 
     * @param {Note} root 
     * @param {Note[]} notes 
     */
    constructor(name, root, notes) {
        this.name = name;
        this.root = root;
        this.notes = notes;
    }

    #hasInterval(interval) {
        const rootNote = allNotes.find(note => note.print() == this.root.print());
        const majorThird = allNotes[getWrappedIndex(allNotes, rootNote.index + interval)];
        return Boolean(this.notes.find(note => note.print() == majorThird.print()));
    }

    get hasMinorSecond() { return this.#hasInterval(1); }
    get hasMajorSecond() { return this.#hasInterval(2); }
    get hasMinorThird() { return this.#hasInterval(3); }
    get hasMajorThird() { return this.#hasInterval(4); }
    get hasFourth() { return this.#hasInterval(5); }
    get hasMinorFifth() { return this.#hasInterval(6); }
    get hasMajorFifth() { return this.#hasInterval(7); }
    get hasMinorSixth() { return this.#hasInterval(8); }
    get hasMajorSixth() { return this.#hasInterval(9); }
    get hasMinorSeventh() { return this.#hasInterval(10); }
    get hasMajorSeventh() { return this.#hasInterval(11); }

    get symbolName() {
        const chordIntervals = [
            { name: 'major', symbol: 'Δ', intervals: [this.hasMajorThird, this.hasMajorFifth]},
            { name: 'minor', symbol: 'm', intervals: [this.hasMinorThird, this.hasMajorFifth]},
            { name: 'augmented', symbol: '+', intervals: [this.hasMajorThird, this.hasMinorSixth]},
            { name: 'diminished', symbol: 'ᵒ', intervals: [this.hasMinorThird, this.hasMinorFifth]},
            { name: 'dominant seventh', symbol: 'Mᵐ⁷', intervals: [this.hasMajorThird, this.hasMajorFifth, this.hasMinorSeventh]},
            { name: 'major seventh', symbol: 'Δ⁷', intervals: [this.hasMajorThird, this.hasMajorFifth, this.hasMajorSeventh]},
            { name: 'minor-major seventh', symbol: 'mᴹ⁷', intervals: [this.hasMinorThird, this.hasMajorFifth, this.hasMajorSeventh]},
            { name: 'minor seventh', symbol: 'm⁷', intervals: [this.hasMinorThird, this.hasMajorFifth, this.hasMinorSeventh]},
            { name: 'augmented-major seventh', symbol: '+ᴹ⁷', intervals: [this.hasMajorThird, this.hasMinorSixth, this.hasMajorSeventh]},
            { name: 'augmented seventh', symbol: '+⁷', intervals: [this.hasMajorThird, this.hasMinorSixth, this.hasMinorSeventh]},
            { name: 'half-diminished seventh', symbol: 'ø⁷', intervals: [this.hasMinorThird, this.hasMinorFifth, this.hasMinorSeventh]},
            { name: 'diminished seventh', symbol: 'ᵒ⁷', intervals: [this.hasMinorThird, this.hasMinorFifth, this.hasMajorSixth]},
            { name: 'dominant seventh flat five', symbol: '⁷ᵈᶦᵐ⁵', intervals: [this.hasMajorThird, this.hasMinorFifth, this.hasMinorSeventh]},
        ];
        for (const chordType of chordIntervals.reverse()) {
            if (chordType.intervals.every(interval => interval)) {
                return `${this.root.print()}${chordType.symbol}`;
            }
        }
        return this.root.print();
    }

    get fullName() {
        const chordIntervals = [
            { name: 'major', symbol: 'Δ', intervals: [this.hasMajorThird, this.hasMajorFifth]},
            { name: 'minor', symbol: 'm', intervals: [this.hasMinorThird, this.hasMajorFifth]},
            { name: 'augmented', symbol: '+', intervals: [this.hasMajorThird, this.hasMinorSixth]},
            { name: 'diminished', symbol: 'ᵒ', intervals: [this.hasMinorThird, this.hasMinorFifth]},
            { name: 'dominant seventh', symbol: 'Mᵐ⁷', intervals: [this.hasMajorThird, this.hasMajorFifth, this.hasMinorSeventh]},
            { name: 'major seventh', symbol: 'Δ⁷', intervals: [this.hasMajorThird, this.hasMajorFifth, this.hasMajorSeventh]},
            { name: 'minor-major seventh', symbol: 'mᴹ⁷', intervals: [this.hasMinorThird, this.hasMajorFifth, this.hasMajorSeventh]},
            { name: 'minor seventh', symbol: 'm⁷', intervals: [this.hasMinorThird, this.hasMajorFifth, this.hasMinorSeventh]},
            { name: 'augmented-major seventh', symbol: '+ᴹ⁷', intervals: [this.hasMajorThird, this.hasMinorSixth, this.hasMajorSeventh]},
            { name: 'augmented seventh', symbol: '+⁷', intervals: [this.hasMajorThird, this.hasMinorSixth, this.hasMinorSeventh]},
            { name: 'half-diminished seventh', symbol: 'ø⁷', intervals: [this.hasMinorThird, this.hasMinorFifth, this.hasMinorSeventh]},
            { name: 'diminished seventh', symbol: 'ᵒ⁷', intervals: [this.hasMinorThird, this.hasMinorFifth, this.hasMajorSixth]},
            { name: 'dominant seventh flat five', symbol: '⁷ᵈᶦᵐ⁵', intervals: [this.hasMajorThird, this.hasMinorFifth, this.hasMinorSeventh]},
        ];
        for (const chordType of chordIntervals.reverse()) {
            if (chordType.intervals.every(interval => interval)) {
                return `${chordType.name}`;
            }
        }
        return `unknown chord`;
    }
}

export default Chord;