/** Calendar date in America/New_York (YYYY-MM-DD). All devices share the same "today" boundary. */
export function getEasternDateString(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}
