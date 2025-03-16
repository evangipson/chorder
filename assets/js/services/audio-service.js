import { getRandomElement } from '../extensions/collection-extensions';
import Note from '../types/note';
import Scale from '../types/scale';

class AudioService {
    static context;
    static volume;
    static reverbAudioBuffer;

    /* static initialization block, is run when the class is defined
     * and maintains 'this' references to statics */
    static {
        this.context = new (window.AudioContext)();
        this.volume = 0.1;

        /* grab the reverb tail audio file only once during initialization */
        fetch('/audio/long-reverb.wav')
            .then(async reverbFile => await reverbFile.arrayBuffer())
            .then(async arrayBuffer => {
                this.reverbAudioBuffer = await this.context.decodeAudioData(arrayBuffer);
            });
    }

    static #createReverbNode = async () => {
        if (!AudioService.reverbAudioBuffer) {
            return;
        }

        const newReverbNode = AudioService.context.createConvolver();
        newReverbNode.buffer = AudioService.reverbAudioBuffer;
        return newReverbNode;
    };
    
    static #createGainNode = () => {
        const newGainNode = AudioService.context.createGain();
        newGainNode.gain.setValueAtTime(AudioService.volume, AudioService.context.currentTime);
        return newGainNode;
    };
    
    static #setFadesOnGainNode = (gainNode, duration = 1, volume = this.volume) => {
        gainNode.gain.setValueAtTime(Number.EPSILON, AudioService.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, AudioService.context.currentTime + (duration / 10));
        gainNode.gain.setValueAtTime(volume, AudioService.context.currentTime + ((duration / 10) + 0.01));
        gainNode.gain.linearRampToValueAtTime(Number.EPSILON, AudioService.context.currentTime + (duration - 0.01));
    };

    static #setPostProcessingNodes = async (oscillatorNode, duration, volume) => {
        // instantiate gain and reverb nodes for the note
        const gainNode = AudioService.#createGainNode();
        const reverbNode = await AudioService.#createReverbNode();

        // set up the gain node to fade
        AudioService.#setFadesOnGainNode(gainNode, duration, volume);

        // connect up the nodes (osc -> reverb -> gain -> destination)
        oscillatorNode.connect(gainNode);
        gainNode.connect(reverbNode);
        reverbNode.connect(AudioService.context.destination);

        // handle disconnection when the nodes are done
        reverbNode.addEventListener('ended', () => {
            oscillatorNode.disconnect(gainNode);
            gainNode.disconnect(reverbNode);
            reverbNode.disconnect(AudioService.context.destination);
        });
    };

    static #getQuarterNoteSeconds = (bpm) => {
        const beatsPerSecond = bpm / 60;
        const quarterNoteDuration = 1 / beatsPerSecond;
        return quarterNoteDuration;
    };

    static #sendKeyboardStopEvent = () => {
        const keyboardElement = document.querySelector('.chorder__keyboard');
        const musicKeyPressEvent = new Event('musickeysdone');
        keyboardElement?.dispatchEvent(musicKeyPressEvent);
    };

    /**
     * Sends an event containing information about the `note`
     * and `duration` to the `<Keyboard>` React component.
     * @param {Note} note 
     * @param {number} duration 
     */
    static #sendKeyboardEvent = (note, duration) => {
        const keyboardElement = document.querySelector('.chorder__keyboard');
        const musicKeyPressEvent = new CustomEvent('musickeypress', {
            detail: {
                note: `${note.print()}${note.octave}`,
                duration: duration
            }
        });
        keyboardElement?.dispatchEvent(musicKeyPressEvent);
    };

    /**
     * Plays the `note`, which has it's own gain node.
     * @param {Note} note The `Note` to play.
     * @param {number} duration The length of the note, in seconds.
     */
    static playNote = async (note, duration) => {
        if (AudioService.context.state == 'closed') {
            AudioService.context = new (window.AudioContext)();
        }

        // create the oscillator for the note
        const osc = AudioService.context.createOscillator();
        osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
        osc.frequency.value = note.hz;

        // hook up post-processing
        AudioService.#setPostProcessingNodes(osc, duration);

        // send the keyboard event
        AudioService.#sendKeyboardEvent(note, duration);

        // play the note
        osc.start();
        osc.stop(AudioService.context.currentTime + duration);
    };

    /**
     * Plays the `notes` all together, using only one gain node for the whole chord.
     * @param {Note[]} notes 
     * @param {number} duration
     */
    static playChord = async (notes, duration = 1, volume = AudioService.volume) => {
        if (AudioService.context.state == 'closed') {
            AudioService.context = new (window.AudioContext)();
        }

        // instantiate oscillators for each note
        const oscillators = [];
        notes.forEach(note => {
            const osc = AudioService.context.createOscillator();
            osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
            osc.frequency.value = note.hz;

            // hook up post-processing
            AudioService.#setPostProcessingNodes(osc, duration, volume);

            // send the keyboard event
            AudioService.#sendKeyboardEvent(note, duration);

            oscillators.push(osc);
        });

        // start the oscillator
        for(let osc in oscillators) {
            oscillators[osc].start();
            oscillators[osc].stop(AudioService.context.currentTime + duration);
        }
    };

    /**
     * Plays the `notes` one at a time.
     * @param {Note[]} notes 
     */
    static playScale = async (notes) => {
        if (AudioService.context.state == 'closed') {
            AudioService.context = new (window.AudioContext)();
        }

        notes.sort((a, b) => a.hz - b.hz);
        for(let note in notes) {
            await AudioService.playNote(notes[note], 0.25);
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    };

    /**
     * Plays the `chord` with a phrase on top of it.
     * @param {Chord} chord
     * @param {Scale} scale
     * @param {number} bpm
     * @returns {Note[]} The phrase that was chosen to play.
     */
    static #playChordAndPhrase = async (chord, scale, bpm) => {
        /* play a melody over the `chord` */
        const melodyNotes = Math.floor(Math.random() * 12) + 5;
        const notes = [];
        let totalPhraseTime = 0;
        let lastDuration = 0;
        let pickedNote = getRandomElement(scale.notes);
        let newNoteIndex = scale.notes.findIndex(note => note.name == pickedNote.name);
        for (let i = 0; i < melodyNotes; i++) {
            const newNote = scale.notes[(newNoteIndex % scale.notes.length + scale.notes.length) % scale.notes.length];
            newNote.octave = chord.notes[0].octave + Math.floor(Math.random() * 2);

            let duration = lastDuration == 0
                ? AudioService.#getQuarterNoteSeconds(bpm)
                : lastDuration;
            if (Math.random() > 0.7) {
                if (Math.random() > 0.6) {
                    duration = AudioService.#getQuarterNoteSeconds(bpm) * 1.5;
                }
                else if (Math.random() > 0.6) {
                    duration = AudioService.#getQuarterNoteSeconds(bpm) * 2;
                }
                else if (Math.random() > 0.4) {
                    duration = AudioService.#getQuarterNoteSeconds(bpm);
                }
                else {
                    duration = AudioService.#getQuarterNoteSeconds(bpm) * 0.5;
                }
            }
            lastDuration = duration;

            const waitTime = Math.floor(Math.random() > 0.5
                ? ((Math.random() > 0.5 ? AudioService.#getQuarterNoteSeconds(bpm) * 2 : AudioService.#getQuarterNoteSeconds(bpm) * 4) + (duration * 1000))
                : duration * 1000);

            totalPhraseTime += duration + (waitTime / 1000);
            notes.push({ note: newNote, time: duration, wait: waitTime });
            
            if (Math.random() > 0.5) {
                newNoteIndex += Math.floor(Math.random() * 4);
            }
            else if (Math.random() > 0.5) {
                newNoteIndex -= Math.floor(Math.random() * 4);
            }
            else if (Math.random() > 0.4) {
                newNoteIndex += 5;
            }
            else if (Math.random() > 0.2) {
                newNoteIndex += 1;
            }
            else if (Math.random() > 0.2) {
                newNoteIndex -= 1;
            }
        }

        AudioService.playChord(chord.notes, totalPhraseTime, AudioService.volume * 0.5);
        for (let note in notes) {
            if (AudioService.context.state == 'closed') {
                return;
            }
            AudioService.playNote(notes[note].note, notes[note].time);
            await new Promise(resolve => setTimeout(resolve, notes[note].wait));
        }

        return notes;
    };

    /**
     * Continually will play the `chords` with phrases on top of them.
     * @param {Chord[]} chords 
     * @param {Scale} scale
     * @param {number} bpm
     */
    static playSong = async (chords, scale, bpm) => {
        if (AudioService.context.state == 'closed') {
            AudioService.context = new (window.AudioContext)();
        }

        let chordIndex = 0;
        while (AudioService.context.state != 'closed') {
            const phrase = await AudioService.#playChordAndPhrase(chords[(chordIndex % chords.length + chords.length) % chords.length], scale, bpm);
            chordIndex++;
        }
    };

    /** Stops the audio and sends a keyboard event to remove active keys. */
    static stopAudio = () => {
        AudioService.context.close();
        AudioService.#sendKeyboardStopEvent();
    };
}

export default AudioService;