'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTutorBookings, fetchMyTutorProfile, completeBooking } from '@/lib/tutors';
import { useAuth } from '@/hooks/useAuth';
import type { Booking, TutorProfileDetail } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star, TrendingUp, CheckCircle2, Loader2, User, RefreshCw } from 'lucide-react';
import { showToast } from '@/lib/toast';

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tutorProfile, setTutorProfile] = useState<TutorProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [myProfileResponse, tutorBookingsResponse] = await Promise.all([
        fetchMyTutorProfile(),
        fetchTutorBookings(),
      ]);
      if (myProfileResponse.success && myProfileResponse.data) {
        setTutorProfile(myProfileResponse.data);
      }
      setBookings(tutorBookingsResponse.success && Array.isArray(tutorBookingsResponse.data) ? tutorBookingsResponse.data : []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bookingId: string) => {
    if (!confirm('Mark this session as completed?')) {
      return;
    }

    try {
      setCompletingId(bookingId);
      const response = await completeBooking(bookingId);
      
      if (response.success) {
        showToast.success('Session marked as completed!');
        await loadData();
      } else {
        const errorMsg = response.message || 'Failed to complete booking';
        showToast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(errorMsg);
    } finally {
      setCompletingId(null);
    }
  };

  // Upcoming = tutor's bookings (GET /bookings/tutor) that are CONFIRMED and not yet ended
  const now = new Date();
  const upcoming = bookings
    .filter(
      (booking) =>
        booking.status === 'CONFIRMED' && new Date(booking.endTime) > now
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const completed = bookings.filter(booking => booking.status === 'COMPLETED');
  const totalEarnings = completed.reduce((sum, booking) => {
    if (!booking.tutor) return sum;
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours * booking.tutor.pricePerHour;
  }, 0);

  const tutorRating = tutorProfile?.rating ?? 0;
  const reviewCount = tutorProfile?.reviewCount ?? 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tutor Dashboard</h1>
        <p className="text-muted-foreground">Manage your sessions and track your performance</p>
        {!loading && !tutorProfile && (
          <div className="mt-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-sm text-amber-800 dark:text-amber-200">Create your tutor profile to receive bookings and show up in search.</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/tutor/profile">Create profile</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
            <Star className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{tutorRating.toFixed(1)}</p>
              <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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
            {upcoming.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {booking.student?.image ? (
                        <img
                          src={booking.student.image}
                          alt={booking.student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{booking.student?.name || 'Student'}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(booking.startTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-15">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {booking.status}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleComplete(booking.id)}
                      disabled={completingId === booking.id}
                    >
                      {completingId === booking.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No upcoming sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}
