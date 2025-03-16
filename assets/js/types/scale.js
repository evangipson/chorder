import Note from './note';

/** A series of `Note`s. */
class Scale {
    name;
    notes;

    /**
     * Creates a new `Scale`.
     * @param {string} name 
     * @param {Note[]} notes 
     */
    constructor(name, notes) {
        this.name = name;
        this.notes = notes;
    }
}

export default Scale;