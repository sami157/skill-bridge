'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ArrowRight, Clock3, Sparkles, Users, Star, Loader2 } from "lucide-react";
import { Hero } from "@/components/Hero";
import { fetchTutors, fetchCategories } from '@/lib/tutors';
import type { TutorProfile, Category } from '@/lib/types';

const steps = [
  {
    title: "Tell us your goal",
    copy: "Pick what you want to master and your preferred pace.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Match with a tutor",
    copy: "We surface vetted tutors with ratings, availability, and focus areas.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Book & learn",
    copy: "Schedule a session, get tailored prep, and track progress together.",
    icon: <Clock3 className="h-5 w-5" />,
  },
];

export default function Home() {
  const [featuredTutors, setFeaturedTutors] = useState<TutorProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch top-rated tutors (limit to 3 for featured section)
        const tutorsResponse = await fetchTutors({ sortBy: 'rating_desc' });
        if (tutorsResponse.success && tutorsResponse.data) {
          setFeaturedTutors(tutorsResponse.data.slice(0, 3));
        }

        // Fetch categories
        const categoriesResponse = await fetchCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-neutral-100 via-white to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 text-foreground">
      <Hero />

      {/* About */}
      <section className="border-y border-border bg-card/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">About</p>
            <h2 className="text-3xl font-semibold text-foreground">Human tutors, crafted pathways.</h2>
            <p className="text-muted-foreground leading-relaxed">
              We hand-match learners with mentors who have built the things you want to build. Expect structured milestones, async feedback between sessions, and clear next steps after every meeting.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard title="Curated experts" copy="Every tutor is vetted for teaching clarity and recent industry work." />
              <FeatureCard title="Built-in accountability" copy="Weekly goals, check-ins, and progress snapshots keep you moving." />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground mb-2">Snapshot</p>
            <dl className="space-y-4 text-foreground">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Average response</dt>
                <dd className="font-semibold">&lt; 3 hours</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Session length</dt>
                <dd className="font-semibold">45–90 mins</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Project support</dt>
                <dd className="font-semibold">Included</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Cancel policy</dt>
                <dd className="font-semibold">Flexible, 12h</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
            <h2 className="text-3xl font-semibold text-foreground">Book a tutor in three steps.</h2>
            <p className="text-muted-foreground mt-2 max-w-xl">No endless browsing. Tell us what you need, get matched, and start learning this week.</p>
          </div>
          <a href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground">
            View your dashboard
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {step.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tutors */}
      <section className="border-t border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Featured tutors</p>
              <h2 className="text-3xl font-semibold text-foreground">Handpicked mentors ready this week.</h2>
            </div>
            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
            >
              See all tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredTutors.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featuredTutors.map((tutor) => {
                const mainSubject = tutor.subjects?.[0];
                const subjectName = mainSubject?.name || 'Tutoring';
                const categoryName = mainSubject?.category?.name || '';
                return (
                  <article
                    key={tutor.id}
                    className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {categoryName && (
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{categoryName}</p>
                        )}
                        <h3 className="mt-2 text-xl font-semibold text-foreground">{tutor.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{subjectName}</p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        {tutor.rating.toFixed(1)}
                      </span>
                    </div>
                    {tutor.bio && (
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">{tutor.bio}</p>
                    )}
                    <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> 
                        {tutor.reviewCount} {tutor.reviewCount === 1 ? 'review' : 'reviews'}
                      </span>
                      <Link
                        href={`/tutors/${tutor.id}`}
                        className="inline-flex items-center gap-1 text-foreground font-medium hover:underline"
                      >
                        Book session <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 text-center py-12">
              <p className="text-muted-foreground">No featured tutors available at the moment.</p>
              <Link href="/tutors" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground">
                Browse all tutors
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Categories</p>
            <h2 className="text-3xl font-semibold text-foreground">Choose a track to get started.</h2>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
          >
            Start matching
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm animate-pulse">
                <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/tutors?categoryId=${category.id}`}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.subjects?.length || 0} {category.subjects?.length === 1 ? 'subject' : 'subjects'} available
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-8 text-center py-12">
            <p className="text-muted-foreground">No categories available at the moment.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.07),transparent_32%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.06),transparent_30%)]" aria-hidden />
        <div className="container relative mx-auto px-4 py-16 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/80">Get started</p>
            <h2 className="text-3xl font-semibold">Book your first session in minutes.</h2>
            <p className="text-primary-foreground/90">Create a profile, tell us your goal, and we will line up tutors with availability this week.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="rounded-lg bg-primary-foreground px-5 py-3 font-semibold text-primary shadow-md shadow-primary-foreground/10 transition hover:-translate-y-0.5">
              Create account
            </Link>
            <Link href="/login" className="rounded-lg border border-primary-foreground/30 px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:border-primary-foreground">
              I already have an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{copy}</p>
    </div>
  );
}
