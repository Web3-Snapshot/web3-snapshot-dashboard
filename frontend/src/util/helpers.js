export function formatLongNumbers(value) {
  if (!value || value === '0') {
    return '-';
  }

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
