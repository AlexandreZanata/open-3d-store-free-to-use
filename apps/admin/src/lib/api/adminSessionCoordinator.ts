type AdminSessionCoordinator = {
  tryRefresh: () => Promise<boolean>;
  onSessionExpired: () => void;
};

let coordinator: AdminSessionCoordinator | null = null;

export function registerAdminSessionCoordinator(next: AdminSessionCoordinator): () => void {
  coordinator = next;
  return () => {
    if (coordinator === next) {
      coordinator = null;
    }
  };
}

export async function tryRefreshAdminSession(): Promise<boolean> {
  if (!coordinator) {
    return false;
  }
  return coordinator.tryRefresh();
}

export function notifyAdminSessionExpired(): void {
  coordinator?.onSessionExpired();
}

const SESSION_RETRY_SKIP_PREFIXES = ["/auth/login", "/auth/logout", "/auth/refresh"] as const;

export function shouldRetryAdminSession(path: string): boolean {
  return !SESSION_RETRY_SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));
}
