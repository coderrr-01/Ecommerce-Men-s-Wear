const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export type FitPreference = "slim" | "regular" | "relaxed";

export function suggestSize(
  heightCm: number,
  weightKg: number,
  fit: FitPreference,
  availableSizes: string[],
): string | null {
  const options = availableSizes
    .map((size) => ({ size, index: SIZE_ORDER.indexOf(size.toUpperCase()) }))
    .filter((option) => option.index >= 0);
  if (!options.length || heightCm < 130 || heightCm > 220 || weightKg < 35 || weightKg > 200) {
    return null;
  }

  const bmi = weightKg / (heightCm / 100) ** 2;
  let target = bmi < 18.5 ? 0 : bmi < 20.5 ? 1 : bmi < 23 ? 2 : bmi < 25.5 ? 3 : bmi < 28 ? 4 : 5;
  if (heightCm >= 185) target += 1;
  if (heightCm <= 160) target -= 1;
  if (fit === "slim") target -= 1;
  if (fit === "relaxed") target += 1;
  target = Math.max(0, Math.min(SIZE_ORDER.length - 1, target));

  return options.reduce((nearest, option) =>
    Math.abs(option.index - target) < Math.abs(nearest.index - target) ? option : nearest,
  ).size;
}
