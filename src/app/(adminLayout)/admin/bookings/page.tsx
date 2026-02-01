'use client';

import { useState, useEffect } from 'react';
import { fetchAdminBookings } from '@/lib/admin';
import type { Booking } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Clock, BookOpen } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAdminBookings();
      
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

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.student?.name.toLowerCase().includes(query) ||
        booking.student?.email?.toLowerCase().includes(query) ||
        booking.tutor?.user.name.toLowerCase().includes(query) ||
        booking.tutor?.user.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredBookings(filtered);
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
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
        <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadBookings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Bookings</h1>
        <p className="text-muted-foreground">View and manage all bookings</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by student or tutor name/email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tutor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {booking.student?.image ? (
                          <img
                            src={booking.student.image}
                            alt={booking.student.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {booking.student?.name.charAt(0).toUpperCase() || 'S'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{booking.student?.name || 'Student'}</p>
                          <p className="text-xs text-muted-foreground">{booking.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {booking.tutor?.user.image ? (
                          <img
                            src={booking.tutor.user.image}
                            alt={booking.tutor.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {booking.tutor?.user.name.charAt(0).toUpperCase() || 'T'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{booking.tutor?.user.name || 'Tutor'}</p>
                          <p className="text-xs text-muted-foreground">{booking.tutor?.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(booking.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>
    </div>
  );
}
