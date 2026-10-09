// Date formatting utilities in Asia/Jakarta (WIB) timezone

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Returns current Date in Asia/Jakarta timezone
 */
export function getJakartaDate(date: Date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  // Asia/Jakarta is UTC + 7 hours
  return new Date(utc + 7 * 3600000);
}

/**
 * Formats date into: "2 Oktober 2026, 13.05"
 */
export function formatOrderDateTime(isoOrDate: string | Date = new Date()): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const jkt = getJakartaDate(d);

  const day = jkt.getDate();
  const month = INDONESIAN_MONTHS[jkt.getMonth()];
  const year = jkt.getFullYear();
  const hours = String(jkt.getHours()).padStart(2, '0');
  const minutes = String(jkt.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}.${minutes}`;
}

/**
 * Formats time only: "13.05"
 */
export function formatOrderTimeOnly(isoOrDate: string | Date = new Date()): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const jkt = getJakartaDate(d);
  const hours = String(jkt.getHours()).padStart(2, '0');
  const minutes = String(jkt.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
}
