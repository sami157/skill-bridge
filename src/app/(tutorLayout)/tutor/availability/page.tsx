'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchMyTutorProfile, updateTutorProfile } from '@/lib/tutors';
import type { TutorProfileDetail, AvailabilitySlot } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Save, Loader2, Calendar, Clock } from 'lucide-react';

export default function TutorAvailabilityPage() {
  const { user } = useAuth();
  const [tutorProfile, setTutorProfile] = useState<TutorProfileDetail | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadTutorProfile();
  }, [user]);

  const loadTutorProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchMyTutorProfile();

      if (response.success && response.data) {
        setTutorProfile(response.data);
        if (response.data.availability) {
          const parsedSlots = parseAvailability(response.data.availability);
          setSlots(parsedSlots);
        } else {
          setSlots([]);
        }
      } else {
        setTutorProfile(null);
        setError('Create your tutor profile first to set availability.');
      }
    } catch (err) {
      console.error('Failed to load tutor profile:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  // Parse availability object to slots array
  const parseAvailability = (availability: Record<string, unknown>): AvailabilitySlot[] => {
    const slots: AvailabilitySlot[] = [];
    
    // If availability is an array of slots
    if (Array.isArray(availability)) {
      return availability as AvailabilitySlot[];
    }
    
    // If availability is an object with date keys
    Object.entries(availability).forEach(([date, timeSlots]) => {
      if (Array.isArray(timeSlots)) {
        timeSlots.forEach((slot: { startTime: string; endTime: string }, index: number) => {
          slots.push({
            id: `${date}-${index}`,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        });
      }
    });
    
    return slots;
  };

  // Convert slots array to availability object for API
  const slotsToAvailability = (slots: AvailabilitySlot[]): Record<string, unknown> => {
    const availability: Record<string, { startTime: string; endTime: string }[]> = {};
    
    slots.forEach(slot => {
      if (!availability[slot.date]) {
        availability[slot.date] = [];
      }
      availability[slot.date].push({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    });
    
    return availability;
  };

  const checkOverlap = (newSlot: AvailabilitySlot, existingSlots: AvailabilitySlot[]): boolean => {
    return existingSlots.some(slot => {
      if (slot.date !== newSlot.date) return false;
      
      const newStart = timeToMinutes(newSlot.startTime);
      const newEnd = timeToMinutes(newSlot.endTime);
      const existingStart = timeToMinutes(slot.startTime);
      const existingEnd = timeToMinutes(slot.endTime);
      
      // Check if new slot overlaps with existing slot
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleAddSlot = () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      setError('Please fill in all fields');
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      setError('End time must be after start time');
      return;
    }

    const slot: AvailabilitySlot = {
      id: `${newSlot.date}-${newSlot.startTime}-${newSlot.endTime}`,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    };

    if (checkOverlap(slot, slots)) {
      setError('This slot overlaps with an existing slot');
      return;
    }

    setSlots([...slots, slot].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    }));
    
    setNewSlot({ date: '', startTime: '', endTime: '' });
    setError(null);
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(slots.filter(slot => slot.id !== id));
  };

  const handleSave = async () => {
    if (!user || !tutorProfile) {
      setError('Tutor profile not found');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const availability = slotsToAvailability(slots);
      
      const response = await updateTutorProfile({
        userId: user.id,
        availability,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (response.data) {
          setTutorProfile(response.data);
        }
      } else {
        setError(response.message || 'Failed to save availability');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Manage Availability</h1>
        <div className="p-6 rounded-lg border bg-muted/50">
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Manage Availability</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!tutorProfile && error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Manage Availability</h1>
        <div className="p-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-amber-800 dark:text-amber-200 mb-4">{error}</p>
          <Button asChild>
            <Link href="/tutor/profile">Create tutor profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
        <p className="text-muted-foreground">Add and manage your available time slots</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">Availability saved successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Add New Slot Form */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Time Slot</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Input
              type="date"
              value={newSlot.date}
              onChange={(e) => {
                setNewSlot({ ...newSlot, date: e.target.value });
                setError(null);
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Start Time</label>
            <Input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => {
                setNewSlot({ ...newSlot, startTime: e.target.value });
                setError(null);
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Time</label>
            <Input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => {
                setNewSlot({ ...newSlot, endTime: e.target.value });
                setError(null);
              }}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddSlot} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Slot
            </Button>
          </div>
        </div>
      </div>

      {/* Slots List */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Availability</h2>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {slots.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No availability slots added yet</p>
            <p className="text-sm text-muted-foreground mt-2">Add slots above to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatDate(slot.date)}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSlot(slot.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
