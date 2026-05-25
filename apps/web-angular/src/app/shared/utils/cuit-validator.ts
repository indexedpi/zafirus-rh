// CUIT format: XX-YYYYYYYY-Z where:
//   XX = prefix (20/27 male, 23 female, 30/33/34 companies)
//   YYYYYYYY = DNI or company number (for individuals: YYMMDD of birth)
//   Z = check digit

export interface CuitValidation {
  valid: boolean;
  error?: string;
}

export function validateCuit(cuit: string): CuitValidation {
  const cleaned = cuit.replace(/[^0-9]/g, '');

  if (cleaned.length !== 11) {
    return { valid: false, error: 'El CUIT debe tener 11 dígitos.' };
  }

  const prefix = parseInt(cleaned.slice(0, 2));
  if (![20, 23, 24, 27, 30, 33, 34].includes(prefix)) {
    return { valid: false, error: 'El prefijo del CUIT no es válido.' };
  }

  // Check digit validation
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * multipliers[i];
  }
  const mod = sum % 11;
  const expectedCheckDigit = mod === 0 ? 0 : mod === 1 ? 9 : 11 - mod; // Special: mod=1 → check digit is 9

  if (expectedCheckDigit !== parseInt(cleaned[10])) {
    return { valid: false, error: 'El dígito verificador del CUIT no es correcto.' };
  }

  // Age validation for individuals (prefix 20/23/24/27)
  if ([20, 23, 24, 27].includes(prefix)) {
    const middle = cleaned.slice(2, 10);
    // For individuals, the middle part often contains birth date
    // Try to extract: if it starts with valid year digits
    const possibleYear = parseInt(middle.slice(0, 2));
    const possibleMonth = parseInt(middle.slice(2, 4));
    const possibleDay = parseInt(middle.slice(4, 6));

    if (possibleMonth >= 1 && possibleMonth <= 12 && possibleDay >= 1 && possibleDay <= 31) {
      const year = possibleYear >= 0 && possibleYear <= 25 ? 2000 + possibleYear : 1900 + possibleYear;
      const birthDate = new Date(year, possibleMonth - 1, possibleDay);
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        return { valid: false, error: 'La fecha de nacimiento indica una persona menor de 16 años.' };
      }
      if (age > 120) {
        return { valid: false, error: 'La fecha de nacimiento parece inválida (más de 120 años).' };
      }
      if (birthDate > now) {
        return { valid: false, error: 'La fecha de nacimiento no puede ser futura.' };
      }
    }
  }

  return { valid: true };
}

export function formatCuit(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, '').slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 10) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
}

export function validateCbu(cbu: string): CuitValidation {
  const cleaned = cbu.replace(/[^0-9]/g, '');

  if (cleaned.length !== 22) {
    return { valid: false, error: 'El CBU debe tener 22 dígitos numéricos.' };
  }

  return { valid: true };
}

export function isValidEmail(email: string): boolean {
  const value = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function todayIsoDate(referenceDate = new Date()): string {
  const local = new Date(referenceDate.getTime() - (referenceDate.getTimezoneOffset() * 60000));
  return local.toISOString().slice(0, 10);
}

export function isFutureDate(value: string, referenceDate = new Date()): boolean {
  if (!value) return false;
  return value > todayIsoDate(referenceDate);
}

export function isPastDate(value: string, referenceDate = new Date()): boolean {
  if (!value) return false;
  return value < todayIsoDate(referenceDate);
}
