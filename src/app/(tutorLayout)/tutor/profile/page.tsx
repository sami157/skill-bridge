'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchMyTutorProfile, createTutorProfile, updateTutorProfile, fetchCategories } from '@/lib/tutors';
import type { TutorProfileDetail, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';

export default function TutorProfilePage() {
  const { user } = useAuth();
  const [tutorProfile, setTutorProfile] = useState<TutorProfileDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    pricePerHour: '',
    selectedSubjects: [] as string[],
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const [myProfileResponse, categoriesResponse] = await Promise.all([
        fetchMyTutorProfile(),
        fetchCategories(),
      ]);

      if (myProfileResponse.success && myProfileResponse.data) {
        setTutorProfile(myProfileResponse.data);
        setIsCreateMode(false);
        setFormData({
          bio: myProfileResponse.data.bio || '',
          pricePerHour: myProfileResponse.data.pricePerHour.toString(),
          selectedSubjects: myProfileResponse.data.subjects.map(s => s.id),
        });
      } else {
        setTutorProfile(null);
        setIsCreateMode(true);
        setFormData({ bio: '', pricePerHour: '', selectedSubjects: [] });
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (err) {
      console.error('Failed to load data', err);
      setError('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId],
    }));
  };

  const handleSave = async () => {
    if (!user) {
      setError('User not found');
      return;
    }

    const price = parseFloat(formData.pricePerHour);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price per hour');
      return;
    }

    if (formData.selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      if (isCreateMode) {
        const response = await createTutorProfile({
          bio: formData.bio.trim() || undefined,
          pricePerHour: price,
          subjectsIds: formData.selectedSubjects,
        });
        if (response.success && response.data) {
          setSuccess(true);
          setTutorProfile(response.data as TutorProfileDetail);
          setIsCreateMode(false);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          setError(response.message || 'Failed to create profile');
        }
      } else {
        const response = await updateTutorProfile({
          userId: user.id,
          bio: formData.bio.trim() || undefined,
          pricePerHour: price,
          subjectsIds: formData.selectedSubjects,
        });
        if (response.success) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          if (response.data) {
            setTutorProfile(response.data as TutorProfileDetail);
          }
        } else {
          setError(response.message || 'Failed to update profile');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Tutor Profile</h1>
        <div className="p-6 rounded-lg border bg-muted/50">
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Tutor Profile</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Get all subjects from categories
  const allSubjects = categories.flatMap(cat => cat.subjects || []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{isCreateMode ? 'Create Tutor Profile' : 'Edit Tutor Profile'}</h1>
        <p className="text-muted-foreground">{isCreateMode ? 'Set up your tutor profile to start receiving bookings' : 'Update your profile information'}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className="text-sm font-medium mb-2 block">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => {
              setFormData({ ...formData, bio: e.target.value });
              setError(null);
            }}
            placeholder="Tell students about your teaching experience and expertise..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]"
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-1">Describe your teaching style and background</p>
        </div>

        {/* Price Per Hour */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Price Per Hour ($) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.pricePerHour}
            onChange={(e) => {
              setFormData({ ...formData, pricePerHour: e.target.value });
              setError(null);
            }}
            placeholder="50.00"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">Set your hourly rate</p>
        </div>

        {/* Subjects */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Subjects You Teach <span className="text-destructive">*</span>
          </label>
          <div className="space-y-4">
            {categories.map(category => {
              const categorySubjects = category.subjects || [];
              if (categorySubjects.length === 0) return null;

              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySubjects.map(subject => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => handleSubjectToggle(subject.id)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          formData.selectedSubjects.includes(subject.id)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted border-input'
                        }`}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {formData.selectedSubjects.length === 0 && (
            <p className="text-xs text-destructive mt-2">Please select at least one subject</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || formData.selectedSubjects.length === 0}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreateMode ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isCreateMode ? 'Create Profile' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
