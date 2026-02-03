'use client';

import { useState, useEffect } from 'react';
import {
  createCategory,
  createSubject,
  updateCategory,
  deleteCategory,
  updateSubject,
  deleteSubject,
} from '@/lib/admin';
import { fetchCategories as fetchCategoriesLib } from '@/lib/tutors';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, Loader2, Pencil, Trash2 } from 'lucide-react';

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

  // Edit category
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Edit subject
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [updatingSubject, setUpdatingSubject] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

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

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) {
      setError('Category name is required');
      return;
    }
    try {
      setUpdatingCategory(true);
      setError(null);
      const response = await updateCategory(id, editCategoryName.trim());
      if (response.success) {
        setEditingCategoryId(null);
        setEditCategoryName('');
        await loadCategories();
      } else {
        setError(response.message || 'Failed to update category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setUpdatingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? It must have no subjects.')) return;
    try {
      setDeletingCategoryId(id);
      setError(null);
      const response = await deleteCategory(id);
      if (response.success) {
        await loadCategories();
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleUpdateSubject = async (subjectId: string) => {
    if (!editSubjectName.trim()) {
      setError('Subject name is required');
      return;
    }
    try {
      setUpdatingSubject(true);
      setError(null);
      const response = await updateSubject(subjectId, { name: editSubjectName.trim() });
      if (response.success) {
        setEditingSubjectId(null);
        setEditSubjectName('');
        await loadCategories();
      } else {
        setError(response.message || 'Failed to update subject');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subject');
    } finally {
      setUpdatingSubject(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Delete this subject? Tutors using it will lose this subject.')) return;
    try {
      setDeletingSubjectId(subjectId);
      setError(null);
      const response = await deleteSubject(subjectId);
      if (response.success) {
        await loadCategories();
      } else {
        setError(response.message || 'Failed to delete subject');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject');
    } finally {
      setDeletingSubjectId(null);
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
                {editingCategoryId === category.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="max-w-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateCategory(category.id)}
                      disabled={updatingCategory}
                    >
                      {updatingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingCategoryId(null); setEditCategoryName(''); setError(null); }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                )}
                <div className="flex items-center gap-2">
                  {editingCategoryId !== category.id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setEditCategoryName(category.name);
                          setError(null);
                        }}
                        disabled={!!editingCategoryId}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingCategoryId === category.id || (category.subjects?.length ?? 0) > 0}
                        title={(category.subjects?.length ?? 0) > 0 ? 'Remove all subjects first' : 'Delete category'}
                      >
                        {deletingCategoryId === category.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-destructive" />
                        )}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateSubject(showCreateSubject === category.id ? null : category.id)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Subject
                  </Button>
                </div>
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
                      className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {editingSubjectId === subject.id ? (
                        <>
                          <Input
                            value={editSubjectName}
                            onChange={(e) => setEditSubjectName(e.target.value)}
                            placeholder="Subject name"
                            className="h-7 w-32 text-sm"
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleUpdateSubject(subject.id)}
                            disabled={updatingSubject}
                          >
                            {updatingSubject ? <Loader2 className="h-3 w-3 animate-spin" /> : '✓'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => { setEditingSubjectId(null); setEditSubjectName(''); setError(null); }}
                          >
                            ✕
                          </Button>
                        </>
                      ) : (
                        <>
                          {subject.name}
                          <button
                            type="button"
                            onClick={() => { setEditingSubjectId(subject.id); setEditSubjectName(subject.name); setError(null); }}
                            className="opacity-70 hover:opacity-100 p-0.5"
                            aria-label="Edit subject"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(subject.id)}
                            disabled={deletingSubjectId === subject.id}
                            className="opacity-70 hover:opacity-100 text-destructive p-0.5"
                            aria-label="Delete subject"
                          >
                            {deletingSubjectId === subject.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subjects in this category</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
