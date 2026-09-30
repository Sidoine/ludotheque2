export const PARIS_TIME_ZONE = "Europe/Paris";

const parisPartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PARIS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function getParisParts(date: Date) {
  const parts = parisPartsFormatter.formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

export function getParisDateTime(date = new Date()) {
  const parts = getParisParts(date);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function parseParisDateTime(date: unknown, time: unknown): Date | null {
  if (
    typeof date !== "string" ||
    typeof time !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallTime = Date.UTC(year, month - 1, day, hour, minute);
  const utcDate = new Date(wallTime);
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  let instant = wallTime;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getParisParts(new Date(instant));
    const representedTime = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    const adjustedInstant = wallTime - (representedTime - instant);
    if (adjustedInstant === instant) break;
    instant = adjustedInstant;
  }

  const parsed = new Date(instant);
  const parisDateTime = getParisDateTime(parsed);
  return parisDateTime.date === date && parisDateTime.time === time
    ? parsed
    : null;
}
