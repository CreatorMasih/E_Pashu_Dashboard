export function normalizeIndianMobile(value: string): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

export function sanitizeIndianMobileInput(value: string): string {
  return normalizeIndianMobile(value).slice(0, 10);
}

export function isValidIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));
}

export function toDialableIndianMobile(value: string): string {
  const normalized = normalizeIndianMobile(value);
  return isValidIndianMobile(normalized) ? `+91${normalized}` : "";
}
