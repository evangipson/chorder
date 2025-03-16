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
}

export default Chord;