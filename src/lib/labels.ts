import { INTERESTS, SITUATIONS } from "@/content/pilot";

const AGE_BANDS: Record<string, string> = {
  "18_24": "18–24",
  "25_29": "25–29",
  "30_35": "30–35",
  "36_plus": "36 or older",
};

const OUTCOME_LABELS: Record<string, string> = {
  tried: "Tried it",
  booked_call: "Booked a call",
  collaborated: "Agreed to collaborate",
  no_action: "Did not take action",
};

function lookup(
  options: { code: string; label: string }[],
  code: string | null,
): string | null {
  if (!code) return null;
  const key = code.replaceAll(" ", "_");
  return options.find((option) => option.code === key)?.label ?? null;
}

export function labelAgeBand(code: string | null): string | null {
  if (!code) return null;
  return AGE_BANDS[code] ?? code;
}

export function labelSituation(code: string | null): string | null {
  return lookup(SITUATIONS, code) ?? code?.replaceAll("_", " ") ?? null;
}

export function labelInterest(code: string): string {
  return lookup(INTERESTS, code) ?? code.replaceAll("_", " ");
}

export function labelOutcome(code: string): string {
  return OUTCOME_LABELS[code] ?? code.replaceAll("_", " ");
}
