import { randomId, isValidUuid } from "@/lib/randomId";

const VISITOR_STORAGE_KEY = "print3d-visitor-id";

export function getOrCreateVisitorId(): string {
  if (typeof localStorage === "undefined") {
    return "00000000-0000-4000-8000-000000000000";
  }
  const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (existing && isValidUuid(existing)) {
    return existing;
  }
  const id = randomId();
  localStorage.setItem(VISITOR_STORAGE_KEY, id);
  return id;
}

export function visitorHeaders(): HeadersInit {
  return { "X-Visitor-Id": getOrCreateVisitorId() };
}
