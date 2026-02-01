'use client';

import { useState, useEffect } from 'react';
import { fetchBookings, cancelBooking, createReview } from '@/lib/tutors';
import { useAuth } from '@/hooks/useAuth';
import type { Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Clock, X, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';

export default function StudentBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchBookings();
      
      if (response.success) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const response = await cancelBooking(bookingId);
      
      if (response.success) {
        // Reload bookings to get updated status
        await loadBookings();
      } else {
        alert(response.message || 'Failed to cancel booking');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitReview = async (bookingId: string) => {
    // Validate booking is COMPLETED
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      setReviewError('Booking not found');
      return;
    }

    if (booking.status !== 'COMPLETED') {
      setReviewError('Only completed bookings can be reviewed');
      return;
    }

    if (booking.review) {
      setReviewError('You have already reviewed this booking');
      return;
    }

    // Validate rating
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a rating between 1 and 5');
      return;
    }

    try {
      setReviewingId(bookingId);
      setReviewError(null);
      
      const response = await createReview({
        bookingId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      
      if (response.success) {
        setShowReviewForm(null);
        setReviewRating(5);
        setReviewComment('');
        setReviewError(null);
        // Reload bookings to get updated review
        await loadBookings();
      } else {
        // Handle specific error messages
        const errorMessage = response.message || 'Failed to submit review';
        
        // Check for duplicate review error
        if (errorMessage.toLowerCase().includes('already exists') || 
            errorMessage.toLowerCase().includes('already reviewed')) {
          setReviewError('You have already reviewed this booking');
          // Reload to get the existing review
          await loadBookings();
        } else if (errorMessage.toLowerCase().includes('must be completed')) {
          setReviewError('Only completed bookings can be reviewed');
        } else {
          setReviewError(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setReviewError(errorMessage);
    } finally {
      setReviewingId(null);
    }
  };

  // Separate bookings into upcoming and past
  const now = new Date();
  const upcoming = bookings.filter(booking => {
    const startTime = new Date(booking.startTime);
    return startTime >= now && booking.status !== 'CANCELLED';
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const past = bookings.filter(booking => {
    const startTime = new Date(booking.startTime);
    return startTime < now || booking.status === 'CANCELLED';
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const calculatePrice = (booking: Booking) => {
    if (!booking.tutor) return 0;
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours * booking.tutor.pricePerHour;
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {booking.tutor?.user.image ? (
              <img
                src={booking.tutor.user.image}
                alt={booking.tutor.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {booking.tutor?.user.name.charAt(0).toUpperCase() || 'T'}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">{booking.tutor?.user.name || 'Tutor'}</h3>
              {booking.tutor && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{booking.tutor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(booking.startTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </span>
        </div>
        <div className="text-sm font-semibold">
          Total: ${calculatePrice(booking).toFixed(2)}
        </div>
      </div>

      {/* Review Display */}
      {booking.review && (
        <div className="mb-3 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < booking.review!.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          {booking.review.comment && (
            <p className="text-sm text-muted-foreground">{booking.review.comment}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {booking.status === 'CONFIRMED' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCancel(booking.id)}
            disabled={cancellingId === booking.id}
          >
            {cancellingId === booking.id ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            )}
          </Button>
        )}
        {booking.status === 'COMPLETED' && !booking.review && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowReviewForm(showReviewForm === booking.id ? null : booking.id);
              setReviewError(null);
              setReviewRating(5);
              setReviewComment('');
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Leave Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm === booking.id && booking.status === 'COMPLETED' && !booking.review && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-3">Write a Review</h4>
          
          {/* Error Message */}
          {reviewError && (
            <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{reviewError}</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Rating <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => {
                      setReviewRating(rating);
                      setReviewError(null);
                    }}
                    className="focus:outline-none transition-transform hover:scale-110"
                    disabled={reviewingId === booking.id}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Select a rating from 1 to 5 stars</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => {
                  setReviewComment(e.target.value);
                  setReviewError(null);
                }}
                placeholder="Share your experience..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                rows={3}
                disabled={reviewingId === booking.id}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReview(booking.id)}
                disabled={reviewingId === booking.id || !reviewRating}
              >
                {reviewingId === booking.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Review
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReviewForm(null);
                  setReviewRating(5);
                  setReviewComment('');
                  setReviewError(null);
                }}
                disabled={reviewingId === booking.id}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadBookings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {/* Upcoming Bookings */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
          <Button asChild>
            <a href="/tutors">Browse Tutors</a>
          </Button>
        </div>
      )}
    </div>
  );
}
