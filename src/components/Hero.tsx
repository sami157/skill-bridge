import Link from "next/link";
import { ArrowRight, BookOpen, Star, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-100 via-white to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 text-foreground">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.06),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(0,0,0,0.05),transparent_32%),radial-gradient(circle_at_40%_80%,rgba(0,0,0,0.05),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.03),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.02),transparent_32%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.02),transparent_30%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-16 sm:px-6 lg:gap-10 lg:py-24">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15">
            <Star className="h-4 w-4 text-amber-400" />
            <span>Find a tutor who moves at your speed</span>
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Level up with tutors who design paths around{" "}
            <span className="underline decoration-muted-foreground">your goals</span>.
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Skill Bridge connects you with curated experts for focused 1:1 sessions, portfolio-ready projects, and interview prep in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-primary-foreground shadow-md shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
            >
              Browse tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 px-5 py-3 text-foreground backdrop-blur transition hover:-translate-y-0.5 hover:border-foreground"
            >
              Join as student
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 pt-2 text-sm text-muted-foreground sm:gap-8">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> 4.9 average rating
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> 5k+ sessions booked
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Project-first learning
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

