const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]{1,79}$/u;
const CNIC_PATTERN = /^\d{5}-\d{7}-\d$/;

/** Pakistani CNIC: 5 digits, 7 digits, then 1 digit. */
export function formatCnic(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export interface CandidateFieldErrors {
  name?: string;
  candidateId?: string;
}

export function normalizeCandidateName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeCandidateId(candidateId: string): string {
  return formatCnic(candidateId);
}

export function validateCandidate(
  name: string,
  candidateId: string,
): CandidateFieldErrors {
  const errors: CandidateFieldErrors = {};
  const trimmedName = normalizeCandidateName(name);
  if (!trimmedName) {
    errors.name = "Enter the full name.";
  } else if (!NAME_PATTERN.test(trimmedName)) {
    errors.name =
      "Use letters, spaces, hyphens, or apostrophes (at least 2 characters).";
  }

  const normalizedId = normalizeCandidateId(candidateId);
  if (!normalizedId) {
    errors.candidateId = "Enter the CNIC number.";
  } else if (!CNIC_PATTERN.test(normalizedId)) {
    errors.candidateId = "Enter a CNIC number as 54203-2422982-7.";
  }

  return errors;
}
