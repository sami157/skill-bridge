'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { showToast } from "@/lib/toast";

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
      const response = await signIn(email, password);

      if (response.success && response.data?.user) {
        const user = response.data.user;
        showToast.success(`Welcome back, ${user.name || user.email}!`);
        
        // Redirect based on role
        if (user.role === 'STUDENT') {
          router.push('/dashboard');
        } else if (user.role === 'TUTOR') {
          router.push('/tutor/dashboard');
        } else if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        
        // Refresh the page to update auth state
        router.refresh();
      } else {
        const errorMsg = response.message || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        showToast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
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
              <Input
                type="password"
                placeholder="Password"
                className={cn("text-sm", passwordError && "border-destructive")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                onBlur={() => validatePassword(password)}
                disabled={loading}
                required
              />
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
