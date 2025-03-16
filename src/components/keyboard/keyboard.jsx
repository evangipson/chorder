import React, { useEffect, useState } from 'react';
import Note from '../../../assets/js/types/note';
import { allNotes } from '../../../assets/js/constants/note-constants';
import './keyboard.css';

const getAllKeys = () => {
    const allKeys = [];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < allNotes.length; j++) {
            const keyboardNote = new Note(allNotes[j].name);
            keyboardNote.flat = allNotes[j].flat;
            keyboardNote.sharp = allNotes[j].sharp;
            keyboardNote.octave = i;
            allKeys.push(keyboardNote);
        }
    }

    return allKeys;
};

const setupKeyboardEventListener = () => {
    const keyboardElement = document.querySelector('.chorder__keyboard');
    keyboardElement.addEventListener('musickeypress', musicKeyPressEvent => {
        const keyToHighlight = musicKeyPressEvent.detail.note;
        const timeToHighlight = musicKeyPressEvent.detail.duration;

        const keyElement = keyboardElement.querySelector(`[data-key=${keyToHighlight}]`);
        const keyIsAlreadyPressed = keyElement?.classList.contains('chorder__keyboard-key--active');
        if (keyIsAlreadyPressed) {
            return;
        }

        keyElement?.classList.add('chorder__keyboard-key--active');
        setTimeout(() => {
            keyElement?.classList.remove('chorder__keyboard-key--active');
        }, timeToHighlight * 1000);
    });
};

const setupKeyboardStopEventListener = () => {
    const keyboardElement = document.querySelector('.chorder__keyboard');
    keyboardElement.addEventListener('musickeysdone', () => {
        const keyElements = keyboardElement.querySelectorAll(`[data-key]`);
        keyElements.forEach(key => key.classList.remove('chorder__keyboard-key--active'));
    });
};

const Keyboard = () => {
    useEffect(() => {
        setupKeyboardEventListener();
        setupKeyboardStopEventListener();
    }, []);

    return (
        <div className='chorder__keyboard'>
            {getAllKeys().map((key, index) => {
                const keyClassList = [
                    'chorder__keyboard-key',
                    key.flat ? 'chorder__keyboard-key--flat' : null,
                    key.sharp ? 'chorder__keyboard-key--sharp' : null,
                ];
                return (<div key={`${index}-${key.name}`} data-key={`${key.print()}${key.octave}`} className={keyClassList.filter(x => x).join(' ')}></div>);
            })}
        </div>
    );
};

export default Keyboard;