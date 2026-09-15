export const TOP_CALCULATOR_RESULTS = 1;

export const MAX_CALCULATOR_INPUT_DIGITS = 7;

export function sanitizeCalculatorAmountInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "").slice(0, MAX_CALCULATOR_INPUT_DIGITS);
  if (digits === "") {
    return "";
  }

  const numeric = Number(digits);
  if (!Number.isFinite(numeric)) {
    return "";
  }

  return digits;
}

export function clampCalculatorAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return amount;
}
