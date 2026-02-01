'use client';

import { useState, useEffect } from 'react';
import { createCategory, createSubject } from '@/lib/admin';
import { fetchCategories as fetchCategoriesLib } from '@/lib/tutors';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, Loader2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create category form
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  // Create subject form
  const [showCreateSubject, setShowCreateSubject] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCategoriesLib();
      
      if (response.success) {
        setCategories(response.data);
      } else {
        setError(response.message || 'Failed to load categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(query) ||
        category.subjects?.some(subject => subject.name.toLowerCase().includes(query))
      );
    }

    setFilteredCategories(filtered);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setCreatingCategory(true);
      setError(null);
      const response = await createCategory(newCategoryName.trim());
      
      if (response.success) {
        setNewCategoryName('');
        setShowCreateCategory(false);
        await loadCategories();
      } else {
        setError(response.message || 'Failed to create category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateSubject = async (categoryId: string) => {
    if (!newSubjectName.trim()) {
      setError('Subject name is required');
      return;
    }

    try {
      setCreatingSubject(true);
      setError(null);
      const response = await createSubject(newSubjectName.trim(), categoryId);
      
      if (response.success) {
        setNewSubjectName('');
        setShowCreateSubject(null);
        await loadCategories();
      } else {
        setError(response.message || 'Failed to create subject');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreatingSubject(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Categories</h1>
          <p className="text-muted-foreground">Manage categories and subjects</p>
        </div>
        <Button onClick={() => setShowCreateCategory(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Create Category Form */}
      {showCreateCategory && (
        <div className="mb-6 border rounded-lg p-4 bg-muted/50">
          <h3 className="font-medium mb-3">Create New Category</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setError(null);
              }}
              className="flex-1"
            />
            <Button onClick={handleCreateCategory} disabled={creatingCategory}>
              {creatingCategory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateCategory(false);
                setNewCategoryName('');
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search categories or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No categories found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateSubject(showCreateSubject === category.id ? null : category.id)}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Subject
                </Button>
              </div>

              {/* Create Subject Form */}
              {showCreateSubject === category.id && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Create New Subject</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Subject name"
                      value={newSubjectName}
                      onChange={(e) => {
                        setNewSubjectName(e.target.value);
                        setError(null);
                      }}
                      className="flex-1"
                      size={32}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCreateSubject(category.id)}
                      disabled={creatingSubject}
                    >
                      {creatingSubject ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCreateSubject(null);
                        setNewSubjectName('');
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Subjects List */}
              {category.subjects && category.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {category.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subjects in this category</p>
              )}

              {/* TODO Note */}
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>TODO:</strong> Update and delete functionality for categories and subjects is not available in API.md. 
                  Currently only create operations are supported.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
