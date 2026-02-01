'use client';

import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';

interface TutorCard {
  initials: string;
  name: string;
  role: string;
  rating: number;
  price: number;
  nextSession: string;
}

const tutorCards: TutorCard[] = [
  {
    initials: 'AR',
    name: 'Alex Rivera',
    role: 'React Mentor',
    rating: 4.9,
    price: 45,
    nextSession: 'Today 7:30 PM',
  },
  {
    initials: 'SK',
    name: 'Sarah Kim',
    role: 'UI Designer',
    rating: 4.8,
    price: 50,
    nextSession: 'Today 6:00 PM',
  },
];

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const floatingAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

export function HeroVisual() {
  return (
    <div className="hidden lg:flex items-center justify-center relative h-full min-h-[500px] w-full">
      {/* Subtle radial gradient glow behind panel */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-30"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.05), transparent 70%)',
        }}
      />
      
      {/* Main panel container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full max-w-sm"
      >
        <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 shadow-xl">
          {/* Panel header */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Featured Tutors
            </h3>
            <p className="text-xs text-muted-foreground">
              Available for sessions today
            </p>
          </div>

          {/* Cards stack */}
          <div className="space-y-4">
            {tutorCards.map((tutor, index) => (
              <motion.div
                key={tutor.initials}
                variants={cardVariants}
                animate={floatingAnimation}
                transition={{
                  ...floatingAnimation.transition,
                  delay: index * 0.5,
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className="relative rounded-xl border border-border bg-background/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card content */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-base border-2 border-border">
                    {tutor.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h4 className="font-semibold text-foreground text-base leading-tight">
                        {tutor.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {tutor.role}
                      </p>
                    </div>

                    {/* Rating and Price */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-foreground">
                          {tutor.rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm font-semibold text-foreground">
                        ${tutor.price}/hr
                      </span>
                    </div>

                    {/* Next session */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Next session: <span className="font-medium text-foreground">{tutor.nextSession}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
