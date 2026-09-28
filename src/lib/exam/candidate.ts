const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]{1,79}$/u;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/;

export interface CandidateFieldErrors {
  name?: string;
  candidateId?: string;
}

export function normalizeCandidateName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeCandidateId(candidateId: string): string {
  return candidateId.trim().replace(/\s+/g, "").toUpperCase();
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

  const trimmedId = candidateId.trim();
  if (!trimmedId) {
    errors.candidateId = "Enter the roll or candidate number.";
  } else if (!ID_PATTERN.test(trimmedId)) {
    errors.candidateId =
      "Use letters, numbers, and hyphens only, up to 32 characters.";
  }

  return errors;
}
