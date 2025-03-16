import Note from './note';

/** Two or more `Note`s. */
class Chord {
    name;
    root;
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