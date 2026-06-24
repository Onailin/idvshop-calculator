export const TOP_CALCULATOR_RESULTS = 1;

/** จำกัดยอดสูงสุดที่คำนวณได้ — กันเบราว์เซอร์ค้าง */
export const MAX_CALCULATOR_AMOUNT = 500_000;

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

  if (numeric > MAX_CALCULATOR_AMOUNT) {
    return String(MAX_CALCULATOR_AMOUNT);
  }

  return digits;
}

export function clampCalculatorAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.min(amount, MAX_CALCULATOR_AMOUNT);
}
