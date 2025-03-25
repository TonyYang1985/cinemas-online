import _ from 'lodash';

// full alphabet
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Sort alphabet by specified count and order
 * @param {number} count - The number of letters to be truncated
 * @param {string} order - Sorting direction, 'asc' for ascending, 'desc' for descending
 * @returns {string} Sorted letter string
 */
export function sortAlphabet(count: number, order: string = 'desc') {
  //clamp  valid count
  const validCount = _.clamp(count, 1, alphabet.length);
  //take specified count
  const slicedLetters = _.take(alphabet, validCount);
  // sort by asc
  let sortedLetters;
  if (order.toLowerCase() === 'asc') {
    sortedLetters = _.sortBy(slicedLetters);
  } else {
    // sort by desc reverse
    sortedLetters = _.orderBy(slicedLetters, [], ['desc']);
  }
  return sortedLetters;
}
