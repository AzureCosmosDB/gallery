export function formatEventDate(dateISO: string) {
  const d = new Date(dateISO);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
