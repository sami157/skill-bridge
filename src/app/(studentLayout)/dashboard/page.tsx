'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBookings } from '@/lib/tutors';
import { useAuth } from '@/hooks/useAuth';
import type { Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetchBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const now = new Date();
  const upcoming = bookings.filter(
    booking => new Date(booking.startTime) >= now && booking.status !== 'CANCELLED'
  );
  const completed = bookings.filter(booking => booking.status === 'COMPLETED');
  const totalSpent = bookings
    .filter(booking => booking.status === 'COMPLETED' && booking.tutor)
    .reduce((sum, booking) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours * (booking.tutor?.pricePerHour || 0);
    }, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="text-muted-foreground">Here's an overview of your activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Upcoming Sessions</h3>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{upcoming.length}</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Completed Sessions</h3>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{completed.length}</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Upcoming Bookings Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          <Button asChild variant="outline">
            <Link href="/dashboard/bookings">View All</Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.slice(0, 3).map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {booking.tutor?.user.image ? (
                        <img
                          src={booking.tutor.user.image}
                          alt={booking.tutor.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {booking.tutor?.user.name.charAt(0).toUpperCase() || 'T'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{booking.tutor?.user.name || 'Tutor'}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(booking.startTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-13">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No upcoming sessions</p>
            <Button asChild>
              <Link href="/tutors">Browse Tutors</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button asChild variant="outline" className="h-auto py-6">
          <Link href="/tutors">
            <div className="text-left">
              <div className="font-semibold mb-1">Find a Tutor</div>
              <div className="text-sm text-muted-foreground">Browse available tutors</div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6">
          <Link href="/dashboard/bookings">
            <div className="text-left">
              <div className="font-semibold mb-1">View All Bookings</div>
              <div className="text-sm text-muted-foreground">Manage your sessions</div>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
