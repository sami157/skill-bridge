'use client';

import { useState, useEffect } from 'react';
import { fetchAdminUsers, updateAdminUser } from '@/lib/admin';
import type { User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Ban, CheckCircle, Loader2, User as UserIcon } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAdminUsers();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.active === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleActive = async (user: User) => {
    const action = user.active ? 'ban' : 'unban';
    const confirmMessage = user.active
      ? `Are you sure you want to ban ${user.name}?`
      : `Are you sure you want to unban ${user.name}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setUpdatingId(user.id);
      const response = await updateAdminUser(user.id, { active: !user.active });
      
      if (response.success) {
        await loadUsers();
      } else {
        alert(response.message || `Failed to ${action} user`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
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
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadUsers}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
        <p className="text-muted-foreground">View and manage user accounts</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="TUTOR">Tutor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-muted capitalize">
                        {user.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {user.active ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant={user.active ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(user)}
                        disabled={updatingId === user.id}
                      >
                        {updatingId === user.id ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            {user.active ? 'Banning...' : 'Unbanning...'}
                          </>
                        ) : user.active ? (
                          <>
                            <Ban className="mr-2 h-3 w-3" />
                            Ban
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Unban
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
