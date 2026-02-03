'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUser, updateProfile, type User as AuthUser } from '@/lib/auth';
import { getAuthToken, setAuth } from '@/lib/auth-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Loader2, User } from 'lucide-react';
import { showToast } from '@/lib/toast';

export default function StudentProfilePage() {
  const { user: authUser, refetch } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    image: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await getCurrentUser();
      if (user) {
        setProfile(user);
        setFormData({
          name: user.name ?? '',
          phone: user.phone ?? '',
          image: user.image ?? '',
        });
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const result = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        image: formData.image.trim() || undefined,
      });
      if (result.success && result.user) {
        setProfile(result.user);
        const token = getAuthToken();
        if (token) {
          setAuth(token, {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            image: result.user.image ?? undefined,
            emailVerified: result.user.emailVerified,
          });
        }
        refetch();
        showToast.success('Profile updated');
      } else {
        setError(result.message ?? 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile && !authUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  const user = profile ?? authUser;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="max-w-xl space-y-6">
        {/* Avatar / image preview */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
            {formData.image ? (
              <img
                src={formData.image}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Enter an image URL to show a profile photo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium mb-2 block">Name</label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              required
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium mb-2 block">Email</label>
            <Input
              id="email"
              type="email"
              value={user.email ?? ''}
              disabled
              className="max-w-md bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone</label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Optional"
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium mb-2 block">Profile image URL</label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
              placeholder="https://..."
              className="max-w-md"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
