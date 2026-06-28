import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPlaceholderPage,
});

function SettingsPlaceholderPage() {
  return (
    <>
      <PageHeader title="Settings" description="Admin preferences placeholder." />
      <EmptyState
        title="Settings not configured"
        description="Account and environment settings will be defined in a later phase."
      />
    </>
  );
}
