"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/theme-toggle";

type MenuItem = {
  title: string;
  href: string;
};

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
}

const navLinks: MenuItem[] = [
  { title: "Home", href: "/" },
  { title: "Tutors", href: "/tutors" },
];

export function Navbar({ user, onLogout }: NavbarProps) {
  const pathname = usePathname();

  const renderLinks = () => (
    <NavigationMenu>
      <NavigationMenuList className="space-x-1">
        {navLinks.map((item) => {
          const active = pathname === item.href;
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Skill Bridge
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2">{renderLinks()}</div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-foreground">
                  {user.name || user.email}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</span>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background">
            <ModeToggle />
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background">
            <ModeToggle />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  Skill Bridge
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-2">
                  {navLinks.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium transition",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>

                {user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-foreground">
                      <div className="font-medium">{user.name || user.email}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</div>
                    </div>
                    <Button className="w-full" variant="outline" onClick={onLogout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
