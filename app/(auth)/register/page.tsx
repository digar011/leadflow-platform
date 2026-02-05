"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { registerSchema, type RegisterInput } from "@/lib/utils/validation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate form
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setSuccess(true);
      } else if (data.session) {
        // User is signed in, redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
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
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-medium text-text-primary">{formData.email}</span>.
            Please click the link to verify your account.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" padding="lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Get started with LeadFlow today
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
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            leftIcon={<User className="h-4 w-4" />}
            autoComplete="name"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase, and number"
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            required
          />

          <div className="text-sm text-text-secondary">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-gold hover:text-gold-light">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-gold hover:text-gold-light">
              Privacy Policy
            </Link>
            .
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-white/5 pt-6">
        <p className="text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-gold hover:text-gold-light transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
