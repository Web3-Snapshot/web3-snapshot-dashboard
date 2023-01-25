// Formatting of displayed text
export function formatLongNumbers(value) {
  if (!value || value === '0') {
    return '-';
  }

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

<<<<<<< HEAD
// Sorting
function comparison(a, b) {
  if (a > b) return -1;
  if (b > a) return 1;
  return 0;
}

function comparator(a, b, order, orderBy) {
  const multiplier = order === 'desc' ? 1 : -1;
  return orderBy.reduce((acc, curr) => {
    acc ||= comparison(a[curr], b[curr]);
    return multiplier * acc;
  }, false);
}

export function objectSort(obj, order, orderBy) {
  const dataObj = obj.data;
  return Object.entries(dataObj)
    .sort(([_, av], [__, bv]) => comparator(av, bv, order, orderBy))
    .reduce((acc, [currk, _]) => [...acc, currk], []);
=======
export function capitalize(string) {
  return `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`;
}

export function convertSnakeCaseToStringRrepresentation(string) {
  return string.split('_').reduce((acc, curr) => {
    acc += ` ${capitalize(curr)}`;
    return acc;
  }, '');
>>>>>>> 66d63478 (Change Supply to Tokenomics)
}
