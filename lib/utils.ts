export function formatDate(date: string, month: "long" | "short" = "long") {
  return new Date(date).toLocaleDateString("en-US", {
    month,
    year: "numeric",
    timeZone: "UTC",
  });
}
