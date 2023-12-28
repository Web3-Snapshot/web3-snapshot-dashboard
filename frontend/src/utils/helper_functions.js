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
  if (!obj) {
    return [];
  }
  const dataObj = obj;

  return Object.entries(dataObj)
    .sort(([_, av], [__, bv]) => comparator(av, bv, order, orderBy))
    .reduce((acc, [currk, _]) => [...acc, currk], []);
}

export function capitalize(string) {
  return `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`;
}

export function convertSnakeCaseToStringRepresentation(string) {
  return string.split('_').reduce((acc, curr) => {
    acc += ` ${capitalize(curr)}`;
    return acc;
  }, '');
}

export function removeTags(str) {
  if (str === null || str === '') {
    return false;
  }

  return str.toString().replace(/(<([^>]+)>)/gi, '');
}

export function normalizeResponse(json) {
  return json.reduce(
    (acc, curr) => {
      const id = curr.id;
      acc.data = { ...acc.data, [id]: curr };
      acc.order.push(id);
      return acc;
    },
    { data: {}, order: [] }
  );
}
