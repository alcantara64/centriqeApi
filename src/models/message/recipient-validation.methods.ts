import { RecipientValidationDocument } from "./recipient-validation.types";



/**
 * Considers manual override and the fact that valid may not be set (for users this probably wont set vs customers)
 */
export function getIsTrueValid(this: RecipientValidationDocument): boolean {
  let result = true

  if(this.isManualOverride) {
    result = !!this.isValidOverride
  } else {
    result = this.isValid === undefined ? true : this.isValid
  }

  return result;
}



