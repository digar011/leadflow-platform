"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/utils/validation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setServerError(null);

    // Validate email
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md" padding="lg">
        <CardContent className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-success/20">
            <CheckCircle className="h-8 w-8 text-status-success" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Check your email
          </h2>
          <p className="text-text-secondary">
            We&apos;ve sent password reset instructions to{" "}
            <span className="font-medium text-text-primary">{email}</span>.
            Please check your inbox and follow the link to reset your password.
          </p>
          <div className="mt-6 space-y-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setSuccess(false)}
            >
              Try another email
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" padding="lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <CardDescription>
          No worries! Enter your email and we&apos;ll send you reset instructions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 rounded-lg bg-status-error/10 p-3 text-sm text-status-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setServerError(null);
            }}
            error={error || undefined}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Send reset instructions
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-white/5 pt-6">
        <Link href="/login">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
