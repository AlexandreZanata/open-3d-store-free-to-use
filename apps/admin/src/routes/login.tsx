import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useAdminAuth } from "@/auth/useAdminAuth";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { BrandMark } from "@/components/BrandMark";
import { ADMIN_APP_TITLE } from "@/lib/brand";
import { formatApiErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const user = await context.auth.ensureSession();
    if (user) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      await navigate({ to: "/" });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError("Invalid email or password.");
      } else if (caught instanceof ApiError) {
        setError(formatApiErrorMessage(caught.problem.detail, caught.problem.title));
      } else {
        setError("Unable to sign in. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-muted px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <BrandMark size="lg" className="mb-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {ADMIN_APP_TITLE}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your admin credentials to access the dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
