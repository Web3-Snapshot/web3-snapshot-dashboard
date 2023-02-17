import { formatLongNumbers, objectSort } from '../helpers';

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
    data: {
      '01ef4df3-7fda-46a1-8005-470e2b40ba48': {
        id: 2,
        name: 9,
        number: 0.132,
        more: 2000,
      },
      'b44d0d0d-c9d0-4ca1-94c5-57d675868616': {
        id: 1,
        name: 2,
        number: 10.2134,
        more: 3000,
      },
      '1a49433c-b951-45ec-b7ca-f90d678edc1c': {
        id: 4,
        name: 2,
        number: 1.033,
        more: 1,
      },
      '04325de8-2397-4af6-8d77-91bcff5cc58e': {
        id: 5,
        name: 2,
        number: 1.033,
        more: 2,
      },
      'fb6ce410-1f6e-4724-90fa-5c7f5231740d': {
        id: 3,
        name: 1,
        number: 0.001,
        more: 1000,
      },
    },
  };

  it('object sorting ascending', () => {
    const expectedResult = [
      'b44d0d0d-c9d0-4ca1-94c5-57d675868616',
      '01ef4df3-7fda-46a1-8005-470e2b40ba48',
      'fb6ce410-1f6e-4724-90fa-5c7f5231740d',
      '1a49433c-b951-45ec-b7ca-f90d678edc1c',
      '04325de8-2397-4af6-8d77-91bcff5cc58e',
    ];
    const sortedObj = objectSort(obj, 'asc', ['id']);

    expect(sortedObj).toStrictEqual(expectedResult);
  });

  it('object sorting descending', () => {
    const expectedResult = [
      '04325de8-2397-4af6-8d77-91bcff5cc58e',
      '1a49433c-b951-45ec-b7ca-f90d678edc1c',
      'fb6ce410-1f6e-4724-90fa-5c7f5231740d',
      '01ef4df3-7fda-46a1-8005-470e2b40ba48',
      'b44d0d0d-c9d0-4ca1-94c5-57d675868616',
    ];
    const sortedObj = objectSort(obj, 'desc', ['id']);

    expect(sortedObj).toStrictEqual(expectedResult);
  });

  it.skip('object sorting ascending with multiple criteria', () => {
    const expectedResult = [
      'fb6ce410-1f6e-4724-90fa-5c7f5231740d',
      '1a49433c-b951-45ec-b7ca-f90d678edc1c',
      '04325de8-2397-4af6-8d77-91bcff5cc58e',
      'b44d0d0d-c9d0-4ca1-94c5-57d675868616',
      '01ef4df3-7fda-46a1-8005-470e2b40ba48',
    ];
    const sortedObj = objectSort(obj, 'asc', ['name', 'number', 'more']);

    expect(sortedObj).toStrictEqual(expectedResult);
  });
});
