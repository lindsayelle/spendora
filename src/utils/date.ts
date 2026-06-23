import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfToday,
  startOfWeek
} from "date-fns";

export function todayISO() {
  return format(startOfToday(), "yyyy-MM-dd");
}

export function displayDate(isoDate: string) {
  return format(parseISO(isoDate), "MMM d, yyyy");
}

export function displayMonth(yyyyMm: string) {
  return format(parseISO(`${yyyyMm}-01`), "MMMM yyyy");
}

export function monthKey(date = new Date()) {
  return format(date, "yyyy-MM");
}

export function isWeekendDate(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function currentRanges(now = new Date()) {
  return {
    today: { start: startOfToday(), end: addDays(startOfToday(), 1) },
    week: { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) },
    month: { start: startOfMonth(now), end: endOfMonth(now) }
  };
}

export function isDateInRange(isoDate: string, from?: string, to?: string) {
  const date = parseISO(isoDate);
  if (from && isBefore(date, parseISO(from))) return false;
  if (to && isAfter(date, parseISO(to))) return false;
  return true;
}

export function isISODateToday(isoDate: string) {
  return isSameDay(parseISO(isoDate), new Date());
}

export function isInIntervalDate(isoDate: string, start: Date, end: Date) {
  return isWithinInterval(parseISO(isoDate), { start, end });
}

export function daysElapsedInMonth(now = new Date()) {
  return differenceInCalendarDays(now, startOfMonth(now)) + 1;
}

export function daysInMonth(now = new Date()) {
  return endOfMonth(now).getDate();
}

export function daysElapsedInWeek(now = new Date()) {
  return differenceInCalendarDays(now, startOfWeek(now, { weekStartsOn: 1 })) + 1;
}

export function countWeekdaysAndWeekends(month: string) {
  const start = parseISO(`${month}-01`);
  const days = endOfMonth(start).getDate();
  let weekdays = 0;
  let weekends = 0;
  for (let day = 1; day <= days; day += 1) {
    if (isWeekendDate(new Date(start.getFullYear(), start.getMonth(), day))) weekends += 1;
    else weekdays += 1;
  }
  return { weekdays, weekends, days };
}
