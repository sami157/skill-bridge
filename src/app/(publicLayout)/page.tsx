import { ArrowRight, BookOpen, Clock3, Sparkles, Star, Users } from "lucide-react";

const tutors = [
  {
    name: "Amira Khan",
    subject: "Data Structures & Algorithms",
    badge: "Top Rated",
    rating: 4.9,
    students: 320,
    blurb: "Ex-FAANG engineer turning complex topics into clear mental models.",
  },
  {
    name: "Leo Martinez",
    subject: "Product Design & Figma",
    badge: "Portfolio Ready",
    rating: 4.8,
    students: 210,
    blurb: "Design sprints, critique sessions, and hands-on component libraries.",
  },
  {
    name: "Priya Desai",
    subject: "Machine Learning",
    badge: "Career Switch",
    rating: 4.9,
    students: 265,
    blurb: "Structured ML roadmap with weekly projects and interview prep.",
  },
];

const categories = [
  "Software Engineering",
  "Data & AI",
  "Product & Design",
  "Career Coaching",
  "Business & Ops",
  "Marketing & Growth",
];

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
  return (
    <div className="bg-gradient-to-br from-neutral-100 via-white to-neutral-200 text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.07),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(0,0,0,0.06),transparent_32%),radial-gradient(circle_at_40%_80%,rgba(0,0,0,0.05),transparent_30%)]" aria-hidden />
        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-2 text-sm shadow-lg shadow-neutral-900/10">
              <Sparkles className="h-4 w-4" />
              <span>Find a tutor who moves at your speed</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-neutral-950">
              Level up with tutors who design paths around <span className="underline decoration-neutral-400">your goals</span>.
            </h1>
            <p className="text-lg text-neutral-600 max-w-xl">
              Skill Bridge connects you with curated experts for focused 1:1 sessions, portfolio-ready projects, and interview prep in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/tutors"
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-white shadow-md shadow-neutral-900/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-900/25"
              >
                Browse tutors
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-5 py-3 text-neutral-900 bg-white/70 backdrop-blur transition hover:-translate-y-0.5 hover:border-neutral-900"
              >
                Join as student
              </a>
            </div>
            <div className="flex gap-8 pt-4 text-sm text-neutral-600">
              <span className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> 4.9 average rating</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> 5k+ sessions booked</span>
              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Project-first learning</span>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-y border-neutral-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-16 grid gap-10 md:grid-cols-3 items-start">
          <div className="md:col-span-2 space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">About</p>
            <h2 className="text-3xl font-semibold text-neutral-950">Human tutors, crafted pathways.</h2>
            <p className="text-neutral-600 leading-relaxed">
              We hand-match learners with mentors who have built the things you want to build. Expect structured milestones, async feedback between sessions, and clear next steps after every meeting.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard title="Curated experts" copy="Every tutor is vetted for teaching clarity and recent industry work." />
              <FeatureCard title="Built-in accountability" copy="Weekly goals, check-ins, and progress snapshots keep you moving." />
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500 mb-2">Snapshot</p>
            <dl className="space-y-4 text-neutral-900">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Average response</dt>
                <dd className="font-semibold">&lt; 3 hours</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Session length</dt>
                <dd className="font-semibold">45–90 mins</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Project support</dt>
                <dd className="font-semibold">Included</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-500">Cancel policy</dt>
                <dd className="font-semibold">Flexible, 12h</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">How it works</p>
            <h2 className="text-3xl font-semibold text-neutral-950">Book a tutor in three steps.</h2>
            <p className="text-neutral-600 mt-2 max-w-xl">No endless browsing. Tell us what you need, get matched, and start learning this week.</p>
          </div>
          <a href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-800">
            View your dashboard
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
                  {step.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-950">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tutors */}
      <section className="border-t border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between gap-4 flex-col md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Featured tutors</p>
              <h2 className="text-3xl font-semibold text-neutral-950">Handpicked mentors ready this week.</h2>
            </div>
            <a
              href="/tutors"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-800"
            >
              See all tutors
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {tutors.map((tutor) => (
              <article
                key={tutor.name}
                className="group relative rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 via-white to-neutral-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-[radial-gradient(circle_at_70%_20%,rgba(0,0,0,0.04),transparent_45%)] opacity-0 transition group-hover:opacity-100" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{tutor.badge}</p>
                    <h3 className="mt-2 text-xl font-semibold text-neutral-950">{tutor.name}</h3>
                    <p className="text-sm text-neutral-600">{tutor.subject}</p>
                  </div>
                  <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white shadow-sm">{tutor.rating} ★</span>
                </div>
                <p className="mt-4 text-sm text-neutral-700 leading-relaxed">{tutor.blurb}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-neutral-600">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {tutor.students} students</span>
                  <a
                    href="/tutors"
                    className="inline-flex items-center gap-1 text-neutral-900 font-medium"
                  >
                    Book session <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between gap-4 flex-col md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Categories</p>
            <h2 className="text-3xl font-semibold text-neutral-950">Choose a track to get started.</h2>
          </div>
          <a
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-800"
          >
            Start matching
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-xl border border-neutral-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-950">{category}</h3>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </div>
              <p className="mt-2 text-sm text-neutral-600">Handpicked tutors, live projects, and feedback built for this track.</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-neutral-200 bg-neutral-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.07),transparent_32%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.06),transparent_30%)]" aria-hidden />
        <div className="container relative mx-auto px-4 py-16 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-300">Get started</p>
            <h2 className="text-3xl font-semibold">Book your first session in minutes.</h2>
            <p className="text-neutral-200">Create a profile, tell us your goal, and we will line up tutors with availability this week.</p>
          </div>
          <div className="flex gap-3">
            <a href="/register" className="rounded-lg bg-white px-5 py-3 font-semibold text-neutral-950 shadow-md shadow-white/10 transition hover:-translate-y-0.5">
              Create account
            </a>
            <a href="/login" className="rounded-lg border border-white/30 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:border-white">
              I already have an account
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-base font-semibold text-neutral-950">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{copy}</p>
    </div>
  );
}
