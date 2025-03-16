/**
 * Gets a random element from an `array`.
 * @param {Array} array 
 * @returns {any|false} A random element from the `array`, or `false` by default.
 */
const getRandomElement = (array) => array?.length && array[Math.floor(Math.random() * array.length)];

export { getRandomElement };