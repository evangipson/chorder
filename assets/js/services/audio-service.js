import { getRandomElement } from '../extensions/collection-extensions';
import Note from '../types/note';
import Scale from '../types/scale';

/** Responsible for playing audio throughout the application. */
class AudioService {
    /** @type {AudioContext} A `static`-initialized context for the whole `AudioService`. */
    static context;
    /** @type {GainNode} A `static`-initialized gain node to control the overall playback volume. */
    static mainGain;
    /** @type {number} The volume (from 0.0 to 0.1) of the overall playback. */
    static #volume;
    /** @type {AudioBuffer} A `static`-initialized reverb buffer filled with decoded audio data for the `AudioService`. */
    static reverbAudioBuffer;

    /* static initialization block, is run when the class is defined
     * and maintains 'this' references to statics */
    static {
        /* create a new audio context for the service */
        this.context = new (window.AudioContext)();
        this.#volume = 0.1;

        /* hook up the main gain node to control overall volume */
        this.mainGain = this.context.createGain();
        this.mainGain.gain.setValueAtTime(this.#volume, this.context.currentTime);
        this.mainGain.connect(this.context.destination);

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
        newGainNode.gain.setValueAtTime(1.0, AudioService.context.currentTime);
        return newGainNode;
    };
    
    static #setFadesOnGainNode = (gainNode, duration = 1, relativeVolume = 1.0) => {
        gainNode.gain.setValueAtTime(Number.EPSILON, AudioService.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(relativeVolume, AudioService.context.currentTime + (duration / 10));
        gainNode.gain.setValueAtTime(relativeVolume, AudioService.context.currentTime + ((duration / 10) + 0.01));
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
        reverbNode.connect(AudioService.mainGain);

        // handle disconnection when the nodes are done
        reverbNode.addEventListener('ended', () => {
            oscillatorNode.disconnect(gainNode);
            gainNode.disconnect(reverbNode);
            reverbNode.disconnect(AudioService.mainGain);
        });
    };

    static #getQuarterNoteSeconds = (bpm) => {
        const beatsPerSecond = bpm / 60;
        const quarterNoteDuration = 1 / beatsPerSecond;
        return quarterNoteDuration;
    };

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

        AudioService.playChord(chord.notes, totalPhraseTime, 0.5);
        for (let note in notes) {
            if (AudioService.context.state == 'closed') {
                return;
            }
            AudioService.playNote(notes[note].note, notes[note].time);
            await new Promise(resolve => setTimeout(resolve, notes[note].wait));
        }

        return notes;
    };

    static #sendKeyboardStopEvent = () => {
        const keyboardElement = document.querySelector('.chorder__keyboard');
        const musicKeyPressEvent = new Event('musickeysdone');
        keyboardElement?.dispatchEvent(musicKeyPressEvent);
    };

    static #sendKeyboardEvent = (note, duration, isChord) => {
        const keyboardElement = document.querySelector('.chorder__keyboard');
        const musicKeyPressEvent = new CustomEvent('musickeypress', {
            detail: {
                note: `${note.print()}${note.octave}`,
                duration: duration,
                chord: isChord,
            },
        });
        keyboardElement?.dispatchEvent(musicKeyPressEvent);
    };

    static #reinitializeContext = () => {
        if (AudioService.context.state != 'closed') {
            return;
        }

        /* re-create the new context */
        AudioService.context = new (window.AudioContext)();

        /* hook up a new main gain node to control overall volume */
        AudioService.mainGain = AudioService.context.createGain();
        AudioService.mainGain.gain.setValueAtTime(AudioService.#volume, AudioService.context.currentTime);
        AudioService.mainGain.connect(AudioService.context.destination);
    };

    /**
     * Sets the new volume for any sounds played afterwards.
     * @param {number} newVolume 
     */
    static setVolume = (newVolume) => {
        AudioService.#volume = newVolume;
        AudioService.mainGain.gain.setValueAtTime(AudioService.#volume, AudioService.context.currentTime);
    };

    /**
     * Plays the `note`, which has it's own gain node.
     * @param {Note} note The `Note` to play.
     * @param {number} duration The length of the note, in seconds.
     */
    static playNote = async (note, duration) => {
        // create the oscillator for the note
        AudioService.#reinitializeContext();
        const osc = AudioService.context.createOscillator();
        osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
        osc.frequency.value = note.hz;

        // hook up post-processing
        AudioService.#setPostProcessingNodes(osc, duration);

        // send the keyboard event
        AudioService.#sendKeyboardEvent(note, duration, false);

        // play the note
        osc.start();
        osc.stop(AudioService.context.currentTime + duration);
    };

    /**
     * Plays the `notes` all together, using only one gain node for the whole chord.
     * @param {Note[]} notes 
     * @param {number} duration
     * @param {number} relativeVolume
     */
    static playChord = async (notes, duration = 1, relativeVolume = 1.0) => {
        // instantiate oscillators for each note
        AudioService.#reinitializeContext();
        const oscillators = [];
        notes.forEach(note => {
            const osc = AudioService.context.createOscillator();
            osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
            osc.frequency.value = note.hz;

            // hook up post-processing
            AudioService.#setPostProcessingNodes(osc, duration, relativeVolume);

            // send the keyboard event
            AudioService.#sendKeyboardEvent(note, duration, true);

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
        AudioService.#reinitializeContext();
        notes.sort((a, b) => a.hz - b.hz);
        for(let note in notes) {
            await AudioService.playNote(notes[note], 0.25);
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    };

    /**
     * Continually will play the `chords` with phrases on top of them.
     * @param {Chord[]} chords 
     * @param {Scale} scale
     * @param {number} bpm
     */
    static playSong = async (chords, scale, bpm) => {
        AudioService.#reinitializeContext();
        let chordIndex = 0;
        while (AudioService.context.state != 'closed') {
            await AudioService.#playChordAndPhrase(chords[(chordIndex % chords.length + chords.length) % chords.length], scale, bpm);
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