export type NormalizedIdentifier = { value: string; warnings: string[] };

export function normalizeIdentifier(input: unknown, options: { expectedLengths?: number[]; field: string }): NormalizedIdentifier {
  const warnings: string[] = [];
  const raw = String(input ?? "").trim();
  if (!raw) return { value: "", warnings: [`${options.field} is empty`] };
  let value = raw.replace(/\s+/g, "");
  if (/^\d+(\.0+)?$/.test(value)) value = value.replace(/\.0+$/, "");
  else if (/^\d+(?:\.\d+)?e\+\d+$/i.test(value)) { value = expandScientificNotation(value); warnings.push(`${options.field} "${raw}" was scientific notation; verify exact original digits because spreadsheet exports may have rounded it.`); }
  if (!/^\d+$/.test(value)) warnings.push(`${options.field} "${raw}" contains non-numeric characters.`);
  if (options.expectedLengths?.length && !options.expectedLengths.includes(value.length)) warnings.push(`${options.field} "${value}" length is ${value.length}; expected ${options.expectedLengths.join(" or ")} digits.`);
  return { value, warnings };
}

function expandScientificNotation(value: string): string { const [coefficient, exponentText] = value.toLowerCase().split("e+"); const exponent = Number(exponentText); const [whole, decimal = ""] = coefficient.split("."); const digits = `${whole}${decimal}`; const zeros = exponent - decimal.length; if (!Number.isFinite(exponent) || zeros < 0) return value; return `${digits}${"0".repeat(zeros)}`; }
export function buildBinLabel(zone: string, aisle: string, rack: string, level: string) { return [zone, aisle, rack, level].filter(Boolean).join("-"); }
export function normalizeBinPart(input: unknown) { const value = String(input ?? "").trim(); return value === "(Unspecified)" ? "" : value; }
