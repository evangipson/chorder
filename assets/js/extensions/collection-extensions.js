/**
 * Gets a random element from an `array`.
 * @param {Array} array 
 * @returns {any|false} A random element from the `array`, or `false` by default.
 */
const getRandomElement = (array) => array?.length && array[Math.floor(Math.random() * array.length)];

/**
 * Gets a wrapped representation of the `index` for the `array`.
 * @param {Array} array The array to wrap the `index` around.
 * @param {number} index The index to wrap.
 * @returns {number|false} The wrapped `index`, or `false` by default.
 */
const getWrappedIndex = (array, index) => array?.length && ((index % array.length) + array.length) % array.length;

export { getRandomElement, getWrappedIndex };