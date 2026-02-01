import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface Login1Props {
  heading?: string;
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
  className?: string;
}

const Register1 = ({
  heading = "Register",
  buttonText = "Register",
  signupText = "Already have an account?",
  signupUrl = `${process.env.CLIENT_ROOT_URL}/login`,
  className,
}: Login1Props) => {
  // const handleRegister = () => {
  //   const { data, error } = await authClient.signUp.email({
  //     email, // user email address
  //     password, // user password -> min 8 characters by default
  //     name, // user display name
  //     image, // User image URL (optional)
  //     callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
  //   }, {
  //     onRequest: (ctx) => {
  //       //show loading
  //     },
  //     onSuccess: (ctx) => {
  //       //redirect to the dashboard or sign in page
  //     },
  //     onError: (ctx) => {
  //       // display the error message
  //       alert(ctx.error.message);
  //     },
  //   });
  // }
  return (
    <section className={cn("h-screen w-screen bg-muted", className)}>
      <div className="flex h-full items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <div className="flex w-full max-w-sm min-w-sm flex-col items-center gap-y-4 rounded-lg border border-muted bg-background px-6 py-8 shadow-md">
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
            <Input
              type="text"
              placeholder="Name"
              className="text-sm"
              required
            />
            <Input
              type="email"
              placeholder="Email"
              className="text-sm"
              required
            />
            <Input
              type="url"
              placeholder="Profile Picture URL (optional)"
              className="text-sm"
            />
            <Input
              type="password"
              placeholder="Password"
              className="text-sm"
              required
            />
            <Button type="submit" className="w-full rounded-2xl">
              {buttonText}
            </Button>
          </div>
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
