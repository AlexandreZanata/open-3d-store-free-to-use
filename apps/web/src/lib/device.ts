const DEVICE_STORAGE_KEY = "print3d-device-id";

export function getOrCreateDeviceId(): string {
  if (typeof localStorage === "undefined") {
    return crypto.randomUUID();
  }
  const existing = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  localStorage.setItem(DEVICE_STORAGE_KEY, created);
  return created;
}

export function deviceHeaders(): HeadersInit {
  return { "X-Device-Id": getOrCreateDeviceId() };
}
