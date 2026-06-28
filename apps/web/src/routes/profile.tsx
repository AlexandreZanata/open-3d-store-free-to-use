import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Download, Heart, Star, Settings, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — AXIS" },
      { name: "description", content: "Your orders, downloads, favorites, and settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const rows = [
    { icon: Package, label: "Orders", hint: "12 orders" },
    { icon: Download, label: "Downloads", hint: "48 files" },
    { icon: Heart, label: "Favorites", hint: "23 saved" },
    { icon: Star, label: "Reviews", hint: "9 submitted" },
    { icon: Settings, label: "Settings", hint: "Account and notifications" },
  ];

  return (
    <AppShell showSearch={false} title="Profile">
      <section className="px-4 pt-6 pb-8 flex items-center gap-4">
        <div className="size-16 rounded-full bg-foreground text-background grid place-items-center text-lg font-semibold">
          MR
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold truncate">Marina Ribeiro</h2>
          <p className="text-sm text-muted-foreground truncate">marina@axis.studio</p>
        </div>
      </section>

      <ul className="mx-4 bg-surface ring-1 ring-hairline rounded-2xl divide-y divide-hairline shadow-soft overflow-hidden">
        {rows.map((r) => (
          <li key={r.label}>
            <Link to="/" className="flex items-center gap-4 px-4 h-16 press hover:bg-muted/50">
              <span className="size-9 grid place-items-center rounded-full bg-muted">
                <r.icon className="size-4 text-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs text-muted-foreground truncate">{r.hint}</div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-4 mt-8 text-center text-[11px] text-muted-foreground uppercase tracking-wider">
        AXIS v1.0
      </div>
    </AppShell>
  );
}
