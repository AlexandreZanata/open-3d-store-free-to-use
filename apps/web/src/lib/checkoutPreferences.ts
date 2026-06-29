const GUEST_NAME_KEY = "print3d-checkout-name";
const GUEST_NOTE_KEY = "print3d-checkout-note";

export function readGuestCheckoutName(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(GUEST_NAME_KEY) ?? "";
}

export function writeGuestCheckoutName(name: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    window.localStorage.removeItem(GUEST_NAME_KEY);
    return;
  }
  window.localStorage.setItem(GUEST_NAME_KEY, trimmed);
}

export function readGuestCheckoutNote(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(GUEST_NOTE_KEY) ?? "";
}

export function writeGuestCheckoutNote(note: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const trimmed = note.trim();
  if (trimmed.length === 0) {
    window.localStorage.removeItem(GUEST_NOTE_KEY);
    return;
  }
  window.localStorage.setItem(GUEST_NOTE_KEY, trimmed);
}

export function clearGuestCheckoutPreferences(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(GUEST_NAME_KEY);
  window.localStorage.removeItem(GUEST_NOTE_KEY);
}

export function readGuestCheckoutNoteForAuth(): string | null {
  const note = readGuestCheckoutNote();
  return note.length > 0 ? note : null;
}
