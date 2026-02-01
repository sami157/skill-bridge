'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchTutorById, createBooking } from '@/lib/tutors';
import { useAuth } from '@/hooks/useAuth';
import type { TutorProfileDetail, BookingRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Calendar, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

function TutorDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const id = params.id as string;

  const [tutor, setTutor] = useState<TutorProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<{ start: string; end: string } | null>(null);

  // Time slots (1 hour slots from 9 AM to 9 PM)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  useEffect(() => {
    const loadTutor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTutorById(id);
        
      if (response.success && response.data) {
        setTutor(response.data);
      } else {
        const errorMsg = response.message || 'Tutor not found';
        setError(errorMsg);
        showToast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load tutor';
      setError(errorMsg);
      showToast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTutor();
    }
  }, [id]);

  const handleBooking = async () => {
    if (!user || !tutor || !selectedDate || !selectedStartTime || !selectedEndTime) {
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const startTime = new Date(`${selectedDate}T${selectedStartTime}:00`);
      const endTime = new Date(`${selectedDate}T${selectedEndTime}:00`);

      if (startTime >= endTime) {
        setBookingError('End time must be after start time');
        setBookingLoading(false);
        return;
      }

      const booking: BookingRequest = {
        studentId: user.id,
        tutorId: tutor.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const response = await createBooking(booking);

      if (response.success && response.data) {
        setBookingSuccess(true);
        setBookedSlot({
          start: startTime.toLocaleString(),
          end: endTime.toLocaleString(),
        });
        showToast.success('Booking confirmed successfully!');
        // Reset form
        setSelectedDate('');
        setSelectedStartTime('');
        setSelectedEndTime('');
      } else {
        const errorMsg = response.message || 'Failed to create booking';
        setBookingError(errorMsg);
        showToast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setBookingError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Get reviews from bookingsAsTutor
  const reviews = tutor?.bookingsAsTutor
    ?.filter(booking => booking.review)
    .map(booking => booking.review!)
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }) || [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tutor Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The tutor you are looking for does not exist.'}</p>
          <Button asChild>
            <Link href="/tutors">Browse Tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Group subjects by category
  const subjectsByCategory = tutor.subjects.reduce((acc, subject) => {
    const categoryName = subject.category?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(subject);
    return acc;
  }, {} as Record<string, typeof tutor.subjects>);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tutor Header */}
          <div className="flex items-start gap-6">
            {tutor.user.image ? (
              <img
                src={tutor.user.image}
                alt={tutor.user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <span className="text-3xl font-semibold">
                  {tutor.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{tutor.user.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{tutor.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  ({tutor.reviewCount} {tutor.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
                <span className="text-lg font-bold">${tutor.pricePerHour}/hour</span>
              </div>
              {tutor.user.email && (
                <p className="text-sm text-muted-foreground">{tutor.user.email}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {tutor.bio && (
            <div>
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-muted-foreground whitespace-pre-line">{tutor.bio}</p>
            </div>
          )}

          {/* Subjects & Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Subjects & Categories</h2>
            <div className="space-y-4">
              {Object.entries(subjectsByCategory).map(([categoryName, subjects]) => (
                <div key={categoryName}>
                  <h3 className="font-medium text-muted-foreground mb-2">{categoryName}</h3>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                      <span
                        key={subject.id}
                        className="bg-muted px-3 py-1 rounded-full text-sm"
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={review.id || index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      {review.createdAt && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Widget Sidebar */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Book a Session</h2>

            {/* Booking Success */}
            {bookingSuccess && bookedSlot && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Booking Confirmed!</h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                  Your session has been booked successfully.
                </p>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p><strong>Start:</strong> {bookedSlot.start}</p>
                  <p><strong>End:</strong> {bookedSlot.end}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                    setBookingSuccess(false);
                    setBookedSlot(null);
                  }}
                >
                  Book Another Session
                </Button>
              </div>
            )}

            {/* Auth States */}
            {!authLoading && (
              <>
                {!user ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Login to book a session with this tutor</p>
                    <Button asChild className="w-full">
                      <Link href="/login">Login</Link>
                    </Button>
                  </div>
                ) : role !== 'STUDENT' ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Only students can book sessions</p>
                    {role === 'TUTOR' && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/tutor/dashboard">Go to Tutor Dashboard</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Booking Form */
                  <div className="space-y-4">
                    {/* Date Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setBookingError(null);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={bookingLoading}
                        required
                      />
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Start Time</label>
                      <select
                        value={selectedStartTime}
                        onChange={(e) => {
                          setSelectedStartTime(e.target.value);
                          setBookingError(null);
                        }}
                        disabled={bookingLoading || !selectedDate}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select start time</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">End Time</label>
                      <select
                        value={selectedEndTime}
                        onChange={(e) => {
                          setSelectedEndTime(e.target.value);
                          setBookingError(null);
                        }}
                        disabled={bookingLoading || !selectedDate || !selectedStartTime}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select end time</option>
                        {timeSlots
                          .filter(slot => {
                            if (!selectedStartTime) return true;
                            return slot > selectedStartTime;
                          })
                          .map(slot => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Booking Error */}
                    {bookingError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{bookingError}</p>
                      </div>
                    )}

                    {/* Price Display */}
                    {selectedStartTime && selectedEndTime && (
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span>
                            {(() => {
                              const start = parseInt(selectedStartTime.split(':')[0]);
                              const end = parseInt(selectedEndTime.split(':')[0]);
                              const hours = end - start;
                              return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold mt-1">
                          <span>Total:</span>
                          <span>
                            ${(() => {
                              const start = parseInt(selectedStartTime.split(':')[0]);
                              const end = parseInt(selectedEndTime.split(':')[0]);
                              const hours = end - start;
                              return (hours * tutor.pricePerHour).toFixed(2);
                            })()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <Button
                      onClick={handleBooking}
                      disabled={bookingLoading || !selectedDate || !selectedStartTime || !selectedEndTime}
                      className="w-full"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Session
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TutorDetailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    }>
      <TutorDetailContent />
    </Suspense>
  );
}
