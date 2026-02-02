'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";
import { BASE_URL } from "@/lib/api";

interface Login1Props {
  heading?: string;
  buttonText?: string;
  signupText?: string;
  signupUrl?: string;
  className?: string;
}

const Login1 = ({
  heading = "Login",
  buttonText = "Login",
  signupText = "Need an account?",
  signupUrl = "/register",
  className,
}: Login1Props) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const text = await verifyRes.text();
      let data: { success?: boolean; token?: string; message?: string } = {};
      try {
        data = text?.trim() ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (!data?.success || !data?.token) {
        setError(typeof data?.message === "string" ? data.message : "Invalid email or password");
        showToast.error(typeof data?.message === "string" ? data.message : "Invalid email or password");
        return;
      }
      const result = await signIn("credentials", {
        token: data.token,
        redirect: false,
      });

      if (result?.ok && result?.error === undefined) {
        showToast.success("Welcome back!");
        const session = await getSession();
        const role = (session?.user as { role?: string })?.role;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "TUTOR") {
          router.push("/tutor/dashboard");
        } else if (role === "STUDENT") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        const errorMsg =
          typeof result?.error === "string"
            ? result.error
            : "Login failed. Please check your credentials.";
        setError(errorMsg);
        showToast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={cn("h-screen w-screen bg-muted", className)}>
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-sm min-w-sm flex-col items-center gap-y-4 rounded-lg border border-muted bg-background px-6 py-8 shadow-md"
          >
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
            
            <div className="w-full">
              <Input
                type="email"
                placeholder="Email"
                className={cn("text-sm", emailError && "border-destructive")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                onBlur={() => validateEmail(email)}
                disabled={loading}
                required
              />
              {emailError && (
                <p className="mt-1 text-xs text-destructive">{emailError}</p>
              )}
            </div>

            <div className="w-full">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={cn("text-sm pr-10", passwordError && "border-destructive")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  onBlur={() => validatePassword(password)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-destructive">{passwordError}</p>
              )}
            </div>

            {error && (
              <div className="w-full rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-2xl"
              disabled={loading}
            >
              {loading ? 'Logging in...' : buttonText}
            </Button>
          </form>
          
          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>{signupText}</p>
            <Link
              href={signupUrl}
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login1 };
