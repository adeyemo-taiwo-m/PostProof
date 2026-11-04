export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function excerpt(value: string, length = 150) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}
