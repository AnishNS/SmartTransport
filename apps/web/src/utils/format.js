// Small formatting helpers shared across the app.

// Builds initials from a person's name, e.g. "Vijay Raghavan" -> "VR".
// Falls back to the first character when only one name part exists, and to an
// empty string when there is no name.
export function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}