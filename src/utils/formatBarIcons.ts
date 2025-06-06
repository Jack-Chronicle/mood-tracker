/**
 * Formats a progress bar using a string of icons and a value.
 * @param barIcons - String of icons from full to empty.
 * @param value - Value from 0 to 100.
 * @param iconCount - Number of icons to display.
 * @returns The formatted bar string.
 */
export function formatBarIcons(barIcons: string, value: number, iconCount: number): string {
  if (!barIcons || barIcons.length < 2 || iconCount < 1) return value.toString();
  const levels = barIcons.length;
  const percent = Math.max(0, Math.min(100, value));
  let bar = "";
  for (let i = 0; i < iconCount; i++) {
    // For each icon, determine how full it should be
    const iconPercent = 100 * (i + 1) / iconCount;
    const rel = percent - (100 * i / iconCount);
    let iconLevel = Math.round((1 - rel / (100 / iconCount)) * (levels - 1));
    if (percent >= iconPercent) iconLevel = 0; // full
    else if (percent <= 100 * i / iconCount) iconLevel = levels - 1; // empty
    iconLevel = Math.max(0, Math.min(levels - 1, iconLevel));
    bar += barIcons[iconLevel];
  }
  return bar;
}
