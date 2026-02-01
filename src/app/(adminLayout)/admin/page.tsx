'use client';

import { useState, useEffect } from 'react';
import { fetchAdminUsers, fetchAdminBookings, fetchTutors } from '@/lib/admin';
import type { User } from '@/lib/auth';
import type { Booking } from '@/lib/types';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalTutors: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, bookingsResponse, tutorsResponse] = await Promise.all([
        fetchAdminUsers().catch(() => ({ success: false, data: [] })),
        fetchAdminBookings().catch(() => ({ success: false, data: [] })),
        fetchTutors({}).catch(() => ({ success: false, data: [] })),
      ]);

      const users = usersResponse.success ? usersResponse.data : [];
      const bookings = bookingsResponse.success ? bookingsResponse.data : [];
      const tutors = tutorsResponse.success && Array.isArray(tutorsResponse.data) ? tutorsResponse.data : [];

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.active).length,
        totalBookings: bookings.length,
        totalTutors: tutors.length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.activeUsers}</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Bookings</h3>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.totalBookings}</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Tutors</h3>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.totalTutors}</p>
          )}
        </div>
      </div>
    </div>
  );
}
