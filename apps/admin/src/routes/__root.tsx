import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { RouterContext } from "@/router";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: PendingRoot,
});

function RootComponent() {
  return <Outlet />;
}

function PendingRoot() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <LoadingSpinner />
    </div>
  );
}
