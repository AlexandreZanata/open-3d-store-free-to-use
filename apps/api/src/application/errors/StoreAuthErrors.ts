export class EmailConflictError extends Error {
  constructor() {
    super("Email already registered");
    this.name = "EmailConflictError";
  }
}

export class RegistrationLimitError extends Error {
  constructor() {
    super("Registration limit reached for this IP or device");
    this.name = "RegistrationLimitError";
  }
}
