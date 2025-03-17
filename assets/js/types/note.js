/** Represents a musical note. */
class Note {
    /** The reference note for determining semitone index for a `Note` */
    static referenceNote = new Note('A');
    /** The reference hertz value for determining hertz for a `Note` */
    static referenceNoteHz = 440.0;

    #index;
    #hz;

    /** The base name for this `Note` (won't contain sharp, flat, or octave). */
    name;
    /** Determines if this `Note` is sharp (up a semitone). */
    sharp;
    /** Determines if this `Note` is flat (down a semitone). */
    flat;
    /** Determines how high in register this `Note` is. */
    octave;

    /**
     * Creates a new `Note`.
     * @param {string} name 
     * @param {bool} sharp
     * @param {bool} flat
     * @param {number} octave
     */
    constructor(name, sharp = false, flat = false, octave = 3) {
        this.name = name;
        this.sharp = sharp;
        this.flat = flat;
        this.octave = octave;
    }

    /** The relative semitone index for this `Note`. */
    get index() {
        this.#index ??= this.#findIndex();
        return this.#index;
    }

    /** The hertz (rounded to 8 decimal places) for this `Note`. */
    get hz() {
        this.#hz ??= this.#findHz().toPrecision(8);
        return this.#hz;
    }

    #findIndex() {
        let basicIndex = 0;
        switch (this.name) {
            case 'D': basicIndex = 2; break;
            case 'E': basicIndex = 4; break;
            case 'F': basicIndex = 5; break;
            case 'G': basicIndex = 7; break;
            case 'A': basicIndex = 9; break;
            case 'B': basicIndex = 11; break;
            default: break;
        }

        if (this.flat) {
            basicIndex--;
        }

        if (this.sharp) {
            basicIndex++;
        }

        return basicIndex;
    }

    #findHz() {
        /* if we are getting hertz for an exact match of the reference note, short-circuit */
        if (this.index == Note.referenceNote.index && this.octave == Note.referenceNote.octave) {
            return Note.referenceNoteHz;
        }

        let distanceFromReference = 0;
        if (this.index != Note.referenceNote.index) {
            distanceFromReference = this.index > Note.referenceNote.index
                ? this.index - Note.referenceNote.index
                : (Note.referenceNote.index - this.index) * -1;
        }
        if (this.octave != Note.referenceNote.octave) {
            const octavesFromReference = this.octave > Note.referenceNote.octave
                ? this.octave - Note.referenceNote.octave
                : (Note.referenceNote.octave - this.octave) * -1;

            distanceFromReference += (12 * octavesFromReference);
        }

        const noteHz = Note.referenceNoteHz * Math.pow(2, distanceFromReference / 12.0);

        return noteHz;
    };

    /** Prints out the name along with flat and sharp symbols for this `Note` */
    print() {
        const flatSymbol = '♭';
        const sharpSymbol = '♯';
        const nameParts = [
            this.name,
            this.flat && !this.sharp ? flatSymbol : null,
            this.sharp && !this.flat ? sharpSymbol : null,
        ];

        return nameParts.join('');
    }
}

export default Note;