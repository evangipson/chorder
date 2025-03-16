import Note from './note';

/** A series of `Note` objects to be played sequentially. */
class Scale {
    /** The name of this `Scale`. */
    name;
    /** The collection of `Note` objects for this `Scale`. */
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