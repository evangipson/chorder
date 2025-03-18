import { getRandomElement } from '../extensions/collection-extensions';
import Note from '../types/note';
import Scale from '../types/scale';

/** Responsible for playing audio throughout the application. */
class AudioService {
    /** @type {AudioContext} A `static`-initialized context for the whole `AudioService`. */
    static context;
    /** @type {GainNode} A `static`-initialized gain node to control the overall playback volume. */
    static mainGain;
    /** @type {ConvolverNode} A `static`-initialized reverb node to control the overall playback reverb. */
    static mainReverb;
    /** @type {BiquadFilterNode} A `static`-initialized biquad filter node to control the overall warmness of the tone. */
    static mainBiquadFilter;
    /** @type {number} The volume (from 0.0 to 0.1) of the overall playback. */
    static #volume;

    /* static initialization block, is run when the class is defined
     * and maintains 'this' references to statics */
    static {
        /* create a new audio context for the service */
        this.context = new (window.AudioContext)();
        this.#volume = 0.1;

        /* only initialize the main reverb node and download it's audio data once */
        this.mainReverb = this.context.createConvolver();
        fetch('/audio/long-reverb.wav')
            .then(async reverbFile => await reverbFile.arrayBuffer())
            .then(async arrayBuffer => await this.context.decodeAudioData(arrayBuffer))
            .then(buffer => this.mainReverb.buffer = buffer);

        /* create one overall gain node to control the whole app's volume */
        this.mainGain = this.context.createGain();
        this.mainGain.gain.setValueAtTime(this.#volume, this.context.currentTime);

        /* create the filtering node that lives right after the source oscillators */
        this.mainBiquadFilter = this.context.createBiquadFilter();
        this.mainBiquadFilter.type = 'lowpass';
        this.mainBiquadFilter.frequency.setValueAtTime(1200, this.context.currentTime);
        this.mainBiquadFilter.gain.setValueAtTime(100, this.context.currentTime);

        /* [other osc] -> biquad -> reverb -> gain -> speakers */
        this.mainBiquadFilter.connect(this.mainGain);
        this.mainGain.connect(this.mainReverb);
        this.mainReverb.connect(this.context.destination);
    }

    static #setPostProcessingNodes = (oscillatorNode) => {
        // connect up the oscillator node (osc -> reverb -> gain -> destination)
        oscillatorNode.connect(AudioService.mainBiquadFilter);

        // handle disconnection when the the oscillator is done
        oscillatorNode.addEventListener('ended', () => oscillatorNode.disconnect(AudioService.mainBiquadFilter));
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

        AudioService.playChord(chord.notes, totalPhraseTime);
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

        /* only initialize the main reverb node and download it's audio data once */
        AudioService.mainReverb = AudioService.context.createConvolver();
        fetch('/audio/long-reverb.wav')
            .then(async reverbFile => await reverbFile.arrayBuffer())
            .then(async arrayBuffer => await AudioService.context.decodeAudioData(arrayBuffer))
            .then(buffer => AudioService.mainReverb.buffer = buffer);

        /* hook up a new main gain node to control overall volume */
        AudioService.mainGain = AudioService.context.createGain();
        AudioService.mainGain.gain.setValueAtTime(AudioService.#volume, AudioService.context.currentTime);

        /* create the filtering node that lives right after the source oscillators */
        AudioService.mainBiquadFilter = AudioService.context.createBiquadFilter();
        AudioService.mainBiquadFilter.type = 'lowpass';
        AudioService.mainBiquadFilter.frequency.setValueAtTime(200, AudioService.context.currentTime);
        AudioService.mainBiquadFilter.gain.setValueAtTime(100, AudioService.context.currentTime);

        /* [other osc] -> biquad -> reverb -> gain -> speakers */
        AudioService.mainBiquadFilter.connect(AudioService.mainGain);
        AudioService.mainGain.connect(AudioService.mainReverb);
        AudioService.mainReverb.connect(AudioService.context.destination);
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
        AudioService.#setPostProcessingNodes(osc);

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
     */
    static playChord = async (notes, duration = 1) => {
        // instantiate oscillators for each note
        AudioService.#reinitializeContext();
        const oscillators = [];
        notes.forEach(note => {
            const osc = AudioService.context.createOscillator();
            osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
            osc.frequency.value = note.hz;

            // hook up post-processing
            AudioService.#setPostProcessingNodes(osc);

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