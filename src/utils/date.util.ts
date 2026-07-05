/**
 * Normalise a date to midnight UTC so date-only comparisons are consistent.
 */
export const normaliseDateToMidnight = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Returns true if the given date is strictly before today (midnight UTC).
 */
export const isDateInPast = (date: Date): boolean => {
  const today = normaliseDateToMidnight(new Date());
  const target = normaliseDateToMidnight(date);
  return target < today;
};

/**
 * Returns true if the given date is today (UTC).
 */
export const isToday = (date: Date): boolean => {
  const today = normaliseDateToMidnight(new Date());
  const target = normaliseDateToMidnight(date);
  return target.getTime() === today.getTime();
};
