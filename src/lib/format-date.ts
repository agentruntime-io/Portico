/** Release dates are calendar dates: always format in UTC so the day never shifts. */
export function formatReleaseDate(iso: string, locale = "en-US"): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
