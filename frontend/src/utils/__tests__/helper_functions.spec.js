import { formatLongNumbers, objectSort } from '../helper_functions';

describe('Number formatting', function () {
  it('should abbreviate large numbers by appending quantifier chars', function () {
    expect(formatLongNumbers('2000000000000')).toBe('2T');
    expect(formatLongNumbers('200000000000')).toBe('200B');
    expect(formatLongNumbers('2000000000')).toBe('2B');
    expect(formatLongNumbers('200000000')).toBe('200M');
    expect(formatLongNumbers('2000000')).toBe('2M');
    expect(formatLongNumbers('200000')).toBe('200K');
    expect(formatLongNumbers('2000')).toBe('2K');
    expect(formatLongNumbers('200')).toBe('200');
    expect(formatLongNumbers('200.12')).toBe('200.1');
  });

  it('should return a single dash for values which are effectively zero', function () {
    expect(formatLongNumbers(null)).toBe('-');
    expect(formatLongNumbers(0)).toBe('-');
    expect(formatLongNumbers('0')).toBe('-');
    expect(formatLongNumbers('')).toBe('-');
  });
});

describe('Sorting', function () {
  const obj = {
    bitcoin: {
      id: 'bitcoin',
      name: 'Bitcoin',
      number: 0.132,
      more: 2000,
    },
    etherium: {
      id: 'etherium',
      name: 'Etherium',
      number: 10.2134,
      more: 3000,
    },
    solana: {
      id: 'solana',
      name: 'Solana',
      number: 1.033,
      more: 1,
    },
    ripple: {
      id: 'ripple',
      name: 'Ripple',
      number: 1.033,
      more: 2,
    },
    cardano: {
      id: 'cardano',
      name: 'Cardano',
      number: 0.001,
      more: 1000,
    },
  };

  it('object sorting ascending', () => {
    const expectedResult = ['bitcoin', 'cardano', 'etherium', 'ripple', 'solana'];
    const sortedObj = objectSort(obj, 'asc', ['id']);

    expect(sortedObj).toStrictEqual(expectedResult);
  });

  it('object sorting descending', () => {
    const expectedResult = ['solana', 'ripple', 'etherium', 'cardano', 'bitcoin'];
    const sortedObj = objectSort(obj, 'desc', ['id']);

    expect(sortedObj).toStrictEqual(expectedResult);
  });

  // This tests is currently not implemented. It tests a use case which may be
  // needed in the future, which is the sorting of an object by multiple criteria.
  it.skip('object sorting ascending with multiple criteria', () => {
    const expectedResult = []; // TODO
    const sortedObj = objectSort(obj, 'asc', ['name', 'number', 'more']);

    expect(sortedObj).toStrictEqual(expectedResult);
  });
});
