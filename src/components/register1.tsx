'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signUp } from "@/lib/auth";
import { showToast } from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";
import { BASE_URL } from "@/lib/api";

interface Register1Props {
  heading?: string;
  buttonText?: string;
  signupText?: string;
  signupUrl?: string;
  className?: string;
}

type Role = 'STUDENT' | 'TUTOR';

const Register1 = ({
  heading = "Register",
  buttonText = "Register",
  signupText = "Already have an account?",
  signupUrl = "/login",
  className,
}: Register1Props) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) {
          return 'Name is required';
        }
        if (value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        return null;
      case 'email':
        if (!value) {
          return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        return null;
      case 'confirmPassword':
        if (!value) {
          return 'Please confirm your password';
        }
        if (value !== password) {
          return 'Passwords do not match';
        }
        return null;
      case 'image':
        if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
          return 'Please enter a valid URL';
        }
        return null;
      default:
        return null;
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[field]) {
        delete newErrors[field];
      }
      return newErrors;
    });
    setError(null);

    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        if (confirmPassword) {
          const confirmError = validateField('confirmPassword', confirmPassword);
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            if (confirmError) {
              newErrors.confirmPassword = confirmError;
            } else {
              delete newErrors.confirmPassword;
            }
            return newErrors;
          });
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'image':
        setImage(value);
        break;
    }
  };

  const handleBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const nameError = validateField('name', name);
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    const imageError = image ? validateField('image', image) : null;

    if (nameError || emailError || passwordError || confirmPasswordError || imageError) {
      setFieldErrors({
        ...(nameError && { name: nameError }),
        ...(emailError && { email: emailError }),
        ...(passwordError && { password: passwordError }),
        ...(confirmPasswordError && { confirmPassword: confirmPasswordError }),
        ...(imageError && { image: imageError }),
      });
      return;
    }

    setLoading(true);

    try {
      const response = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        image: image.trim() || undefined,
        role: role,
      });

      if (response.success) {
        const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const verifyText = await verifyRes.text();
        let verifyData: { success?: boolean; token?: string } = {};
        try {
          verifyData = verifyText?.trim() ? JSON.parse(verifyText) : {};
        } catch {
          verifyData = {};
        }
        const token = verifyData?.success ? verifyData.token : null;
        const signInResult = token
          ? await signIn("credentials", { token, redirect: false })
          : { ok: false as const, error: "Could not sign in" };

        if (signInResult?.ok && !signInResult?.error) {
          showToast.success(`Account created successfully! Welcome, ${name.trim()}!`);
          const session = await getSession();
          const userRole = (session?.user as { role?: string })?.role;
          if (userRole === 'ADMIN') {
            router.push('/admin');
          } else if (userRole === 'TUTOR') {
            router.push('/tutor/dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
        router.refresh();
      } else {
        const errorMsg = response.message || 'Registration failed. Please try again.';
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
                type="text"
                placeholder="Name"
                className={cn("text-sm", fieldErrors.name && "border-destructive")}
                value={name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={(e) => handleBlur('name', e.target.value)}
                disabled={loading}
                required
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="w-full">
              <Input
                type="email"
                placeholder="Email"
                className={cn("text-sm", fieldErrors.email && "border-destructive")}
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                disabled={loading}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="w-full">
              <label className="mb-2 block text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={loading}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                required
              >
                <option value="STUDENT">Student</option>
                <option value="TUTOR">Tutor</option>
              </select>
            </div>

            <div className="w-full">
              <Input
                type="url"
                placeholder="Profile Picture URL (optional)"
                className={cn("text-sm", fieldErrors.image && "border-destructive")}
                value={image}
                onChange={(e) => handleFieldChange('image', e.target.value)}
                onBlur={(e) => handleBlur('image', e.target.value)}
                disabled={loading}
              />
              {fieldErrors.image && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.image}</p>
              )}
            </div>

            <div className="w-full">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={cn("text-sm pr-10", fieldErrors.password && "border-destructive")}
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={(e) => handleBlur('password', e.target.value)}
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
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div className="w-full">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={cn("text-sm pr-10", fieldErrors.confirmPassword && "border-destructive")}
                  value={confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.confirmPassword}</p>
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
              {loading ? 'Registering...' : buttonText}
            </Button>
          </form>
          
          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>{signupText}</p>
            <Link
              href={signupUrl}
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Register1 };
